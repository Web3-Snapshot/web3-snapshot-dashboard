#!/bin/bash
set -e

# Configuration
DEPLOYMENT_DIR="/usr/src/web3-snapshot"
COMPOSE_FILE_CERTBOT="docker-compose.certbot.yml"
COMPOSE_FILE_APP="docker-compose.production.yml"
LOG_FILE="/var/log/certificate-renewal.log"

# Change to deployment directory
cd "$DEPLOYMENT_DIR" || {
    echo "Error: Failed to change to directory: $DEPLOYMENT_DIR" >&2
    exit 1
}

# Load environment variables (includes DOMAIN and EMAIL from SSM)
if [ -f ".env.production" ]; then
    set -o allexport
    source ".env.production"
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

# Check if certificates exist
check_certificates() {
    docker compose -f "$COMPOSE_FILE_CERTBOT" -f "$COMPOSE_FILE_APP" run --rm certbot certificates | grep -q "$DOMAIN"
}

# Generate initial certificates
generate_certificates() {
    echo "Generating initial SSL certificates for $DOMAIN..."

    docker compose -f "$COMPOSE_FILE_CERTBOT" up -d nginx80
    sleep 5

    docker compose -f "$COMPOSE_FILE_CERTBOT" -f "$COMPOSE_FILE_APP" run --rm certbot certonly \
        --webroot --webroot-path /var/www/certbot/ \
        --email "$EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN"

    docker compose -f "$COMPOSE_FILE_CERTBOT" stop nginx80
}

# Renew certificates
renew_certificates() {
    echo "Renewing SSL certificates for $DOMAIN..."

    docker compose -f "$COMPOSE_FILE_CERTBOT" up -d nginx80

    docker compose -f "$COMPOSE_FILE_CERTBOT" -f "$COMPOSE_FILE_APP" run --rm certbot renew \
        --webroot --webroot-path /var/www/certbot/

    docker compose -f "$COMPOSE_FILE_CERTBOT" stop nginx80

    # Reload nginx if certificates were renewed
    if [ $? -eq 0 ]; then
        docker compose -f "$COMPOSE_FILE_APP" exec frontend nginx -s reload 2>/dev/null || true
    fi
}

# Main logic
if check_certificates; then
    renew_certificates
else
    generate_certificates
fi

echo "Certificate management completed successfully."
