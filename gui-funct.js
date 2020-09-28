const electron = require('electron').remote;
var fs = require('fs-extra');
const path = require('path');
const dialog = require('electron').remote.dialog;
const process = require('child_process');

function appendOutput(msg) { getCommandOutput().value = (msg+'\n'); };
function setStatus(msg)    { getStatus().innerHTML = msg; };
function arg() { return document.getElementsByClassName("textinputs");  };

function getDeviceData() {

  var ideviceinfo = './bin/ideviceinfo/ideviceinfo'
  var getecid = process.spawn(ideviceinfo, ['-k' + 'DieID']);

  getecid.stdout.on('data', (data) => {
    document.getElementById('ecid').value = data;
});

  var getptype = process.spawn(ideviceinfo, ['-k' + 'ProductType']);

  getptype.stdout.on('data', (data) => {
    document.getElementById('device').value = data;
  });

  getptype.stderr.on('data', (error) => {
  console.log(`${error}`);
});


};


function backgroundProcess() {
    var original = __dirname + '/bin/tssChecker/tsschecker';
    var userData = electron.app.getPath('userData');
    var cmd = userData + '/' + 'tsschecker';
    fs.ensureDir(userData);
    fs.copy(original, cmd);
    var isOn = (arg()[4].checked == true) ? "-s":"";

    var child = process.spawn(cmd, ['-d' + arg()[0].value, '-i' + arg()[1].value, isOn, '-e' + arg()[2].value, '-g' + arg()[3].value], {
      cwd: userData
    });
    child.on('error', function(err) {
      appendOutput('stderr: <'+err+'>' );
    });

    child.stdout.on('data', function (data) {
      appendOutput(data);
      if (arg()[4].checked == true) {
      var dirPath = path.resolve(userData);
      var filesList;
      fs.readdir(dirPath, function(err, files){
        filesList = files.filter(function(e){
          return path.extname(e).toLowerCase() === '.shsh2'
  });

  let src = userData + '/' + filesList[0];
  let dest = electron.app.getPath('documents') + '/' + 'SHSH Blobs' + '/' + document.getElementById('device').value + '/';
  fs.ensureDir(dest)

  fs.move(src, dest + filesList[0], { overwrite: true }, err => {
    if (err) return console.error(err)
  })

})};
    });

    child.stderr.on('data', function (data) {
      appendOutput('stderr: <'+data+'>' );
    });

    child.on('close', function (code) {
      if (arg()[4].checked == true) {
      setStatus('Blobs saved to Documents folder');
    };
        getCommandOutput().style.background = "DarkGray";
    });
};
