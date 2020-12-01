# Dyno CLI

The Dyno CLI is used to manage and deploy your Dyno project from the command line.
A Dyno project automatically deploys your database and provides APIs and basic API access control out of the box.

- Generate Dyno config files for your Dyno project
- Deploy your your Dyno project

## Getting Started

1. `npm install -g dynodev`
1. `dynodev login` (authenticate using the web browser)
1. `dynodev init`

## Commands

Append `--help` to read detailed usage of each given command.

### Configuration Commands

| Command | Description |
|---|---|
| **login** | Authenticate to your Dyno account. Requires access to a web browser. |
| **init**   | Initialize an dyno file. The best place to get started. |
| **link** | Link an existing project to your current config file. |
| **projects** | Gets a list of your current projects. |

### Generation and Deployment Commands

| Command | Description |
|---|---|
| **push** | Push your config file up and build your backend and database. |
| **add** | Add a model or add a property to a model. |
| **routes**   | Get available API routes. |
