#!/bin/bash
set -e

# EC2 User Data Script for Web3 Snapshot Dashboard
# This script bootstraps a fresh Ubuntu EC2 instance and downloads the deployment script

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

# Create deployment directory
mkdir -p /opt/web3-snapshot/scripts
chown -R ubuntu:ubuntu /opt/web3-snapshot

# Download deployment script from S3
echo "Downloading deployment script..."
aws s3 cp s3://w3s-deployment-configs-us-east-1/scripts/deploy-production.sh /opt/web3-snapshot/scripts/ --region us-east-1

# Make script executable
chmod +x /opt/web3-snapshot/scripts/deploy-production.sh
chown ubuntu:ubuntu /opt/web3-snapshot/scripts/deploy-production.sh

# Verify installations
echo "Verifying installations..."
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "AWS CLI version: $(aws --version)"

echo "User Data script completed at $(date)"
echo ""
echo "=== NEXT STEPS ==="
echo "1. SSH into the server: ssh ubuntu@<server-ip>"
echo "2. Run deployment: /opt/web3-snapshot/scripts/deploy-production.sh"
echo "3. Server is ready for production!"
