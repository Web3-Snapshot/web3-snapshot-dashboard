FROM python:3.10-alpine as base

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

ENV FLASK_APP=server

EXPOSE 5000

########### IMAGE : DEBUGGER ###################
FROM base as debug
RUN pip install ptvsd

CMD python -m ptvsd --host 0.0.0.0 --port 5678 --wait --multiprocess -m flask run -h backend -p 5000

########### IMAGE: PRODUCTION ###################
FROM base as prod

CMD ["flask", "run", "--host", "backend", "--port", "5000"]
