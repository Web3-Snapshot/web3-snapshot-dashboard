FROM python:3.11-alpine

WORKDIR /app

RUN pip install --upgrade pip && pip install pipenv

COPY Pipfile.lock Pipfile /app/

RUN pipenv install --deploy --system --dev

COPY . /app/

COPY crontab /etc/cron.d/crontab

RUN crontab /etc/cron.d/crontab

CMD ["/usr/sbin/crond", "-f"]
