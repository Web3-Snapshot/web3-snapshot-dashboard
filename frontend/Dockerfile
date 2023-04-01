FROM node:19.4-alpine3.16 as build

WORKDIR /app

EXPOSE 80
EXPOSE 443

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile && yarn cache clean

COPY public /app/public/
COPY src /app/src/

RUN yarn run build

FROM nginx:stable-alpine3.17

COPY ./nginx/default.conf /etc/nginx/conf.d/
COPY --from=build /app/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
