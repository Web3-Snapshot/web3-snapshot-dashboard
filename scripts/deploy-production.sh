#!/bin/bash
set -e

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

DEPLOYMENT_DIR="/opt/web3-snapshot"
S3_BUCKET="w3s-deployment-configs"

# Define required SSM parameters
declare -A required_ssm_params=(
    ["REDIS_URL"]="/w3s/production/redis-url"
    ["COINGECKO_API_URL"]="/w3s/production/coingecko-api-url"
    ["COINGECKO_API_KEY"]="/w3s/production/coingecko-api-key"
    ["AWS_ACCOUNT"]="/w3s/production/aws-account"
    ["AWS_REGION"]="/w3s/production/aws-region"
    ["DOMAIN"]="/w3s/production/domain"
)

# Define required S3 files
declare -A required_s3_files=(
    ["docker-compose.production.yml"]="production/docker-compose.production.yml"
    ["database/schema.sql"]="production/schema.sql"
    ["backend/.env"]="production/backend.env"
)

# Static environment variables
declare -A static_env_vars=(
    ["ENVIRONMENT"]="production"
    ["CERTIFICATE_RENEWAL_LOG"]="/var/log/certificate_renewal.log"
    ["AWS_PROFILE"]="default"
    ["AWS_FRONTEND_REPOSITORY"]="w3s-frontend"
    ["AWS_DB_REPOSITORY"]="w3s-database"
    ["AWS_BACKEND_REPOSITORY"]="w3s-backend"
)

echo "Starting deployment..."

# Create deployment directory
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would create directories: $DEPLOYMENT_DIR/{backend,database,scripts}"
    echo "[DRY RUN] Would change to directory: $DEPLOYMENT_DIR"
else
    mkdir -p $DEPLOYMENT_DIR/{backend,database,scripts}
    cd $DEPLOYMENT_DIR
fi

# Download files from S3
echo "Downloading configuration files..."
for local_file in "${!required_s3_files[@]}"; do
    s3_path="${required_s3_files[$local_file]}"
    echo "Downloading $local_file from s3://$S3_BUCKET/$s3_path"
    execute aws s3 cp "s3://$S3_BUCKET/$s3_path" "./$local_file"
done

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
            value=$(aws ssm get-parameter --name "$ssm_path" --with-decryption --query 'Parameter.Value' --output text)
        fi
    else
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[DRY RUN] Would get parameter: $ssm_path"
            value="<SSM_VALUE>"
        else
            value=$(aws ssm get-parameter --name "$ssm_path" --query 'Parameter.Value' --output text)
        fi
    fi
    env_content+="$var_name=$value\n"
done

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would create .env.production with content:"
    echo -e "$env_content"
else
    echo -e "$env_content" > .env.production
fi

# Login to ECR
echo "Logging into ECR..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would get AWS account from SSM: /w3s/production/aws-account"
    echo "[DRY RUN] Would get AWS region from SSM: /w3s/production/aws-region"
    echo "[DRY RUN] Would login to ECR: <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com"
else
    AWS_ACCOUNT_VALUE=$(aws ssm get-parameter --name "/w3s/production/aws-account" --query 'Parameter.Value' --output text)
    AWS_REGION_VALUE=$(aws ssm get-parameter --name "/w3s/production/aws-region" --query 'Parameter.Value' --output text)
    aws ecr get-login-password --region "$AWS_REGION_VALUE" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_VALUE.dkr.ecr.$AWS_REGION_VALUE.amazonaws.com"
fi

# Pull latest images and restart
echo "Pulling latest images and restarting services..."
execute docker compose -f docker-compose.production.yml pull
execute docker compose -f docker-compose.production.yml down
execute docker compose -f docker-compose.production.yml up -d

echo "Deployment completed successfully!"
