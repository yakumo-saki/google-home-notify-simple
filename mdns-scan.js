var DEBUG_LOG = true;

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

                // check found for what we found
                if (!found.name.endsWith(options.dnsSuffix) || found.type !== 'SRV') {
                    // discard these:
                    // TXT record
                    // _googlerpc._tcp.local
                    // logDebug("Unknown record returned:" + found.type + " " + found.name);
                } else {
                    const name = found.name.toUpperCase();
                    if (name.startsWith("CHROMECAST")) {
                        logDebug("Found chromecast **********************************");
                        if (options.chromecast) {
                            google_homes.push(found.data.target);
                        }
                    } else if (name.startsWith("GOOGLE-HOME")) {
                        logDebug("Found Google home *********************************");
                        if (options.googleHome) {
                            google_homes.push(found.data.target);
                        }
                    } else {
                        logDebug("Found unknown device ******************************");
                    }
                    logDebug(found.name)
                    logDebug(found.data.target + " port " + found.data.port);
                    logDebug("***************************************************");

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
            // reject();
            logDebug("mDNS destroy");
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
