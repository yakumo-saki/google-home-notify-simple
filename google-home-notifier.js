"use strict";

const DEBUG_LOG = true;

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

var language = "en";

// wait until talk or playing is end.
var async = false;

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
exports.lang = language;
exports.debugLog = DEBUG_LOG;
exports.async = async;
exports.playUrlOnGoogleHome = playUrlOnGoogleHome;
