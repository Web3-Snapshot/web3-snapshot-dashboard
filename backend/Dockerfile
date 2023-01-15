FROM python:3.9-alpine

# set working directory
WORKDIR /app

# Install
# RUN apk update && apk install

# add and install requirements
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# add app
COPY . /app

EXPOSE 5000

# run server
ENV FLASK_APP=server
# ENV VSCODE_DEBUGGER=1
CMD ["flask", "run", "--host", "backend", "--port", "5000"]
