var googlehomeNotifier = require('./google-home-notifier');
var mdnsScanner = require('./mdns-scan');

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

    return googletts.getAudioUrl(text, {lang: lang, slow: false});
};

async function speakOnGoogleDevice() {

    var googleHomes;
    var url;
    await Promise.all([
        new Promise(async function(resolve) {
            url = await getSpeechUrl(process.argv[2], "ja");
            resolve();
        }),
        new Promise(async function(resolve) {
            googleHomes = await mdnsScanner.getMDNSResponse();
            logDebug(googleHomes);
            resolve();
        })
    ]).then(function() {
        // logDebug(google_homes);
        googleHomes.forEach(function (host) {
            googlehomeNotifier.playUrlOnGoogleHome(host, url);
        });
    });
}

(async () => {
    try {
        speakOnGoogleDevice();
    } catch (e) {
        // Deal with the fact the chain failed
        console.error("error " + e);
    }
})();
