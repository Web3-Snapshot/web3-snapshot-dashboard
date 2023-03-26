#! /bin/bash

# Stop on errors and log the shell commands executed to # stdout.
set -ex

USER=ubuntu

## Security upgrades
sudo apt update
sudo apt upgrade --yes

## Set up docker
sudo apt install --yes \
  ca-certificates \
  curl \
  gnupg \
  lsb-release

sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt update

## Post installation docker

# Create the docker group and add your user:
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

sudo apt-get install --yes docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Automatically configure a systemd service which will start on boot and automatically restart.
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
