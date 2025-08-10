#!/bin/bash
set -e

# EC2 User Data Script for Web3 Snapshot Dashboard
# This script bootstraps a fresh Ubuntu EC2 instance and downloads the deployment script

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

# Log everything to a file for debugging
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting EC2 User Data script at $(date)"

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y curl unzip ca-certificates gnupg lsb-release

# Install Docker
echo "Installing Docker..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install AWS CLI
echo "Installing AWS CLI..."
ARCH=$(uname -m)
if [[ "$ARCH" == "x86_64" ]]; then
    AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
elif [[ "$ARCH" == "aarch64" ]]; then
    AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip"
else
    echo "Error: Unsupported architecture: $ARCH"
    exit 1
fi

curl "$AWS_CLI_URL" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Create deployment directory in ubuntu user's home
DEPLOYMENT_DIR="/home/ubuntu/web3-snapshot"
mkdir -p $DEPLOYMENT_DIR/scripts
chown -R ubuntu:ubuntu $DEPLOYMENT_DIR

# Get AWS region and S3 bucket, then download deployment script
AWS_REGION=$(get_aws_region)
echo "Using AWS region: $AWS_REGION"
S3_BUCKET=$(aws ssm get-parameter --name "/w3s/production/s3-deployment-bucket" --query 'Parameter.Value' --output text --region "$AWS_REGION")
echo "Using S3 bucket: $S3_BUCKET"
echo "Downloading deployment script..."
aws s3 cp s3://$S3_BUCKET/scripts/deploy-production.sh $DEPLOYMENT_DIR/scripts/ --region "$AWS_REGION"

# Make script executable
chmod +x $DEPLOYMENT_DIR/scripts/deploy-production.sh
chown ubuntu:ubuntu $DEPLOYMENT_DIR/scripts/deploy-production.sh

# Verify installations
echo "Verifying installations..."
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "AWS CLI version: $(aws --version)"

echo "User Data script completed at $(date)"
echo ""
echo "=== NEXT STEPS ==="
echo "1. SSH into the server: ssh ubuntu@<server-ip>"
echo "2. Run deployment: ~/web3-snapshot/scripts/deploy-production.sh"
echo "3. Server is ready for production!"
