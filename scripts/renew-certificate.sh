#!/bin/bash
set -e

BASE_DIR=$(cd "$(dirname "$(dirname "$0")")" && pwd)
echo "BASE_DIR: $BASE_DIR"
COMPOSE_FILE_CERTBOT=docker-compose.certbot.yml
COMPOSE_FILE_APP=docker-compose.production.yml

renew_certificate() {
    local log_file="/home/deploy/web3-snapshot-dashboard/renew-certificate.log"
    local compose_file_certbot="$BASE_DIR/$COMPOSE_FILE_CERTBOT"
    local compose_file_app="$BASE_DIR/$COMPOSE_FILE_APP"
    local compose_dir="$BASE_DIR"
    local output
    local exit_code
    local container_name="certbot_renewal"

    # Parse the env file
    if [ -f "$BASE_DIR/.env" ]; then
        set -o allexport
        source "$BASE_DIR/.env"
        set +o allexport
    fi

    # Validate the compose files exist
    if [ ! -f "$compose_file_certbot" ] || [ ! -f "$compose_file_app" ]; then
        echo "Error: One or more Docker Compose files not found." >&2
        return 1
    fi

    # Change to the directory one level up (where the compose files are located)
    cd "$compose_dir" || {
        echo "Error: Failed to change to directory: $compose_dir" >&2
        return 1
    }

    # Remove any existing container with the same name
    docker rm -f "$container_name" >/dev/null 2>&1

    # Bring up the Nginx server on port 80 with both compose files
    echo "Checking if Nginx server on port 80 is already running..."
    if ! docker ps --format '{{.Names}}' | grep -q '^nginx80$'; then
        echo "Starting Nginx server on port 80..."
        docker compose -f "$compose_file_certbot" -f "$compose_file_app" up -d nginx80

        if [ $? -ne 0 ]; then
            echo "Error: Failed to start Nginx server on port 80." >&2
            return 1
        fi

        echo "Nginx server started successfully."
    else
        echo "Nginx server on port 80 is already running."
    fi

    echo "Compose file certbot: $compose_file_certbot"
    echo "Compose file app: $compose_file_app"
    echo "Container name: $container_name"
    # Run the docker command with a specific container name and capture output and exit code
    output=$(docker compose -f "$compose_file_certbot" -f "$compose_file_app" run --name "$container_name" --rm certbot renew --webroot --webroot-path /var/www/certbot/ 2>&1)

    exit_code=$?

    # # Stop only the Nginx server container
    # docker compose -f "$compose_file_certbot" -f "$compose_file_app" stop nginx80

    # Log the output
    echo "$output"
    echo "$output" >>"$log_file"
    # Handle errors
    if [ $exit_code -ne 0 ]; then
        echo "Error renewing certificate: $output" >&2
        echo "Error renewing certificate: $output" >>"$log_file"
        return 1
    fi

    echo "Certificate renewal successful." >>"$log_file"
    return 0
}

renew_certificate 