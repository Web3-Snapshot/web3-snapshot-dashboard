FROM python:3.11-alpine as base

EXPOSE 5000

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY . .

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "server:create_app('server.config.production')"]
