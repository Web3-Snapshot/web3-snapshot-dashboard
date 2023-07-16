#!/bin/bash

DOMAIN=web3snapshot.loxosceles.me

docker compose run --rm  certbot certonly --webroot \
    --webroot-path /var/www/certbot/ --dry-run \
    -d www.${DOMAIN} -d ${DOMAIN} -v