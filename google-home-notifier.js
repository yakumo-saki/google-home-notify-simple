"use strict";

const MDNS_SUFFIX = "_googlecast._tcp.local";
const DEBUG_LOG = true;

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

var language = "en";

// wait until talk or playing is end.
var async = false;

// cache google home endpoint
var cachedIpOrHost;

/**
 * log output , but only DEBUG_LOG is enabled
 * @param {*} msg
 */
function logDebug(msg) {
    if (DEBUG_LOG) {
        console.log("[DEBUG] " + msg);
    }
}

/**
 * find google home. do not use directly.
 * use getDeviceAddress()
 * @param {*} msg
 */
function getMDNSResponse(resolve, reject) {
    console.log("get mDNS response")
    return new Promise(function (resolve, reject) {
        var mdns = require('multicast-dns')();

        mdns.on('response', function (response) {
            // console.log('got a response packet:', response);

            response.additionals.forEach(function (found) {

                // check found for what we found
                if (found.name.endsWith(MDNS_SUFFIX) && found.type === 'SRV') {
                    logDebug("Found google home **********************");
                    logDebug(found.data.target)
                    logDebug(found.data.port)
                    logDebug("****************************************");

                    // resolve(found);
                }
            });

            logDebug("mDNS destroy");

            reject();
            mdns.destroy();
        });

        mdns.query({
            questions: [{
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

    return getMDNSResponse().then(function (resolve) {
        logDebug("Discover google home by mDNS = " + resolve.data.target)
        cachedIpOrHost = resolve.data.target;
        return resolve.data.target;
    }, function (reject) {
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

function getInstanceByIp(ip, lang) {
    cachedIpOrHost = ip;
    if (lang != undefined) {
        language = lang;
    }
    return this;
}

function getInstance(lang) {
    if (lang != undefined) {
        language = lang;
    }
    return this;
}

/**
 * Talk text by TTS
 * @param {} message
 * @param {*} callback
 */
function notify(message, language) {
    var hostOrIp;

    var lang = language != undefined ? language : lang;

    return getDeviceAddress()
        .then(function (deviceAddress) {
            hostOrIp = deviceAddress
            return getSpeechUrl(message, lang);
        }).then(function (url) {
            logDebug("got google TTS url: " + url);
            return playUrlOnGoogleHome(hostOrIp, url);
        }).catch(function (err) {
            console.error(err.stack);
        });
};

function getSpeechUrl(text, lang, callback) {
    var googletts = require('google-tts-api');
    var googlettsaccent = lang;
    logDebug("google TTS text = " + text + " language=" + lang);

    return googletts.getAudioUrl(text, {lang: lang, slow: false});
};

/**
 * play mp3 url.
 * @param {} mp3_url
 */
function play(mp3_url) {
    return getDeviceAddress()
        .then(function (hostOrIp) {
            return playUrlOnGoogleHome(hostOrIp, url);
        })
};

/**
 * Play MP3 url on specified Google Home
 * @param {*} host
 * @param {*} url
 */
function playUrlOnGoogleHome(host, url) {
    return new Promise(function (resolve, reject) {

        var chromecast = new Client();  // chromecast client
        chromecast.on('error', function (err) {
            console.log('Error: %s', err.message);
            chromecast.close();
            reject("Error: " + err.message);
        });

        chromecast.connect(host, function () {
            chromecast.launch(DefaultMediaReceiver, function (err, player) {

                var media = {
                    contentId: url,
                    contentType: 'audio/mp3',
                    streamType: 'LIVE' // BUFFERED or LIVE
                };

                // playing status watcher
                var playing_flag = false;
                player.on('status', function (status) {

                    if (async) return;

                    logDebug(host + " "  + status.playerState);
                    if (!playing_flag && status.playerState == "PLAYING") {
                        logDebug(host + " Started playing");
                        playing_flag = true;
                    } else if (playing_flag && status.playerState == "IDLE") {
                        // IDLE -> PLAYING -> IDLE (playing ended)
                        logDebug(host + " End playing");
                        resolve(host + "playing end.");
                        chromecast.close();
                    }
                });

                player.load(media, { autoplay: true }, function (err, status) {
                    if (async) {
                        // when async playing, we dont need status watching.
                        chromecast.close();
                        resolve("device notified async.");
                    }
                });
            });
        });

    }); // promise
};

// EXPORT
exports.getInstanceByIp = getInstanceByIp;
exports.getInstance = getInstance;
exports.device = device;
exports.lang = language;
exports.notify = notify;
exports.play = play;
exports.debugLog = DEBUG_LOG;
exports.async = async;
exports.playUrlOnGoogleHome = playUrlOnGoogleHome;
