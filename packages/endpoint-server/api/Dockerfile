FROM node:12
COPY . /endpoint
WORKDIR /endpoint
RUN yarn --ignore-optional

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3001

# Start the main process.
CMD ["yarn", "dev"]
