// ====================================================================
//
// Example of google-home-notifier.js usage
//
// ====================================================================

var googlehome = require('./google-home-notifier');
var deviceName = "test"
var language = "ja"

// Get Text to speeched MP3 URL
function getSpeechUrl(text, lang, callback) {
  var googletts = require('google-tts-api');
  console.log("google TTS text = " + text + " language=" + lang);

  return googletts.getAudioUrl(text, {lang: lang, slow: false});
};

googlehome.debugLog = true;

const url = getSpeechUrl("Hello world", "en");
googlehome.playUrlOnGoogleHome("your_google_home_ip_or_hostname", url);

// const url = getSpeechUrl("Hello world", "ja");
// googlehome.playUrlOnGoogleHome("10.1.0.112", url);

