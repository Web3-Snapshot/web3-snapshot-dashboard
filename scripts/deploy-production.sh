#!/bin/bash
set -e

# Path configuration
APP_DIR="/opt/web3-snapshot"
COMPOSE_DIR="$APP_DIR/compose"
CONFIG_DIR="$APP_DIR/config"
SCRIPTS_DIR="$APP_DIR/scripts"
COMPOSE_FILE_PROD="$COMPOSE_DIR/docker-compose.production.yml"
COMPOSE_FILE_CERTBOT="$COMPOSE_DIR/docker-compose.certbot.yml"
ENV_FILE="$CONFIG_DIR/.env.production"
BACKEND_ENV_FILE="$CONFIG_DIR/backend/.env"
NGINX_CONF_FILE="$COMPOSE_DIR/nginx/default.conf"
README_FILE="$APP_DIR/README.md"
CURRENT_USER=$(whoami)

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

# Define required S3 files (relative to APP_DIR)
declare -A required_s3_files=(
    ["$COMPOSE_FILE_PROD"]="production/docker-compose.production.yml"
    ["$COMPOSE_FILE_CERTBOT"]="production/docker-compose.certbot.yml"
    ["$BACKEND_ENV_FILE"]="production/backend.env"
    ["$NGINX_CONF_FILE"]="production/nginx-default.conf"
)

# Static environment variables
declare -A static_env_vars=(
    ["ENVIRONMENT"]="production"
    ["CERTIFICATE_RENEWAL_LOG"]="/var/log/certificate-renewal.log"
    ["AWS_FRONTEND_REPOSITORY"]="w3s-frontend"
    ["AWS_DATA_FETCHER_REPOSITORY"]="w3s-data-fetcher"
    ["AWS_BACKEND_REPOSITORY"]="w3s-backend"
)

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



# Setup directories and permissions
setup_directories() {
    echo "Setting up directories and permissions..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would check user is in deploy group"
        echo "[DRY RUN] Would create app directories: $APP_DIR"
    else
        # Check if user is in deploy group
        if ! groups $CURRENT_USER | grep -q deploy; then
            echo "❌ User $CURRENT_USER is not in 'deploy' group."
            echo "Please run the bootstrap script first:"
            echo "  $SCRIPTS_DIR/bootstrap-server.sh"
            echo "Then log out and back in, and re-run this deployment script."
            exit 1
        fi

        # Create application directories
        sudo mkdir -p $CONFIG_DIR/backend $COMPOSE_DIR/nginx $SCRIPTS_DIR
        sudo chown -R root:deploy $APP_DIR
        sudo chmod -R 775 $APP_DIR
    fi
}

# Download configuration files from S3
download_configuration_files() {
    echo "Downloading configuration files..."
    for local_file in "${!required_s3_files[@]}"; do
        s3_path="${required_s3_files[$local_file]}"
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would download $local_file from s3://$S3_BUCKET/$s3_path"
        else
            echo "Downloading $local_file from s3://$S3_BUCKET/$s3_path"
            aws s3 cp "s3://$S3_BUCKET/$s3_path" "$local_file" --region "$AWS_REGION"
        fi
    done
}

# Download scripts from S3
download_scripts() {
    echo "Downloading scripts..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would download manage-certificate.sh to $SCRIPTS_DIR"
        echo "[DRY RUN] Would download bootstrap-server.sh to $SCRIPTS_DIR"
    else
        aws s3 cp "s3://$S3_BUCKET/scripts/manage-certificate.sh" "$SCRIPTS_DIR/manage-certificate.sh" --region "$AWS_REGION"
        aws s3 cp "s3://$S3_BUCKET/scripts/bootstrap-server.sh" "$SCRIPTS_DIR/bootstrap-server.sh" --region "$AWS_REGION"
        chmod 755 "$SCRIPTS_DIR/manage-certificate.sh" "$SCRIPTS_DIR/bootstrap-server.sh"
    fi
}

