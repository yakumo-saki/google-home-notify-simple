"use strict";

const MDNS_SUFFIX = "_googlecast._tcp.local";
const DEBUG_LOG = true;

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

var language = "en";

// cache google home endpoint
var cachedIpOrHost;

/**
 * log output , but only DEBUG_LOG is enabled
 * @param {*} msg
 */
function logDebug(msg) {
  if (DEBUG_LOG) {
    console.log(msg);
  }
}

/**
 * find google home. do not use directly.
 * use getDeviceAddress()
 * @param {*} msg
 */
function getMDNSResponse(resolve, reject) {
	console.log("get mDNS response")
	return new Promise(function(resolve, reject) {
		var mdns = require('multicast-dns')();

		mdns.on('response', function(response) {
			// console.log('got a response packet:', response);

			response.additionals.forEach(function(found) {
				logDebug("===");
				logDebug(found);
				logDebug("===");

			// check found for what we found
			if (found.name.endsWith(MDNS_SUFFIX) && found.type === 'SRV') {
          logDebug("Found google home **********************");
					logDebug(found.data.target)
					logDebug(found.data.port)
					logDebug("****************************************");

					resolve(found);
				}
			});

			logDebug("mDNS destroy");

			reject();
			mdns.destroy();
		});

		mdns.query({
			questions:[{
				name: MDNS_SUFFIX,
				type: 'PTR'
			}]
		});

	});
}

/**
 * get google home ip or hostname.
 * @param {*} msg
 * @returns promise
 */
function getDeviceAddress() {
	if (cachedIpOrHost != null) {
    logDebug("Discover google home by cache = " + cachedIpOrHost);
		return Promise.resolve(cachedIpOrHost);
	}

	return getMDNSResponse().then(function(resolve) {
    logDebug("Discover google home by mDNS = " + resolve.data.target)
    cachedIpOrHost = resolve.data.target;
		return resolve.data.target;
	}, function(reject) {
		return null;
	});
}

function device(name, lang) {
    console.log("not yet implemented");
    device = name;
    if (lang != undefined) {
      language = lang;
    }
    return this;
};

function ip(ip, lang) {
  cachedIpOrHost = ip;
  if (lang != undefined) {
    language = lang;
  }
  return this;
}

function notify(message, callback) {
	return getDeviceAddress().then(function (deviceAddress) {
		getSpeechUrl(message, deviceAddress, function(res) {
      if (callback) callback(res)
		});
	})
};

 function play(mp3_url, callback) {
	getDeviceAddress().then(function (deviceAddress) {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      if (callback) callback(res)
    });
	})
};

function getSpeechUrl(text, host, callback) {
  var googletts = require('google-tts-api');
  var googlettsaccent = language;
  logDebug("google TTS text = " + text + " language=" + language);

  googletts(text, language, 1, 1000, googlettsaccent).then(function (url) {
    logDebug("got google TTS url: " + url);

    playOnGoogleHome(host, url, function(res){
      if (callback) callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

function getPlayUrl(url, host, callback) {
    playOnGoogleHome(host, url, function(res){
      if (callback) callback(res)
    });
};

/**
 * Play MP3 url on specified Google Home
 * @param {*} host
 * @param {*} url
 * @param {*} callback
 */
function playOnGoogleHome(host, url, callback) {
  var chromecast = new Client();  // chromecast client
  chromecast.connect(host, function() {
    chromecast.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'LIVE' // BUFFERED or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        chromecast.close();
        callback('Device notified');
      });
    });
  });

  chromecast.on('error', function(err) {
    console.log('Error: %s', err.message);
    chromecast.close();
    callback('error');
  });
};

// EXPORT
exports.ip = ip;
exports.device = device;
exports.lang = language;
exports.notify = notify;
exports.play = play;
exports.debugLog = DEBUG_LOG;
