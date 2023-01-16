FROM python:3.9-alpine

# Creating Working
WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r requirements.txt

# Copying the crontab file
COPY crontab /etc/cron.d/crontab

ADD . /app

# run the crontab file
RUN crontab /etc/cron.d/crontab

# Executing crontab command
CMD ["/usr/sbin/crond", "-f"]
