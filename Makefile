print-vars:
	@echo "ENVIRONMENT: $(ENVIRONMENT)"
	@echo "DOMAIN: $(DOMAIN)"

start:
	docker compose -f docker-compose.$(ENVIRONMENT).yml up -d frontend backend db

stop:
	docker compose -f docker-compose.$(ENVIRONMENT).yml down

build:
	docker compose -f docker-compose.$(ENVIRONMENT).yml build

connect-frontend:
	docker compose -f docker-compose.production.yml exec -it frontend /bin/sh

logs:
	docker compose -f docker-compose.$(ENVIRONMENT).yml logs -f

ps:
	docker compose -f docker-compose.$(ENVIRONMENT).yml ps

logs-db:
	docker compose -f docker-compose.$(ENVIRONMENT).yml exec db tail -f /app/cron.log

isession:
	docker compose -f docker-compose.$(ENVIRONMENT).yml start interactive_db \
	&& docker compose -f docker-compose.$(ENVIRONMENT).yml exec interactive_db ipython \
	&& docker compose -f docker-compose.$(ENVIRONMENT).yml stop interactive_db

start-cert-server:
	docker compose -f docker-compose.certbot.yml up -d nginx80

stop-cert-server:
	docker compose -f docker-compose.certbot.yml down 

get-certificate: start-cert-server
	docker compose -f docker-compose.certbot.yml run --rm  certbot certonly --webroot \
		--webroot-path /var/www/certbot/ --dry-run -d www.$(DOMAIN) -d $(DOMAIN) -v                 

renew-cert: start-cert-server
	docker compose -f docker-compose.certbot.yml run --rm  certbot renew --webroot --webroot-path /var/www/certbot/
