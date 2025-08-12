#!/bin/bash
set -e

# Path configuration - all paths defined at top
APP_DIR="/opt/web3-snapshot"
COMPOSE_DIR="$APP_DIR/compose"
CONFIG_DIR="$APP_DIR/config"
COMPOSE_FILE_CERTBOT="$COMPOSE_DIR/docker-compose.certbot.yml"
COMPOSE_FILE_APP="$COMPOSE_DIR/docker-compose.production.yml"
ENV_FILE="$CONFIG_DIR/.env.production"
LOG_FILE="/var/log/certificate-renewal.log"

# Change to compose directory
cd "$COMPOSE_DIR" || {
    echo "Error: Failed to change to directory: $COMPOSE_DIR" >&2
    exit 1
}

# Load environment variables (includes DOMAIN and EMAIL from SSM)
if [ -f "$ENV_FILE" ]; then
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
fi

# Validate required variables are set
if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN not set in environment" >&2
    exit 1
fi

if [ -z "$EMAIL" ]; then
    echo "Error: EMAIL not set in environment" >&2
    exit 1
fi

echo "Managing SSL certificates for $DOMAIN..."

docker compose -f "$COMPOSE_FILE_CERTBOT" up -d nginx80
sleep 5

docker compose -f "$COMPOSE_FILE_CERTBOT" -f "$COMPOSE_FILE_APP" run -T --rm certbot renew \
    --webroot --webroot-path /var/www/certbot/

docker compose -f "$COMPOSE_FILE_CERTBOT" stop nginx80

# Reload nginx if certificates were renewed
if [ $? -eq 0 ]; then
    docker compose -f "$COMPOSE_FILE_APP" exec frontend nginx -s reload 2>/dev/null || true
fi

echo "Certificate management completed successfully."
