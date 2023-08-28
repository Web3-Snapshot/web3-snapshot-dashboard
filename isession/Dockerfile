FROM python:3.10-alpine

WORKDIR /app

RUN pip install --upgrade pip && pip install ipython

COPY ./backend/requirements.txt /app/requirements.backend.txt

RUN pip install -r /app/requirements.backend.txt

COPY ./database/requirements.txt /app/requirements.database.txt

RUN pip install -r /app/requirements.database.txt

COPY ./backend/server/config/development.py /app/config/development.py
