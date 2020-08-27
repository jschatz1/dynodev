FROM ruby:2.7
RUN apt-get update -qq
RUN apt-get install -y apt-utils
RUN apt-get install -y \
    build-essential \
    postgresql-client && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn
ENV RAILS_ROOT /api/
RUN mkdir $RAILS_ROOT
WORKDIR $RAILS_ROOT
RUN gem install bundler:2.1.2
COPY Gemfile* $RAILS_ROOT
RUN bundle install

COPY . $RAILS_ROOT
RUN yarn install --check-files
RUN RAILS_ENV=production bundle exec rake assets:precompile

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000
# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
