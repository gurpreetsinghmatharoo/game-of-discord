// server.js
// where your node app starts

//FS
var FS = require('file-system');

var info = JSON.parse(FS.readFileSync("info.json"));
//console.log("Loaded JSON:");
//console.log(info);

//API
const GoogleImages = require('google-images');

const client = new GoogleImages(process.env.CSE, process.env.API);

//Wiki
const wiki = require('wikijs').default;

//Songs
var songs = {}

//Split into arrays
for(let song in songs){
  songs[song] = songs[song].split("\n");
}

addSongs(require('./songs.js'));

function addSongs(object) {
  object.forEach(song => {
    songs[song.title] = song.lyrics.split("\n").map(row => row.trim());
  });
}

//Vars
var user = -1;
var songText = -1;
var line = -1;

var chBotspam = "442010845908566016";
var chCasual;

var voiceChannel = null;
var currentSong = null;

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
var randomWords = require('random-words');
var FS = require('file-system');
var Youtube = require('simple-youtube-api');
var ytdl = require('ytdl-core');

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

var youtube = new Youtube(process.env.YOUTUBEAPI);

//Discord
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("ready", () => {
  console.log("Bot started");
  
  //Get botspam channel
  chBotspam = bot.channels.find('id', chBotspam);
  chCasual = bot.channels.find('id', "268100461456916481");
  
  //Start playing
  /*voiceChannel = bot.voiceConnections.find('id', '268082233217122304');
  if (voiceChannel){
    playSong();
  }*/

  //Random message in casual
  /*var interval = 7200000;
  
  function intervalFunc(){
    chCasual.send(choose(info.msgs)[2]);
  }
  
  setInterval(intervalFunc, interval);
  
  console.log(choose(info.msgs)[2]);*/
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
  
  //Commands
  if (msg.substring(0, 1)=="!"){
    let str = msg.substring(1, msg.length);
    let args = str.split(' ');
    let cmd = args[0];
    args.splice(0, 1);
    let channel = message.channel.name;
    
    //Commands
    switch (cmd){
      case "hi":
        message.channel.send("hi");
      break;
        
      //Wiki
      case "wiki":
        let searchVal = args.join(' ');
        console.log("Searching on EvRef for " + searchVal);
        
        wiki({
            apiUrl: 'https://evanescencereference.info/wiki/api.php',
            origin: null
        }).find(searchVal).then(data => {
          message.channel.send(data.raw.fullurl);
        }).catch((err) => {
          message.channel.send("Page not found.");
        });
      break;
      
      //Join voice channel
      case "start":
        if (channel=="botspam"){
          if (message.member.voiceChannel){
            message.member.voiceChannel.join().then((connection) => {
              voiceChannel = connection;
              playSong();
            });
          }else{
            message.channel.send("Please join a voice channel first.");
          }
        }
        else {
          message.channel.send("Not allowed to play here.");
        }
      break;
        
      //Stop
      case "stop":
        if (voiceChannel){
          voiceChannel.disconnect();
          voiceChannel = null;
        }
      break;
        
      //Skip song
      case "skip":
        if (message.member.voiceChannel && voiceChannel != null && currentSong != null){
          currentSong.end();
        };
      break;
        
      case "song":
        let name = objRandom(songs);
        
        let send = choose([
            "I've heard that " + name + " is a good song!",
            name + " is a good one!",
            "I love " + name + "!",
            "You should listen to " + name,
            name + " is REALLY good.",
            name + " is amazing!",
            "Check out " + name,
            "I like " + name
          ]);
        
        message.channel.send(send);
        
        //Youtube
        youtube.searchVideos("Evanescence " + name, 1).then(results => {
          let vid = choose(results);
          
          if (vid.shortURL) message.channel.send(vid.shortURL);
        }).catch(console.log());
      break;
        
      case "image":
        //if (!args[0]) args[0] = "";
        let arg = msg.substring(7, msg.length);
        
        //Filter
        if (arg=="porn") break;
        
        //Page to return
        let page = 1 + Math.floor(Math.random() * 8);
        
        client.search("evanescence " + arg, { page : page }).then(arr => {
            //Return
            let img = choose(arr);
            let url = img.url;

            message.channel.send(url);
        }).catch(err => {
          console.log(err);
          message.channel.send("Sorry, Google messed up and could not return an image");
        });
      break;
        
      case "cat":{
        //Page to return
        let page = 1 + Math.floor(Math.random() * 10);
        
        client.search("cat", { page : page }).then(arr => {
            //Return
            let img = choose(arr);
            let url = img.url;

            message.channel.send(url);
        }).catch(err => {
          console.log(err);
          message.channel.send("Sorry, Google messed up and could not return an image");
        });
      }break;
        
      case "doggo":{
        //Page to return
        let page = 1 + Math.floor(Math.random() * 10);
        
        client.search("cute dogs", { page : page }).then(arr => {
            //Return
            let img = choose(arr);
            let url = img.url;

            message.channel.send(url);
        }).catch(err => {
          console.log(err);
          message.channel.send("Sorry, Google messed up and could not return an image");
        });
      }break;
        
      case "catgif":{
        //Page to return
        let page = 1 + Math.floor(Math.random() * 10);
        
        client.search("cat gifs", { page : page }).then(arr => {
            //Return
            let img = choose(arr);
            let url = img.url;

            message.channel.send(url);
        }).catch(err => {
          console.log(err);
          message.channel.send("Sorry, Google messed up and could not return an image");
        });
      }break;
        
      case "doggif":{
        //Page to return
        let page = 1 + Math.floor(Math.random() * 10);
        
        client.search("puppy gifs", { page : page }).then(arr => {
            //Return
            let img = choose(arr);
            let url = img.url;

            message.channel.send(url);
        }).catch(err => {
          console.log(err);
          message.channel.send("Sorry, Google messed up and could not return an image");
        });
      }break;
      
      case "say":
        message.channel.send(args.join(' '));
        message.delete(0);
        
        info.msgs.push([message.author.id, message.author.username, args.join(' ')]);
        save();
      break;
    }
  }
  //Other
  else if (message.author.id != "480392035518644225"){
    let channel = message.channel.name;
    
    //botspam
    if (channel=="botspam"){
      //Start
      if (user == -1){
        //Check
        for(let song in songs){
          let text = songs[song];
          
          if (strClose(msg, text[0])){
            //Set vars
            user = message.author.id;
            songText = text;
            line = 2;
            
            //Send remaining words
            let strArr = msg.split(" ");
            let srcArr = songText[0].split(" ");

            let newLen = strArr.length;
            let srcLen = srcArr.length;

            let diff = Math.max(0, srcLen - newLen);

            if (diff > 0){
              srcArr.splice(0, newLen);

              message.channel.send(srcArr.join(" "));
            }

            //Send
            message.channel.send(text[1]);
            
            //End
            break;
          }
        }
      }
      //Continue
      else{
        //Check
        if (strClose(msg, songText[line])){
          //Send remaining words
          let strArr = msg.split(" ");
          let srcArr = songText[line].split(" ");
          
          let newLen = strArr.length;
          let srcLen = srcArr.length;
          
          let diff = Math.max(0, srcLen - newLen);
          
          if (diff > 0){
            srcArr.splice(0, newLen);
            
            message.channel.send(srcArr.join(" "));
          }
          
          //Send new line
          message.channel.send(songText[line+1]);
          
          line += 2;
          
          //End
          if (line >= songText.length){
            //Reset
            user = -1;
            songText = -1;
            line = -1;

            //Send
            message.channel.send("**You won!**");
          }
        }
        //Failure
        else{
                   
          //Send
          message.channel.send("Wrong! **You lost!**\n\nIt was: *" + songText[line] + "*");
          
          //Reset
          user = -1;
          songText = -1;
          line = -1;
        }
      }
    }
  }
  
  //Other
  //if (msg=="lol") message.channel.send("loool");
});

