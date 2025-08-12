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
    ["FLASK_ENV"]="production"
)

# Generic parameter validation and assignment helper
validate_and_assign_params() {
    local -n params_ref=$1
    local actual_count=$2
    local function_name="${FUNCNAME[2]}"

    [[ $actual_count -eq ${#params_ref[@]} ]] || { echo "Error: $function_name() requires exactly ${#params_ref[@]} parameters: ${params_ref[*]}" >&2; exit 1; }

    for i in "${!params_ref[@]}"; do
        eval "${params_ref[$i]}=\"\${$((i+3))}\""
    done

    for param in "${params_ref[@]}"; do
        [[ -n "${!param}" ]] || { echo "Error: $function_name() missing $param (got: '${!param}')" >&2; exit 1; }
    done
}


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

# Set deployment assets bucket from SSM Parameter Store
set_deployment_assets_bucket() {
    local params=(aws_region ssm_param_path)
    validate_and_assign_params params $# "$@"

    aws ssm get-parameter --name "$ssm_param_path" --query 'Parameter.Value' --output text --region "$aws_region"
}



# Setup directories and permissions
setup_directories() {
    local params=(current_user)
    validate_and_assign_params params $# "$@"

    echo "Setting up directories and permissions..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would check user $current_user is in deploy group"
        echo "[DRY RUN] Would create app directories: $APP_DIR"
    else
        # Check if user is in deploy group
        if ! groups "$current_user" | grep -q deploy; then
            echo "❌ User $current_user is not in 'deploy' group."
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
    local params=(deployment_assets_bucket aws_region)
    validate_and_assign_params params $# "$@"

    echo "Downloading configuration files..."
    for local_file in "${!required_s3_files[@]}"; do
        s3_path="${required_s3_files[$local_file]}"
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would download $local_file from s3://$deployment_assets_bucket/$s3_path"
        else
            echo "Downloading $local_file from s3://$deployment_assets_bucket/$s3_path"
            aws s3 cp "s3://$deployment_assets_bucket/$s3_path" "$local_file" --region "$aws_region"
        fi
    done
}

# Download scripts from S3
download_scripts() {
    local params=(deployment_assets_bucket aws_region scripts_dir)
    validate_and_assign_params params $# "$@"

    echo "Downloading scripts..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would download manage-certificate.sh to $scripts_dir"
        echo "[DRY RUN] Would download bootstrap-server.sh to $scripts_dir"
    else
        aws s3 cp "s3://$deployment_assets_bucket/scripts/manage-certificate.sh" "$scripts_dir/manage-certificate.sh" --region "$aws_region"
        aws s3 cp "s3://$deployment_assets_bucket/scripts/bootstrap-server.sh" "$scripts_dir/bootstrap-server.sh" --region "$aws_region"
        chmod 755 "$scripts_dir/manage-certificate.sh" "$scripts_dir/bootstrap-server.sh"
    fi
}

# Create symlinks for easy script access
create_script_symlinks() {
    local params=(scripts_dir)
    validate_and_assign_params params $# "$@"

    echo "Creating script symlinks..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would create symlinks in /usr/local/bin/"
        echo "[DRY RUN] Would link bootstrap-server.sh"
        echo "[DRY RUN] Would link manage-certificate.sh"
    else
        sudo ln -sf "$scripts_dir/bootstrap-server.sh" /usr/local/bin/bootstrap-server.sh
        sudo ln -sf "$scripts_dir/manage-certificate.sh" /usr/local/bin/manage-certificate.sh
        echo "✅ Script symlinks created in /usr/local/bin/"
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

# Check certificate status
docker compose -f $COMPOSE_DIR/docker-compose.certbot.yml run -T --rm certbot certificates
\`\`\`

### Container Management
\`\`\`bash
# Check container status
docker compose -f $COMPOSE_DIR/docker-compose.production.yml ps

# View logs
docker compose -f $COMPOSE_DIR/docker-compose.production.yml logs

# Restart services
docker compose -f $COMPOSE_DIR/docker-compose.production.yml restart

# Stop services
docker compose -f $COMPOSE_DIR/docker-compose.production.yml down

# Start services
docker compose -f $COMPOSE_DIR/docker-compose.production.yml up -d
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
    local params=(backend_env_file env_file aws_region)
    validate_and_assign_params params $# "$@"

    echo "Generating environment files..."

    # Process backend environment template
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would generate random secret key for backend"
        echo "[DRY RUN] Would process $backend_env_file template"
    else
        BACKEND_SECRET_KEY=$(openssl rand -hex 32)
        sed "s/{{BACKEND_SECRET_KEY}}/$BACKEND_SECRET_KEY/g" "$backend_env_file" > /tmp/backend.env.tmp
        mv /tmp/backend.env.tmp "$backend_env_file"
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
            value=$(aws ssm get-parameter --name "$ssm_path" --with-decryption --query 'Parameter.Value' --output text --region "$aws_region")
        else
            value=$(aws ssm get-parameter --name "$ssm_path" --query 'Parameter.Value' --output text --region "$aws_region")
        fi
        env_content+="$var_name=$value\n"

        # Add computed Docker image names
        if [[ "$var_name" == "AWS_ACCOUNT" ]]; then
            aws_account_value="$value"
        elif [[ "$var_name" == "AWS_REGION" ]]; then
            aws_region_value="$value"
        fi
    done

    # Add Docker image environment variables
    if [[ -n "$aws_account_value" && -n "$aws_region_value" ]]; then
        env_content+="DOCKER_IMAGE_DATA_FETCHER=$aws_account_value.dkr.ecr.$aws_region_value.amazonaws.com/w3s-data-fetcher:latest\n"
        env_content+="DOCKER_IMAGE_BACKEND=$aws_account_value.dkr.ecr.$aws_region_value.amazonaws.com/w3s-backend:latest\n"
        env_content+="DOCKER_IMAGE_FRONTEND=$aws_account_value.dkr.ecr.$aws_region_value.amazonaws.com/w3s-frontend:latest\n"
    fi

    # Set variables for dry run mode
    if [[ "$DRY_RUN" == "true" ]]; then
        # Extract DOMAIN and EMAIL from SSM for dry run
        for var_name in "${!required_ssm_params[@]}"; do
            if [[ "$var_name" == "DOMAIN" || "$var_name" == "EMAIL" ]]; then
                ssm_path="${required_ssm_params[$var_name]}"
                value=$(aws ssm get-parameter --name "$ssm_path" --query 'Parameter.Value' --output text --region "$aws_region")
                declare -g "$var_name"="$value"
            fi
        done
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Environment file content would be:"
        echo -e "$env_content"
        echo "[DRY RUN] Would create server $README_FILE"
    else
        echo -e "$env_content" > "$env_file"
        source "$env_file"
        create_server_readme
    fi
}

# Login to ECR
login_to_ecr() {
    local params=(aws_region)
    validate_and_assign_params params $# "$@"
    local aws_account_param="${required_ssm_params[AWS_ACCOUNT]}"
    local aws_region_param="${required_ssm_params[AWS_REGION]}"

    echo "Logging into ECR..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would login to ECR: <SSM_VALUE>.dkr.ecr.<SSM_VALUE>.amazonaws.com"
    else
        local aws_account_value=$(aws ssm get-parameter --name "$aws_account_param" --query 'Parameter.Value' --output text --region "$aws_region")
        local aws_region_value=$(aws ssm get-parameter --name "$aws_region_param" --query 'Parameter.Value' --output text --region "$aws_region")
        aws ecr get-login-password --region "$aws_region_value" | docker login --username AWS --password-stdin "$aws_account_value.dkr.ecr.$aws_region_value.amazonaws.com"
    fi
}

# Setup SSL certificates
setup_ssl_certificates() {
    local params=(compose_file_certbot domain email env_file compose_dir)
    validate_and_assign_params params $# "$@"

    echo "Managing SSL certificates for $domain..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would manage SSL certificates for domain: $domain, email: $email"
    else
        docker compose -f "$compose_file_certbot" up -d nginx80
        sleep 5
        echo "Running certbot for $domain..."
        docker compose -f "$compose_file_certbot" run -T --rm certbot certonly --webroot --webroot-path /var/www/certbot/ --email "$email" --agree-tos --no-eff-email --keep-until-expiring -d "$domain"
        docker compose -f "$compose_file_certbot" down
        echo "SSL certificate management completed."
    fi
}

# Deploy containers
deploy_containers() {
    local params=(compose_file_prod)
    validate_and_assign_params params $# "$@"

    echo "Pulling latest images and restarting services..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would pull latest images"
        echo "[DRY RUN] Would stop containers"
        echo "[DRY RUN] Would start containers"
    else
        # Copy environment file to compose directory for docker-compose
        if [ -f "$ENV_FILE" ]; then
            cp "$ENV_FILE" "$COMPOSE_DIR/.env"
        fi

        docker compose -f "$compose_file_prod" pull
        docker compose -f "$compose_file_prod" down
        docker compose -f "$compose_file_prod" up -d
    fi
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

# Verify required tools are installed (AWS CLI, Docker, Docker Compose)
# Validates: All deployment dependencies are available
# Exits: If any required tools are missing (fail fast)
check_dependencies

# ============================================================================
# PHASE 1: INITIALIZATION - Set up basic variables and validate environment
# ============================================================================

# Get AWS region from environment variable or EC2 metadata
# Sets: AWS_REGION (required by all AWS CLI calls)
AWS_REGION=$(get_aws_region)
echo "Using AWS region: $AWS_REGION"

# Set deployment assets bucket from SSM Parameter Store (contains deployment configurations)
# Requires: AWS_REGION, SSM_PARAM_PATH
# Sets: DEPLOYMENT_ASSETS_BUCKET (required by download functions)
DEPLOYMENT_ASSETS_BUCKET=$(set_deployment_assets_bucket "$AWS_REGION" "${required_ssm_params[S3_DEPLOYMENT_BUCKET]}")
echo "Using deployment assets bucket: $DEPLOYMENT_ASSETS_BUCKET"

# ============================================================================
# PHASE 2: ENVIRONMENT SETUP - Prepare server environment and dependencies
# ============================================================================

# Create application directories and set permissions
# Creates: /opt/web3-snapshot/{config,compose,scripts} directories
# Validates: User is in 'deploy' group (exits if not)
# Sets: Directory ownership to root:deploy with 775 permissions
setup_directories "$CURRENT_USER"

# ============================================================================
# PHASE 3: CONFIGURATION DOWNLOAD - Fetch deployment files from S3
# ============================================================================

# Download Docker Compose files and configuration templates from S3
# Requires: DEPLOYMENT_ASSETS_BUCKET, AWS_REGION
# Downloads: docker-compose.production.yml, docker-compose.certbot.yml,
#           backend/.env template, nginx/default.conf
# Creates: All required configuration files in their target locations
download_configuration_files "$DEPLOYMENT_ASSETS_BUCKET" "$AWS_REGION"

# Download deployment and management scripts from S3
# Requires: DEPLOYMENT_ASSETS_BUCKET, AWS_REGION
# Downloads: manage-certificate.sh, bootstrap-server.sh
# Sets: Execute permissions (755) on downloaded scripts
download_scripts "$DEPLOYMENT_ASSETS_BUCKET" "$AWS_REGION" "$SCRIPTS_DIR"

# Create symlinks in /usr/local/bin for easy script access
# Creates: /usr/local/bin/bootstrap-server.sh -> /opt/web3-snapshot/scripts/bootstrap-server.sh
#         /usr/local/bin/manage-certificate.sh -> /opt/web3-snapshot/scripts/manage-certificate.sh
create_script_symlinks "$SCRIPTS_DIR"

# ============================================================================
# PHASE 4: ENVIRONMENT CONFIGURATION - Generate runtime configuration
# ============================================================================

# Generate environment files from SSM parameters and templates
# Requires: AWS_REGION, all SSM parameters defined in required_ssm_params
# Creates: .env.production (from SSM), processes backend/.env template
# Sets: DOMAIN, EMAIL, and all other environment variables (via source in non-dry-run)
# Generates: Server README.md with deployment commands and configuration
generate_environment_files "$BACKEND_ENV_FILE" "$ENV_FILE" "$AWS_REGION"
echo "Environment variables that would be set:"
if [[ "$DRY_RUN" != "true" && -f "$ENV_FILE" ]]; then
    cat "$ENV_FILE"
fi

# ============================================================================
# PHASE 5: DEPLOYMENT EXECUTION - Deploy application containers
# ============================================================================

# Authenticate with AWS ECR for Docker image pulls
# Requires: AWS_ACCOUNT and AWS_REGION from SSM
# Performs: Docker login to ECR registry
login_to_ecr "$AWS_REGION"

# Generate or validate SSL certificates for HTTPS
# Requires: DOMAIN, EMAIL (from sourced .env.production)
# Creates: Let's Encrypt SSL certificates if they don't exist
# Uses: Temporary nginx container for certificate validation
setup_ssl_certificates "$COMPOSE_FILE_CERTBOT" "$DOMAIN" "$EMAIL" "$ENV_FILE" "$COMPOSE_DIR"

# Pull latest Docker images and restart application containers
# Requires: All configuration files and SSL certificates in place
# Performs: docker compose pull, down, up -d
# Starts: All production containers (frontend, backend, data-fetcher, redis)
deploy_containers "$COMPOSE_FILE_PROD"

echo "Deployment completed successfully!"

# Cleanup dry run variables
if [[ "$DRY_RUN" == "true" ]]; then
    unset DOMAIN EMAIL
fi
