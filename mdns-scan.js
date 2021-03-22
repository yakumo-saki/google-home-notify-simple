var DEBUG_LOG = true;

const TYPE_CHROMECAST = "Chromecast";
const TYPE_GOOGLEHOME = "GoogleHome";
const TYPE_NONE = "NONE";

function logDebug(msg) {
    if (DEBUG_LOG) {
        console.log("[DEBUG] " + msg);
    }
}

function logInfo(msg) {
    console.log("[INFO ] " + msg);
}

const DEFAULT_OPTIONS = {
    "chromecast": false,
    "googleHome": true,
    "replyWaitMs": 3000,
    "dnsSuffix": "_googlecast._tcp.local",
    "debugLog": false
};

/**
 * mdns responseから、それがChromecastか、GoogleHomeか、無関係かを返す
 * @param {*} response.additionals
 */
function getDeviceType(found) {
    // check found for what we found
    const name = found.name.toUpperCase();
    if (name.startsWith("CHROMECAST")) {
        return TYPE_CHROMECAST;
    } else if (name.startsWith("GOOGLE-HOME")) {
        return TYPE_GOOGLEHOME;
    } else {
        return TYPE_NONE;
    }
}

/**
 * mDNSでデバイスを探索する。
 * mDNSは要求をブロードキャストしてから各機器がそれぞれ応答してくるのである程度の
 * 時間内に応答してきたものを返す。
 * @returns 
 */
function getMDNSResponse(mdnsOptions) {

    const options = Object.assign(DEFAULT_OPTIONS, mdnsOptions);
    DEBUG_LOG = options.logDebug;

    logDebug("mDNS Query " + options.dnsSuffix + " (" + options.replyWaitMs + "ms).");

    return new Promise(function (resolve, reject) {
        var mdns = require('multicast-dns')();

        var google_homes = new Array();

        mdns.on('response', function (response) {
            response.additionals.forEach(function (found) {

                if (!found.name.endsWith(options.dnsSuffix) || found.type !== 'SRV') {
                    return;
                }
            
                const type = getDeviceType(found);
                if (type === TYPE_CHROMECAST) {
                    logDebug("Found chromecast: " + found.data.target);
                    if (options.chromecast) {
                        google_homes.push(found.data.target);
                    }
                } else if (type === TYPE_GOOGLEHOME) {
                    logDebug("Found Google Home: " + found.data.target);
                    if (options.googleHome) {
                        google_homes.push(found.data.target);
                    }
                } else {
                    logDebug("Found unknown device" + found.data.target);
                }
            });
        });

        mdns.query({
            questions: [{
                name: options.dnsSuffix,
                type: 'PTR'
            }]
        });

        setTimeout( function() {
            mdns.destroy();

            if (google_homes.length > 0) {
                resolve(google_homes);
            } else {
                reject("No response. maybe no google devices in network.");
            }
        }, options.replyWaitMs);

    });
}

// EXPORT
exports.getMDNSResponse = getMDNSResponse;
