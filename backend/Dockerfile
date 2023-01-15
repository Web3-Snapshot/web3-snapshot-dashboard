FROM python:3.10-alpine

# set working directory
WORKDIR /app

# add and install requirements
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# add app
COPY . /app

EXPOSE 5000

# run server
ENV FLASK_APP=server
CMD ["flask", "run", "--host", "backend", "--port", "5000"]
