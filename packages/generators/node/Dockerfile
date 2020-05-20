FROM node:lts-alpine
WORKDIR /g

COPY generator generator
RUN cd /g/generator && npm install && npm link

CMD 