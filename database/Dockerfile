FROM python:3.9-alpine

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

COPY crontab /etc/cron.d/crontab

RUN crontab /etc/cron.d/crontab

CMD ["/usr/sbin/crond", "-f"]
