FROM node:12
RUN mkdir /endpoint
WORKDIR /endpoint
ARG NODE_ENV
ENV NODE_ENV=development
ARG PORT
ENV PORT=3001
COPY package.json /endpoint/package.json
COPY yarn.lock /endpoint/yarn.lock
RUN yarn
COPY . /endpoint

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3001

# Start the main process.
CMD ["yarn", "dev"]
