FROM python:3.10-alpine as base

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

ENV FLASK_APP=server

########### IMAGE : DEBUGGER ###################
FROM base as debug

EXPOSE 5000

RUN pip install ptvsd

CMD python -m ptvsd --host 0.0.0.0 --port 5678 --wait --multiprocess -m flask run -h backend -p 5000

########### IMAGE: PRODUCTION ###################
FROM base as prod

COPY . .

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "server:create_app()"]
