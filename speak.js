var googlehome = require('./google-home-notifier');

const DEBUG_LOG = true;

/**
 * log output , but only DEBUG_LOG is enabled
 * @param {*} msg
 */
function logDebug(msg) {
    if (DEBUG_LOG) {
        logDebug(msg);
    }
}
async function getGoogleHomeIP() {
    var mdns = require('./mdns-scan')

    mdns.getMDNSResponse().then(function (value) {
        console.log("google home ip = " + value.data);
        return value.data;
    }).catch(function (e) {
        throw e;
    });
}

async function doit(ip) {
    var gh = googlehome.getInstance();
    gh.language = "ja";
    gh.debugLog = true;
    gh.async = false;

    var speaks = [];
    for (var i = 2; i < process.argv.length; i++) {
        console.log("doit param = " + process.argv[i]);
        await gh.notify(process.argv[i], "ja");
    }
}

async function doit2(ip) {
    var gh = googlehome.ip(ip, "ja");

    var speaks = [];
    for (var i = 2; i < process.argv.length; i++) {
        speaks.push(new Promise(function (resolve, reject) {
            console.log(process.argv[i]);
            return gh.notify(process.argv[i])
        }));
    }

    Promise.all(speaks);
}


(async () => {
    try {
        doit();
    } catch (e) {
        // Deal with the fact the chain failed
        console.error("error " + e);
    }
})();

