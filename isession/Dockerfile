FROM python:3.10-alpine

WORKDIR /app

RUN pip install --upgrade pip && pip install pipenv ipython

COPY ./backend/Pipfile /app/

RUN pipenv install --deploy --system --skip-lock

RUN rm -rf /app/Pipfile*

COPY ./database/Pipfile /app/

RUN pipenv install --deploy --system --skip-lock

RUN rm -rf /app/Pipfile*

COPY ./backend/server/config/development.py /app/config/development.py
