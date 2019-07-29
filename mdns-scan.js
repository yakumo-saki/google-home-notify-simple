const MDNS_SUFFIX = "_googlecast._tcp.local";
const DEBUG_LOG = true;

const MDNS_WAIT_MS = 300;

function logDebug(msg) {
    if (DEBUG_LOG) {
        console.log("[DEBUG] " + msg);
    }
}

function getMDNSResponse() {

    logDebug("get mDNS response")

    return new Promise(function (resolve, reject) {
        var mdns = require('multicast-dns')();

        var google_homes = new Array();

        logDebug("Wait for mDNS response (" + MDNS_WAIT_MS + "ms).");

        mdns.on('response', function (response) {
            response.additionals.forEach(function (found) {

                // check found for what we found
                if (found.name.endsWith(MDNS_SUFFIX) && found.type === 'SRV') {
                    logDebug("Found google home **********************");
                    logDebug(found.data.target)
                    logDebug(found.data.port)
                    logDebug("****************************************");

                    google_homes.push(found.data.target);
                }
            });

        });

        mdns.query({
            questions: [{
                name: MDNS_SUFFIX,
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
                reject();
            }
        }, 3000);

    });
}


// EXPORT
exports.getMDNSResponse = getMDNSResponse;

// getMDNSResponse();
