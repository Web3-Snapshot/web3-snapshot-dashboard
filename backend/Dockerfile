FROM python:3.10-alpine

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY . /app

EXPOSE 5000

ENV FLASK_APP=server

CMD ["flask", "run", "--host", "backend", "--port", "5000"]
