const axios = require("axios");
const {getToken} = require("../lib/loginUser");
const {
  chalk,
  error,
} = require("@vue/cli-shared-utils");

module.exports.addAuthHeader = function() {
  const authToken = getToken();
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

function otherStatus(error, url) {
  const status = error.response.status
  return {status,
    msg: chalk.red(`Uh oh. There's a bug in our CLI. 
      Do you mind reporting the bug to our Git Repo?
      https://github.com/jschatz1/dyno_cli/issues/new?title=Error ${status}&body=${encodeURIComponent(url)}
      Status ${status} for ${url}.`)};
}

function unauthenticatedStatus() {
  return {status: 401, msg: chalk.red("You are not logged in. Try `dyno login`")};
}

module.exports.get = async function(url) {
  try {
    return await axios.get(url);
  } catch(error) {
    const unauthenticated = unauthenticatedStatus();
    const other = otherStatus(error, url)
    if(error.response.status === unauthenticated.status) {
      console.log(unauthenticated.msg);
    } else {
      console.log(other.msg);
    }
    throw error;
  }
}