# Create server README file
create_server_readme() {
    tee "$README_FILE" > /dev/null << EOF
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
# Manage certificates (create/renew)
$SCRIPTS_DIR/manage-certificate.sh

# Check certificate status (from compose directory)
cd $COMPOSE_DIR && docker compose -f docker-compose.certbot.yml run -T --rm certbot certificates
\`\`\`

### Container Management
\`\`\`bash
# Change to compose directory first
cd $COMPOSE_DIR

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
- Environment: \`$ENV_FILE\`
- Domain: \`$(grep DOMAIN $ENV_FILE 2>/dev/null | cut -d= -f2 || echo "<not set>")\`
- Region: \`$(grep AWS_REGION $ENV_FILE 2>/dev/null | cut -d= -f2 || echo "<not set>")\`

### Docker Cleanup
\`\`\`bash
# Remove unused containers, networks, images
docker system prune -f

# Remove unused volumes (be careful!)
docker volume prune -f

# Remove all stopped containers
docker container prune -f
\`\`\`

### Quick Deployment from S3
\`\`\`bash
# Pull and run deployment script directly from S3
aws s3 cp s3://w3s-deployment-configs-us-east-1/scripts/deploy-production.sh - --region us-east-1 | bash
\`\`\`

### File Locations
- Base directory: \`$APP_DIR/\`
- Configuration: \`$CONFIG_DIR/\`
- Docker compose: \`$COMPOSE_DIR/\`
- Scripts: \`$SCRIPTS_DIR/\`
EOF
}

# Generate environment files
generate_environment_files() {
    echo "Generating environment files..."

    # Process backend environment template
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would generate random secret key for backend"
        echo "[DRY RUN] Would process $BACKEND_ENV_FILE template"
    else
        BACKEND_SECRET_KEY=$(openssl rand -hex 32)
        sed "s/{{BACKEND_SECRET_KEY}}/$BACKEND_SECRET_KEY/g" "$BACKEND_ENV_FILE" > /tmp/backend.env.tmp
        mv /tmp/backend.env.tmp "$BACKEND_ENV_FILE"
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
        echo "[DRY RUN] Would create $ENV_FILE with content:"
        echo -e "$env_content"
        echo "[DRY RUN] Would create server $README_FILE"
    else
        echo -e "$env_content" > "$ENV_FILE"
        source "$ENV_FILE"
        create_server_readme
    fi
}

# Login to ECR
login_to_ecr() {
    echo "Logging into ECR..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would login to ECR: <SSM_VALUE>.dkr.ecr.<SSM_VALUE>.amazonaws.com"
    else
        AWS_ACCOUNT_VALUE=$(aws ssm get-parameter --name "${required_ssm_params[AWS_ACCOUNT]}" --query 'Parameter.Value' --output text --region "$AWS_REGION")
        AWS_REGION_VALUE=$(aws ssm get-parameter --name "${required_ssm_params[AWS_REGION]}" --query 'Parameter.Value' --output text --region "$AWS_REGION")
        aws ecr get-login-password --region "$AWS_REGION_VALUE" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_VALUE.dkr.ecr.$AWS_REGION_VALUE.amazonaws.com"
    fi
}

# Setup SSL certificates
setup_ssl_certificates() {
    echo "Checking SSL certificates..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would check for SSL certificates and generate if needed"
    else
        if ! docker run --rm -v web3-snapshot_certbot_conf:/etc/letsencrypt alpine test -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem"; then
            echo "SSL certificates not found. Generating initial certificates..."
            if [ -f "$ENV_FILE" ]; then
                cp "$ENV_FILE" "$COMPOSE_DIR/.env"
            fi
            echo "Starting temporary nginx for certificate generation..."
            docker compose -f "$COMPOSE_FILE_CERTBOT" up -d nginx80
            sleep 5
            echo "Generating SSL certificate for $DOMAIN..."
            docker compose -f "$COMPOSE_FILE_CERTBOT" run -T --rm certbot certonly --webroot --webroot-path /var/www/certbot/ --email "$EMAIL" --agree-tos --no-eff-email -d "$DOMAIN"
            docker compose -f "$COMPOSE_FILE_CERTBOT" down
            echo "SSL certificates generated successfully."
        else
            echo "SSL certificates already exist."
        fi
    fi
}

# Deploy containers
deploy_containers() {
    echo "Pulling latest images and restarting services..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would pull latest images"
        echo "[DRY RUN] Would stop containers"
        echo "[DRY RUN] Would start containers"
    else
        docker compose -f "$COMPOSE_FILE_PROD" pull
        docker compose -f "$COMPOSE_FILE_PROD" down
        docker compose -f "$COMPOSE_FILE_PROD" up -d
    fi
}

# Get S3 bucket name from SSM
get_s3_bucket() {
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would get S3 bucket from SSM: ${required_ssm_params[S3_DEPLOYMENT_BUCKET]}"
        S3_BUCKET="<S3_BUCKET_NAME>"
    else
        S3_BUCKET=$(aws ssm get-parameter --name "${required_ssm_params[S3_DEPLOYMENT_BUCKET]}" --query 'Parameter.Value' --output text --region "$AWS_REGION")
    fi
    echo "Using S3 bucket: $S3_BUCKET"
}

# Check required dependencies
check_dependencies() {
    echo "Checking required dependencies..."

    local missing_deps=false

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI not found"
        missing_deps=true
    else
        echo "✅ AWS CLI found: $(aws --version)"
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found"
        missing_deps=true
    else
        echo "✅ Docker found: $(docker --version)"
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null 2>&1; then
        echo "❌ Docker Compose not found"
        missing_deps=true
    else
        echo "✅ Docker Compose found: $(docker compose version)"
    fi

    if [[ "$missing_deps" == "true" ]]; then
        echo ""
        echo "Missing dependencies detected. Please run the bootstrap script first:"
        echo "  $SCRIPTS_DIR/bootstrap-server.sh"
        echo ""
        echo "After bootstrap completes, log out and back in, then re-run this deployment script."
        exit 1
    fi
}

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "DRY RUN MODE - No changes will be made"
    echo
fi

echo "Starting deployment..."

# Get AWS region
AWS_REGION=$(get_aws_region)
echo "Using AWS region: $AWS_REGION"

# Get S3 bucket name from SSM
get_s3_bucket

# Setup directories and permissions
setup_directories

# Check dependencies after directory setup
check_dependencies

# Download files from S3
download_configuration_files
download_scripts

# Generate environment files
generate_environment_files

# Execute deployment steps
login_to_ecr
setup_ssl_certificates
deploy_containers

echo "Deployment completed successfully!"
