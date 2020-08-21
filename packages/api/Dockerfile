FROM ruby:2.7
RUN apt-get update -qq && \
    apt-get install -y \
    build-essential \
    postgresql-client && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn
RUN mkdir /api
WORKDIR /api
RUN gem install bundler:2.1.2
COPY Gemfile /api/Gemfile
COPY Gemfile.lock /api/Gemfile.lock
RUN bundle install
RUN yarn --check-files
RUN rake webpacker:compile
RUN rake assets:precompile
COPY . /api
# make sure the packs don't get pushed over
RUN rm -rf /api/public/packs

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
