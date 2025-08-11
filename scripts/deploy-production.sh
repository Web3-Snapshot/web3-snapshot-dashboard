#!/bin/bash
set -e

# Get AWS region from environment or instance metadata
get_aws_region() {
    if [[ -n "${AWS_DEFAULT_REGION:-}" ]]; then
        echo "$AWS_DEFAULT_REGION"
        return 0
    fi

    if command -v curl >/dev/null 2>&1; then
        local region
        region=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null)
        if [[ -n "$region" ]]; then
            echo "$region"
            return 0
        fi
    fi

    echo "Error: Unable to determine AWS region. Set AWS_DEFAULT_REGION environment variable." >&2
    exit 1
}

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "DRY RUN MODE - No changes will be made"
    echo
fi

# Execute function - runs command or shows it
execute() {
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would execute: $*"
    else
        echo "Executing: $*"
        "$@"
    fi
}

# Check and install required dependencies
check_dependencies() {
    echo "Checking required dependencies..."

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo "AWS CLI not found. Installing..."
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would install unzip and AWS CLI"
        else
            # Install unzip if missing
            if ! command -v unzip &> /dev/null; then
                echo "Installing unzip..."
                sudo apt-get update -qq
                sudo apt-get install -y unzip
            fi

            # Detect architecture and install AWS CLI v2
            ARCH=$(uname -m)
            if [[ "$ARCH" == "x86_64" ]]; then
                AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
            elif [[ "$ARCH" == "aarch64" ]]; then
                AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip"
            else
                echo "Error: Unsupported architecture: $ARCH"
                exit 1
            fi

            echo "Installing AWS CLI for architecture: $ARCH"
            curl "$AWS_CLI_URL" -o "awscliv2.zip"
            unzip awscliv2.zip
            sudo ./aws/install
            rm -rf aws awscliv2.zip
            echo "AWS CLI installed successfully"
        fi
    else
        echo "AWS CLI found: $(aws --version)"
    fi

    # Check Docker and run bootstrap if missing
    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null 2>&1; then
        echo "Docker or Docker Compose not found. Running bootstrap script..."
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would run bootstrap script"
        else
            # Get script directory
            SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
            if [[ -f "$SCRIPT_DIR/bootstrap-server.sh" ]]; then
                "$SCRIPT_DIR/bootstrap-server.sh"
                echo "Bootstrap completed. Please log out and back in, then re-run this script."
                exit 0
            else
                echo "Error: Bootstrap script not found at $SCRIPT_DIR/bootstrap-server.sh"
                echo "Please install Docker and Docker Compose manually."
                exit 1
            fi
        fi
    else
        echo "Docker found: $(docker --version)"
        echo "Docker Compose found: $(docker compose version)"
    fi
}

DEPLOYMENT_DIR="$HOME/web3-snapshot"

# Define required SSM parameters
declare -A required_ssm_params=(
    ["REDIS_URL"]="/w3s/production/redis-url"
    ["COINGECKO_API_URL"]="/w3s/production/coingecko-api-url"
    ["COINGECKO_API_KEY"]="/w3s/production/coingecko-api-key"
    ["AWS_ACCOUNT"]="/w3s/production/aws-account"
    ["AWS_REGION"]="/w3s/production/aws-region"
    ["DOMAIN"]="/w3s/production/domain"
    ["EMAIL"]="/w3s/production/email"
    ["S3_DEPLOYMENT_BUCKET"]="/w3s/production/s3-deployment-bucket"
)

# Define required S3 files
declare -A required_s3_files=(
    ["docker-compose.production.yml"]="production/docker-compose.production.yml"
    ["docker-compose.certbot.yml"]="production/docker-compose.certbot.yml"
    ["backend/.env"]="production/backend.env"
    ["scripts/renew-certificate.sh"]="scripts/renew-certificate.sh"
    ["nginx/default.conf"]="production/nginx-default.conf"
)

# Static environment variables
declare -A static_env_vars=(
    ["ENVIRONMENT"]="production"
    ["CERTIFICATE_RENEWAL_LOG"]="/var/log/certificate_renewal.log"
    ["AWS_FRONTEND_REPOSITORY"]="w3s-frontend"
    ["AWS_DATA_FETCHER_REPOSITORY"]="w3s-data-fetcher"
    ["AWS_BACKEND_REPOSITORY"]="w3s-backend"
)

echo "Starting deployment..."

# Get AWS region
AWS_REGION=$(get_aws_region)
echo "Using AWS region: $AWS_REGION"

# Check dependencies first
check_dependencies

# Get S3 bucket name from SSM
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would get S3 bucket from SSM: /w3s/production/s3-deployment-bucket"
    S3_BUCKET="<S3_BUCKET_NAME>"
else
    S3_BUCKET=$(aws ssm get-parameter --name "/w3s/production/s3-deployment-bucket" --query 'Parameter.Value' --output text --region "$AWS_REGION")
fi
echo "Using S3 bucket: $S3_BUCKET"

# Create deployment directory
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would create directories: $DEPLOYMENT_DIR/{backend,data_fetcher,scripts}"
    echo "[DRY RUN] Would change to directory: $DEPLOYMENT_DIR"
else
    mkdir -p $DEPLOYMENT_DIR/{backend,data_fetcher,scripts}
    cd $DEPLOYMENT_DIR
fi

# Download files from S3
echo "Downloading configuration files..."
for local_file in "${!required_s3_files[@]}"; do
    s3_path="${required_s3_files[$local_file]}"
    echo "Downloading $local_file from s3://$S3_BUCKET/$s3_path"
    execute aws s3 cp "s3://$S3_BUCKET/$s3_path" "./$local_file"
