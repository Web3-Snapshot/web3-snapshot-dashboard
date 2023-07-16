start:
	docker compose -f docker-compose.$(ENVIRONMENT).yml up -d

stop:
	docker compose -f docker-compose.$(ENVIRONMENT).yml down

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
