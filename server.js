// server.js
// where your node app starts

console.log(process.env.TEST);

//FS
var FS = require('file-system');

var info = JSON.parse(FS.readFileSync("info.json"));

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//Socket
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});

//Discord
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("ready", () => {
  console.log("Bot started");
});

bot.on("message", (message) => {
  let msg = message.content;
  
  //Store message in JSON
  let obj = {
    "id" : message.id,
    "message" : message.cleanContent,
    "author" : message.author.username,
    "channel" : message.channel.id
  }
  
  //console.log(obj);
  saveMessage(obj);
});

bot.login(process.env.TOKEN);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/data', function(req, res){
  //res.send('hello world'); //replace with your data here
  
  return res.json({
    data: {"message" : "Hey sup", "username" : "theboioi"}
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//Save
function save(){
  FS.writeFile("info.json", JSON.stringify(info));
}

//Save
function saveMessage(obj){
  FS.writeFile("public/data.json", JSON.stringify(obj));
}