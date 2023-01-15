FROM python:3.10-alpine

WORKDIR /app

RUN pip install --upgrade pip && pip install ipython

COPY ./backend/requirements.txt /app/requirements.txt

RUN pip install -r /app/requirements.txt

COPY ./backend/config/development.py /app/config/development.py

ENTRYPOINT [ "ipython" ]
