#!/bin/bash
set -e

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "BOOTSTRAP DRY RUN MODE - No changes will be made"
    echo
fi



echo "Starting server bootstrap..."

# Update system packages
echo "Updating system packages..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would update system packages"
else
    sudo apt-get update
    sudo apt-get upgrade -y
fi

# Install essential packages
echo "Installing essential packages..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would install essential packages"
else
    sudo apt-get install -y curl unzip ca-certificates gnupg lsb-release
fi

# Install Docker
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
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
elif ! docker compose version &> /dev/null 2>&1; then
    echo "Docker found but Docker Compose plugin missing. Installing Docker..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would install Docker with Compose plugin"
    else
        sudo apt-get update
        sudo apt-get install -y docker-compose-plugin
        echo "Docker Compose plugin installed successfully"
    fi
else
    echo "Docker already installed: $(docker --version)"
fi

# Install AWS CLI
echo "Checking AWS CLI installation..."
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing AWS CLI..."
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

# Create deploy group and add current user
echo "Setting up deploy group..."
if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would create deploy group and add user"
else
    sudo groupadd -f deploy
    sudo usermod -a -G deploy $USER
fi

# Verify installations
echo "Verifying installations..."
if [[ "$DRY_RUN" == "false" ]]; then
    echo "Docker version: $(docker --version)"
    echo "Docker Compose version: $(docker compose version)"
    echo "AWS CLI version: $(aws --version)"

    # Test group memberships (requires re-login to take effect)
    if groups $USER | grep -q docker; then
        echo "✅ User $USER is in docker group"
    else
        echo "⚠️  User $USER not in docker group yet. Please log out and back in."
    fi

    if groups $USER | grep -q deploy; then
        echo "✅ User $USER is in deploy group"
    else
        echo "⚠️  User $USER not in deploy group yet. Please log out and back in."
    fi
fi

echo "Bootstrap completed successfully!"
echo ""
echo "IMPORTANT: If Docker was installed, please log out and back in for group changes to take effect."
echo "Then you can run the deployment script."
