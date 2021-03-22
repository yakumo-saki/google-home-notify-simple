// ====================================================================
//
// Example of Usage of mdns-scan.js
//
// ====================================================================

var mdnsScanner = require('./mdns-scan');

(async () => {
try {
    console.log("scanning Google Home");
    const opt = {"chromecast": false, "googleHome": true, logDebug: false};
    var googleHomes = await mdnsScanner.getMDNSResponse(opt);

    // got Google Home's hostnames (eg: 56789abc-bcde-1234-5678-1234486aabdc.local)
    console.log(JSON.stringify(googleHomes));
} catch (error) {
    console.log("Google Home not found :" + error);
}

})();