# Dyno Dev

**WIP:ALPHA**

## Who 

If you are a frontend dev who doesn't have time or doesn't know how to write backend code, dyno creates a backend for you frontend from a simple JSON config file. Config files can be generated through the web GUI or via the CLI.

## What

Create a backend for your frontend based on a JSON file (YAML may be supported in the future). Use the cli to push your JSON file and your server is deployed instantly. 

## How

Runs Postgresql in the background, and every project is a new schema in the database. 

## Why

Frontend devs want to prototype quickly, and may not want to spend time spinning up databases or deploy things.

## Install

1. Install the [Docker Desktop](https://www.docker.com/products/docker-desktop) app for desktop for your OS.
1. Open your command line, `cd` to the project and run `docker-compose build .`
1. After it completes run `docker-compose up` to run the multiple apps. 

# Run
1. Run `docker-compose up` from the dyno dev directory.
1. Navigate to `localhost:3000` for the API and `localhost:3001` for the endpoint server.
1. `npm install -g dynodev`.
1. `dynodev init` and answer some questions.
1. `dynodev push`
1. See available routes with `dynodev routes`
1. Try http://localhost3001/api/v1/someroute and see some data
