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
  client.on('needattention', data => {
    flashLights(3);
  });

  client.on('whatstatus', data => {
    isRunning('chrome.exe').then(chromeStatus => {
      isRunning('code.exe').then(vsCodeStatus => {
        isRunning('discord.exe').then(discordStatus => {
          isRunning('iTunes.exe').then(iTunesStatus => {
            client.emit('whatstatus', [
              { name: 'Web Browsing', checked: chromeStatus },
              { name: 'Programming', checked: vsCodeStatus },
              { name: 'Chatting with friends (Discord)', checked: discordStatus },
              { name: 'Listening to Apple Music', checked: iTunesStatus }
            ]);
          });
        });
      });
    });
  });
});

io.listen(2018);