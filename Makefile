start:
	docker compose -f docker-compose.dev.yml up -d

stop:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-db:
	docker compose -f docker-compose.dev.yml exec db tail -f /app/cron.log

isession:
	docker compose -f docker-compose.dev.yml start interactive_db \
	&& docker compose -f docker-compose.dev.yml exec interactive_db ipython \
	&& docker compose -f docker-compose.dev.yml stop interactive_db
