FROM node:10
WORKDIR /app
COPY . .
RUN yarn
ENTRYPOINT [ "node", "./src/index.js" ]