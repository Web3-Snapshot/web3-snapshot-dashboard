FROM node:19.4-alpine3.16

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install --frozen-lockfile && yarn cache clean

EXPOSE 3000

COPY . .

CMD ["yarn", "start"]
