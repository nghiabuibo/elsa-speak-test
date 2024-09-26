FROM node:20.17.0 as builder

# set working directory
WORKDIR /game

# install app dependencies
COPY ./package*.json ./
RUN npm install

# build app
COPY ./public ./public
COPY ./src ./src
COPY ./.env.production.local ./.env.production.local
RUN npm run build

# copy build to nginx
FROM nginx:1.25.3
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /game/build ./