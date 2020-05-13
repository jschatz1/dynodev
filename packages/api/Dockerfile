FROM node:10
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile
COPY . .
ENTRYPOINT [ "node", "./src/index.js" ]