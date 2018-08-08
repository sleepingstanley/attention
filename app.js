const express = require('express')
const app = express();
const socket = require('socket.io-client')(process.env.SOCKET_SERVER || 'http://localhost:2018');
const moment = require('moment');

let lastChecked = undefined, status = undefined, connected = false;

app.set('view engine', 'pug');
app.set('port', process.env.PORT || 3000);

app.use('/static', express.static('public'));

socket.on('connect', () => {
  connected = true;
  socket.emit('whatstatus');
});

socket.on('disconnect', () => {
  connected = false;
});

socket.on('whatstatus', (data) => {
  status = data;
  lastChecked = Date.now();
});

app.get('/', (req, res) => {
  if (connected) {
    res.render('index', { title: 'Let\'s get Stanley\'s attention!', time: moment(lastChecked).from(), status });
    socket.emit('whatstatus');
  } else {
    res.render('index', { title: 'Uh oh... you won\'t be getting any attention' });
  }
});

app.get('/done', (req, res) => {
  res.render('done', { title: 'Let\'s see how long it takes...' });
});

app.get('/lights', (req, res) => {
  socket.emit('needattention');
  res.redirect('/done');
});

app.listen(app.get('port'), () => console.log(`Attention app listening on port ${app.get('port')}!`));