bot.login(process.env.TOKEN);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

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

//Choose
function choose(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

//Strings are close?
function strClose(str, src){
  //Into arrays
  let strArr = str.split(" ");
  let srcArr = src.split(" ");
  
  //Smaller length
  let minChars = Math.min(strArr.length, srcArr.length);
  
  //Loop to check number of similar words
  let similar = 0;
  
  for(let i=0; i<srcArr.length; i++){
    let srcWord = srcArr[i].toLowerCase();
    
    for(let j=0; j<strArr.length; j++){
      let newWord = strArr[j].toLowerCase();
      
      if (newWord == srcWord){
        similar++;
        
        //Remove word from array
        strArr.splice( strArr.indexOf (newWord), 1 );
        
        break;
      }
    }
  }
  
  //Determine if strings are close enough
  if (similar >= srcArr.length*0.5){
    return true;
  }
  else{
    return false;
  }
}
        
function objRandom(obj){
  let count = 0;
  let result = -1;
        
  for(let name in obj){
    if (Math.random() < 1/++count){
      result = name;
    }
  }
        
  return result;
}

//Play song
function playSong(){
  if (!voiceChannel) return;
  
  let song = objRandom(songs);
  
  //chBotspam.send(":speech_left: Looking up " + song + "...");
  
  //Youtube
  youtube.searchVideos("Evanescence " + song, 1).then(results => {
  //youtube.searchVideos("do u know de wae sound effect", 1).then(results => {
    console.log("Results are here");
    let vid = results[0];
    console.log("Result 0: ", vid.url);

    if (vid.url && voiceChannel != null) {
      console.log("Running...");
      currentSong = voiceChannel.playStream(ytdl(vid.url, { filter : 'audioonly' }), { passes : 3 });
      
      chBotspam.send(":musical_note: Playing " + song + " :notes:");
      
      currentSong.on('end', () => {
        if (voiceChannel != null){
          chBotspam.send(":+1: Song finished!");
          playSong();
        }
      });
    }
  }).catch(console.log());
}

//Save
function save(){
  FS.writeFile("info.json", JSON.stringify(info));
}

//Save
function saveMessage(obj){
  FS.writeFile("public/data.json", JSON.stringify(obj));
}