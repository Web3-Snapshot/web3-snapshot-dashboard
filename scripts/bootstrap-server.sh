#!/bin/bash
set -e

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "BOOTSTRAP DRY RUN MODE - No changes will be made"
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

echo "Starting server bootstrap..."

# Update system packages
echo "Updating system packages..."
execute sudo apt-get update
execute sudo apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
execute sudo apt-get install -y curl unzip ca-certificates gnupg lsb-release

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would install Docker"
    else
        # Add Docker's official GPG key
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        # Set up Docker repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker Engine
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # Add current user to docker group
        sudo usermod -aG docker $USER

        echo "Docker installed successfully"
    fi
else
    echo "Docker already installed: $(docker --version)"
fi

# Install AWS CLI
echo "Installing AWS CLI..."
if ! command -v aws &> /dev/null; then
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would install AWS CLI"
    else
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
    echo "AWS CLI already installed: $(aws --version)"
fi

# Verify installations
echo "Verifying installations..."
if [[ "$DRY_RUN" == "false" ]]; then
    echo "Docker version: $(docker --version)"
    echo "Docker Compose version: $(docker compose version)"
    echo "AWS CLI version: $(aws --version)"

    # Test Docker without sudo (requires re-login to take effect)
    if groups $USER | grep -q docker; then
        echo "User $USER is in docker group"
    else
        echo "Warning: User $USER not in docker group yet. Please log out and back in."
    fi
fi

echo "Bootstrap completed successfully!"
echo ""
echo "IMPORTANT: If Docker was installed, please log out and back in for group changes to take effect."
echo "Then you can run the deployment script."
