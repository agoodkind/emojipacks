/**
 * Module dependencies.
 */

var isSubdomain = require('./valid').subdomain;
var isUri = require('valid-url').isUri;
var resolve = require('path').resolve;
var exists = require('fs').existsSync;
var prompt = require('co-prompt');
var chalk = require('chalk');

/**
 * Start.
 */

exports.start = function* (subdomain, apitoken, pack) {
  var load;
  if (!subdomain) {
    subdomain = yield ask('Slack subdomain: ', isSubdomain, 'Uh oh! The subdomain should be at least one letter!');
  }
  if (!pack) {
    pack = yield ask('Path or URL of Emoji yaml file: ', isPath, 'Does the path to the yaml file look right? :)');
  }
  if (!apitoken) {
    apitoken = yield ask('Your api token from api.slack.com/custom-integrations/legacy-tokens: ', ((token) => token.length > 5), 'Should be in the form xoxp-*-*');
  }
  load = {
    url: url(subdomain),
    apiToken: apitoken,
    pack: pack
  };
  return load;
}

/**
 * Prompt with validation.
 */

function* ask(message, valid, error) {
  var res;
  do {
    res = yield prompt(message);
    if (!valid(res)) {
      err(error);
    }
  } while (!(valid(res)));
  return res;
}

exports.prompt_ask = ask;

/**
 * is path
 */

function isPath(path) {
  return isUri(path) || exists(resolve(process.cwd(), path));
}

/**
 * Show error message.
 */

function err(message) {
  console.log(chalk.red(message));
}

/**
 * Url.
 */

function url(subdomain) {
  return 'https://' + subdomain + '.slack.com';
}
