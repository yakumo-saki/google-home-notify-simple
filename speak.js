var googlehome = require('./google-home-notifier');

async function doit() {
  var gh = googlehome.ip("10.1.0.132", "ja");
  gh.lang = "ja";
  gh.debugLog = true;
  gh.async = false;

  var speaks = [];
  for(var i = 2;i < process.argv.length; i++){
    await gh.notify(process.argv[i]);
  }
}

async function doit2() {
  var speaks = [];
  for(var i = 2;i < process.argv.length; i++){
    speaks.push(new Promise(function(resolve, reject) {
      return gh.notify(process.argv[i])
    }));
  }

  Promise.all(speaks);
}

//googlehome.device(deviceName,language);

doit();
