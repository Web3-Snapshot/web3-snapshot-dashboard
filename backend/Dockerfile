FROM python:3.11-alpine as base

WORKDIR /app

EXPOSE 5000

RUN pip install --upgrade pip && pip install pipenv

COPY Pipfile.lock Pipfile /app/

RUN pipenv install --deploy --system

COPY . .

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "server:create_app('server.config.production')"]
