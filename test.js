var googlehome = require('./google-home-notifier');
var deviceName = "test"
var language = "ja"

//googlehome.device(deviceName,language);
var gh = googlehome.ip("10.1.0.132", "ja");
gh.lang = "ja";
gh.debugLog = true;

gh.notify("本日は晴天なり")
.then(function() {
  console.log("done");
}).then(function() {
  gh.notify("あめだよ");
})
