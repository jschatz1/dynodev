FROM ruby:2.7
RUN apt-get update -qq
RUN apt-get install -y apt-utils
RUN apt-get install -y \
    build-essential \
    postgresql-client && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn
ENV API_HOME /api
RUN mkdir $API_HOME
WORKDIR API_HOME
RUN gem install bundler:2.1.2
COPY Gemfile* $API_HOME
RUN bundle install

COPY . $API_HOME
RUN yarn install --check-files

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
RUN RAILS_ENV=production bundle exec rake assets:precompile
