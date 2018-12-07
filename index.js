// ================= config
var language = 'pl'; // default language code
var deviceName = 'Google Home';
var ip = '192.168.1.20'; // default IP

// main
var googlehome = require('./google-home-notifier');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

googlehome.ip(ip, language);
googlehome.device(deviceName,language);

googlehome.notify(text, function(response) {
	console.log(response);
});
