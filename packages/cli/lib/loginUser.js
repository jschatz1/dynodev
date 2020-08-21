const { postAuth, getAuth, baseURL } = require("../services/auth");
const dotenv = require('dotenv');
const open = require('open');
const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();
const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
let accessToken;
let dynoConfigKey = "DYNO_ACCESS_TOKEN";
let dynoPath = path.join(homedir, '.dyno')

function saveToken(token) {
  fs.writeFileSync(dynoPath, `${dynoConfigKey}=${token}`);
  return true
};

async function openBrowser(url) {
  console.log(`${chalk.gray("Opening browser to")} ${chalk.green(`${url}`)}`);
  const cp = await open(url, {wait: false})
  cp.on('error', err => {
    console.log(err)
  })
  cp.on('close', code => {
    if (code !== 0) {
      console.log("closed", code);
    }
  })
};

async function fetchAuth(cli_url, token) {
  let tries = 0;
  async function retry() {
    setTimeout(async function() {
      try{
        const {data} = await getAuth(cli_url, token);
        console.log(chalk.green(data.msg));
        console.log(chalk.gray("Saving access token"));
        try{
          saveToken(data.token);
        } catch(error) {
          console.log("Could not save access token", error);
        }
        
        return
      } catch(error) {
        if(tries > 3) {
          console.log(chalk.red("Could not log in successfully. Try again."))
          return
        } else {
          tries += 1;
          console.log(chalk.gray("Checking validation token again..."));
          await retry();
        }
      }
    }, 3000);
  }
  return retry();
};

module.exports.getToken = function getToken() {
  try{
    return dotenv.parse(fs.readFileSync(dynoPath, { encoding: 'utf8' }))[dynoConfigKey];
  } catch(error) {
    console.log(chalk.red)
  }
}

module.exports.loginUser = async function loginUser() {
  let urls;
  try{
    const {data} = await postAuth();
    urls = data;
  } catch(e) {
    console.log("Unable to log in at this time!");
    return;
  }
  await openBrowser(`${baseURL}${urls.browser_url}`);
  console.log(chalk.gray("Validating token"));
  await fetchAuth(urls.cli_url, urls.token);
};