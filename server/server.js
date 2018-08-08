const io = require('socket.io')();
const hue = require('node-hue-api');
const exec = require('child_process').exec;
const config = require('./config');
const api = new hue.HueApi(config.host, config.user), lightState = hue.lightState, flashRed = lightState.create().shortAlert();

api.setLightState(4, lightState.create().on().brightness(100).rgb(255, 85, 74).off());

let flashLights = (start, amt = start) => {
  setTimeout(() => {
    api.setLightState(4, flashRed)
      .then(() => {
        if (--amt > 0)
          flashLights(start, amt);
      }).done();
  }, amt == start ? 0 : 1000);
}

let isRunning = (query, cb) => {
  return new Promise(resolve => exec('tasklist', (err, stdout, stderr) => resolve(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1)));
}

io.on('connection', client => {
  client.on('needattention', () => {
    flashLights(3);
  });

  client.on('whatstatus', () => {
    let keys = Object.keys(config.programs), statuses = [];
    for (var i = 0; i < keys.length; i++) {
      let exe = keys[i];
      isRunning(exe).then(status => {
        statuses.push({ name: config.programs[exe], checked: status });
        if (i == keys.length)
          client.emit('whatstatus', statuses);
      });
    }
  });
});

io.listen(2018);