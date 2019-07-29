var googlehome = require('./google-home-notifier');
var mdns_scan = require('./mdns-scan');

const DEBUG_LOG = true;

/**
 * log output , but only DEBUG_LOG is enabled
 * @param {*} msg
 */
function logDebug(msg) {
    if (DEBUG_LOG) {
        console.log("[DEBUG] " + msg);
    }
}

function getSpeechUrl(text, lang, callback) {
    var googletts = require('google-tts-api');
    var googlettsaccent = lang;
    logDebug("google TTS text = " + text + " language=" + lang);

    return googletts(text, lang, 1, 1000)
};


async function doit() {

    var gh = googlehome.getInstance();
    gh.language = "ja";
    gh.debugLog = true;
    gh.async = false;

    var speaks = [];
    for (var i = 2; i < process.argv.length; i++) {
        logDebug("doit param = " + process.argv[i]);
        var url = await getSpeechUrl(process.argv[i], "ja");
        logDebug(process.argv[i] + " => " + url );
        await gh.notify(process.argv[i], "ja");
    }
}

async function doit2() {

    var google_homes;
    var url;
    await Promise.all([
        new Promise(async function(resolve) {
            url = await getSpeechUrl(process.argv[2], "ja");
            resolve();
        }),
        new Promise(async function(resolve) {
            google_homes = await mdns_scan.getMDNSResponse();
            logDebug(google_homes);
            resolve();
        })
    ]).then(function() {
        // logDebug(google_homes);
        google_homes.forEach(function (host) {
            googlehome.playUrlOnGoogleHome(host, url);
        });
    });
}

(async () => {
    try {
        doit2();
    } catch (e) {
        // Deal with the fact the chain failed
        console.error("error " + e);
    }
})();

