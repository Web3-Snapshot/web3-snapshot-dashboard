FROM node:19.4-alpine3.16

WORKDIR /app

COPY package.json /app/

RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]