done

# Make certificate script executable by all users
if [[ "$DRY_RUN" == "false" ]]; then
    chmod 755 scripts/renew-certificate.sh
fi

# Generate backend secret key and process template
echo "Processing backend environment template..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would generate random secret key for backend"
    echo "[DRY RUN] Would process backend/.env template"
else
    # Generate a random secret key
    BACKEND_SECRET_KEY=$(openssl rand -hex 32)
    # Process the template
    sed "s/{{BACKEND_SECRET_KEY}}/$BACKEND_SECRET_KEY/g" backend/.env > backend/.env.tmp && mv backend/.env.tmp backend/.env
fi

# Generate .env.production from SSM parameters
echo "Generating .env.production from SSM..."
env_content=""

# Add static variables
for var_name in "${!static_env_vars[@]}"; do
    env_content+="$var_name=${static_env_vars[$var_name]}\n"
done

# Add SSM parameters
for var_name in "${!required_ssm_params[@]}"; do
    ssm_path="${required_ssm_params[$var_name]}"
    if [[ "$var_name" == "COINGECKO_API_KEY" ]]; then
        # Use --with-decryption for SecureString
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would get parameter: $ssm_path (with decryption)"
            value="<ENCRYPTED_VALUE>"
        else
            value=$(aws ssm get-parameter --name "$ssm_path" --with-decryption --query 'Parameter.Value' --output text --region "$AWS_REGION")
        fi
    else
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would get parameter: $ssm_path"
            value="<SSM_VALUE>"
        else
            value=$(aws ssm get-parameter --name "$ssm_path" --query 'Parameter.Value' --output text --region "$AWS_REGION")
        fi
    fi
    env_content+="$var_name=$value\n"
done

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would create .env.production with content:"
    echo -e "$env_content"
    echo "[DRY RUN] Would create server README.md"
else
    echo -e "$env_content" > .env.production

    # Create server README with deployment info
    cat > README.md << EOF
# Web3 Snapshot Dashboard - Server

## Quick Commands

### Deployment
\`\`\`bash
# Re-deploy application
/opt/web3-snapshot/scripts/deploy-production.sh

# Deploy with dry-run
/opt/web3-snapshot/scripts/deploy-production.sh --dry-run
\`\`\`

### SSL Certificates
\`\`\`bash
# Renew certificates
/opt/web3-snapshot/scripts/renew-certificate.sh

# Check certificate status
docker compose -f docker-compose.certbot.yml run --rm certbot certificates
\`\`\`

### Container Management
\`\`\`bash
# Check container status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs

# Restart services
docker compose -f docker-compose.production.yml restart

# Stop services
docker compose -f docker-compose.production.yml down

# Start services
docker compose -f docker-compose.production.yml up -d
\`\`\`

### Logs
- Certificate renewal: \`/var/log/certificate-renewal.log\`
- Data fetching: \`/var/log/web3snapshot-fetch.log\`
- Application logs: \`docker compose -f docker-compose.production.yml logs\`

### Configuration
- Environment: \`.env.production\`
- Domain: \`$(grep DOMAIN .env.production 2>/dev/null | cut -d= -f2 || echo "<not set>")\`
- Region: \`$(grep AWS_REGION .env.production 2>/dev/null | cut -d= -f2 || echo "<not set>")\`
EOF
fi

# Login to ECR
echo "Logging into ECR..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would get AWS account from SSM: /w3s/production/aws-account"
    echo "[DRY RUN] Would get AWS region from SSM: /w3s/production/aws-region"
    echo "[DRY RUN] Would login to ECR: <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com"
else
    AWS_ACCOUNT_VALUE=$(aws ssm get-parameter --name "/w3s/production/aws-account" --query 'Parameter.Value' --output text --region "$AWS_REGION")
    AWS_REGION_VALUE=$(aws ssm get-parameter --name "/w3s/production/aws-region" --query 'Parameter.Value' --output text --region "$AWS_REGION")
    aws ecr get-login-password --region "$AWS_REGION_VALUE" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_VALUE.dkr.ecr.$AWS_REGION_VALUE.amazonaws.com"
fi

# Generate SSL certificates if they don't exist
echo "Checking SSL certificates..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would check for SSL certificates and generate if needed"
else
    # Check if certificates exist
    if ! docker volume ls | grep -q "web3-snapshot_certbot_conf"; then
        echo "SSL certificates not found. Generating initial certificates..."
        # Create .env file for certbot (it expects this)
        if [ -f ".env.production" ]; then
            cp .env.production .env
        fi

        # Generate initial certificates using certbot setup
        echo "Starting temporary nginx for certificate generation..."
        docker compose -f docker-compose.certbot.yml up -d nginx80

        # Wait a moment for nginx to start
        sleep 5

        # Generate certificate using EMAIL and DOMAIN from environment
        echo "Generating SSL certificate for $DOMAIN..."
        docker compose -f docker-compose.certbot.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ --email "$EMAIL" --agree-tos --no-eff-email -d "$DOMAIN"

        # Stop temporary nginx
        docker compose -f docker-compose.certbot.yml down

        echo "SSL certificates generated successfully."
    else
        echo "SSL certificates already exist."
    fi
fi

# Load environment variables for Docker Compose
if [[ "$DRY_RUN" == "false" ]]; then
    set -o allexport
    source .env.production
    set +o allexport
fi

# Pull latest images and restart
echo "Pulling latest images and restarting services..."
execute docker compose -f docker-compose.production.yml pull
execute docker compose -f docker-compose.production.yml down
execute docker compose -f docker-compose.production.yml up -d

echo "Deployment completed successfully!"
