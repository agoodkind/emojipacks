/**
 * Module dependencies.
 */

var cheerio = require('cheerio');
var thunkify = require('thunkify-wrap');
var request = thunkify(require('request'));
var write = require('./debug').write;
var req = require('request');
var fs = require('fs');
var ask = require('./prompt').prompt_ask;
var isPassword = require('./valid').password;

/**
 * Expose `Slack`.
 */

module.exports = Slack;

/**
 * Static variables
 */

var emojiAddEndpoint = '/api/emoji.add';

// required to avoid "This browser is not supported" message
var headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
};

/**
 * Initialize a new `Slack`.
 */

function Slack(opts, debug) {
  if (!(this instanceof Slack)) return new Slack(opts);
  this.opts = opts;
  this.debug = debug;

  /**
   * Do everything.
   */

  this.import = function* () {
    try {
      console.log('Starting import');
    } catch (e) {
      console.log('Uh oh! ' + e);
      throw e;
    }
    console.log('Getting emoji page');
    var emojiList = '';
    var aliasList = '';
    for (var i = 0; i < Object.keys(this.opts.emojis).length; i++) {
      var e = this.opts.emojis[i];
      if (e.src) {
        var uploadRes = yield this.upload(e.name, e.src);
        emojiList += ' :' + e.name + ':';
      }
      if (e.aliases) {
        for (var n = 0; n < e.aliases.length; n++) {
          yield this.alias(e.name, e.aliases[n]);
          aliasList += ' :' + e.aliases[n] + ':';
        }
      }
    }
    console.log('Uploaded emojis:' + emojiList);
    console.log('Uploaded emoji aliases:' + aliasList);
    return 'Success';
  };

  /**
   * Upload the emoji.
   */

  this.upload = function* (name, emoji) {
    console.log('Uploading %s with %s', name, emoji);
    return new Promise(function (resolve, reject, notify) {
      var opts = this.opts;
      var r = req({
        url: opts.url + emojiAddEndpoint,
        headers: headers,
        method: 'POST',
        jar: opts.jar,
        followAllRedirects: true
      }, function (err, res, body) {
        if (err || !body) return reject(err);
        resolve(body);
      });
      var form = r.form();
      form.append('name', name);
      form.append('mode', 'data');
      form.append('image', req(emoji));
      form.append('token', opts.apiToken);
    }.bind(this));
  };

  this.alias = function* (name, alias) {
    console.log('Aliasing %s to %s', alias, name);
    return new Promise(function (resolve, reject, notify) {
      var opts = this.opts;
      var r = req({
        url: opts.url + emojiAddEndpoint,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        },
        method: 'POST',
        jar: opts.jar,
        followAllRedirects: true
      }, function (err, res, body) {
        if (err || !body) return reject(err);
        resolve(body);
      });
      var form = r.form();
      form.append('name', alias);
      form.append('mode', 'alias');
      form.append('alias', name);
      form.append('token', opts.apiToken);
    }.bind(this));
  };
}
