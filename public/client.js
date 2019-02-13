// client-side js
// run by the browser each time your view template referencing it is loaded

//Interface
let btn = document.getElementById("submit-channel");

//Get channel in URL
let channel = window.location.search;
var gameStart = false;

if (channel.length > 1) {
  channel = channel.substr(9, channel.length - 9);
  
  console.log("Channel loaded: " + channel);
  
  gameStart = true;
  
  //Update text box
  let tb = document.getElementById("i_channel");
  tb.value = channel;
}

//Message ID
var messageID = null;
var messageObj = {};
var newMessage = false;

//Message Update
function messageUpdate() {
  $.getJSON("data.json", function(json) {
    if (json.id != messageID && json.channel == channel) {
      console.log("New message received");
      console.log(json);

      messageID = json.id;
      messageObj = json;
      newMessage = true;
    }
  });
  
  setTimeout(function() {
    messageUpdate();
  }, 500);
}

messageUpdate();

//Game logic
if (gameStart) {
  //Variables
  let canvas = document.getElementById("i_game");
  let context = canvas.getContext("2d");
  
  let players = [];
  let sprites = {};
  
  //Text objects
  let textObjs = [];
  
  //Drawing
  let plrMargin = 140;
  let msgWidth = 80;
  let fontSize = 14;

  //Dialogues
  let textSpeed = 1;
  
  //Create
  function Create() {
    //Load Images
    sprites.idle = "sprites/character/idle/idle_";
    sprites.playerSize = 128;
    sprites.playerFrames = 30;
    sprites.playerSpeed = 1;

    //Msg
    sprites.msg = new Image();
    sprites.msg.src = "sprites/UI/msg.png";
    sprites.msgData = {loaded: false};

    sprites.msg.onload = function() {
      sprites.msgData.loaded = true;
      sprites.msgData.cellSize = sprites.msg.width/3;
    }

    //Arrow
    sprites.arrow = new Image();
    sprites.arrow.src = "sprites/UI/arrow.png";
    sprites.arrowData = {loaded: false};

    sprites.arrow.onload = function() {
      sprites.arrowData.loaded = true;
    }

    //Idle
    sprites.playerIdle = [];

    for(let i=0; i<sprites.playerFrames; i++) {
      let img = new Image();
      img.src = sprites.idle + zeroes(i, 3) + ".png";

      sprites.playerIdle.push(img);
    }
    
    //Text
    createText(8, 32, "Stream started!", 120);
  }
  
  Create();
  
  //Step
  function Step() {
    //New message
    if (newMessage) {
      //Data
      let author = messageObj.author;
      let msg = messageObj.message;
      
      //Get player index
      let plr = indexOfPlayer(players, author);
      
      //Create
      if (plr < 0) {
        //Add player
        plr = players.length;
        
        //Position
        let _x, _y;
        do {
          _x = plrMargin + Math.random() * (canvas.width - plrMargin*2);
          _y = plrMargin + Math.random() * (canvas.height - plrMargin*2);
        } while (nearestDist(_x, _y) < 120);
        
        //Push
        players.push({
          "author" : author,
          "x" : _x,
          "y" : _y,
          "message" : messageObj.message,
          "char" : 0
        });
        
        log("New player added");
        
        //Draw
        //drawPlayer(plr);
      }
      
      //Draw message
      players[plr].message = messageObj.message;
      players[plr].char = 0;
      
      //Disable
      newMessage = false;
    }
    
    //Text objects
    for(let i=0; i<textObjs.length; i++) {
      let obj = textObjs[i];
      
      if (obj.life > 0) {
        obj.life--;
      }
      else {
        textObjs.splice(i, 1);
        i--;
      }
    }
  }
               
  Step();
  
  //Draw
  function Draw() {
    //Clear
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    //Draw
    for(let i=0; i<players.length; i++) {
      //Image
      if (!players[i].image) {
        let imgs = sprites.playerIdle;

        /*img.onload = function() {
          drawPlayer(i);
        }*/
        
        players[i].image = imgs;
        players[i].subimg = 0;
      }
      else {
        drawPlayer(i);

        //Animation
        players[i].subimg += sprites.playerSpeed;

        if (players[i].subimg >= players[i].image.length) {
          players[i].subimg -= players[i].image.length;
        }
      }
      
      drawMessage(i);
    }
    
    //Text objects
    for (let i=0; i<textObjs.length; i++) {
      let obj = textObjs[i];
      
      //Alpha
      let alpha = 1;
      let alphaRange = 20;
      
      if (obj.life < alphaRange) alpha = obj.life / alphaRange;
      
      //Draw
      context.fillStyle = "rgb(255, 255, 255, " + alpha + ")";
      context.font = "20px Helvetica";
      context.fillText(obj.text, obj.x, obj.y);
    }
  }
  
  Draw();
    
  //Set Step intervals
  setInterval( function() { Step() }, 1000/30 );
  setInterval( function() { Draw() }, 1000/30 );
  
  //Functions
  //Draw player
  function drawPlayer(plr) {
    let facing = -Math.sign(canvas.width/2 - players[plr].x);
    if (facing==0) facing = 1;

    players[plr].facing = facing;

    let img = players[plr].image;
    let sub = players[plr].subimg;

    context.save();
    context.scale(facing, 1);
    context.drawImage(img[sub], (players[plr].x - sprites.playerSize/2) * facing, players[plr].y - sprites.playerSize/2, sprites.playerSize * facing, sprites.playerSize);
    context.restore();
  }
  
  //Draw message
  function drawMessage(plr) {
    let msg = players[plr].message;
    
    //Height
    let height = 90;
    let lh = 18;
    let heightOrg = height;
    
    //Line breaks
    let count = (msg.match(/\n/g) || []).length;

    height += lh * count;
    
    //Long sentences
    let arr = msg.split(" ");
    /*for(let i=0; i<arr.length; i++) {
      if (i % 4 == 0 && i > 0) {
        arr.splice(i, 0, "\n");
        
        height += lh;
      }
    }
    msg = arr.join(" ");*/

    msg = "";
    let wid = 0;

    for(let i=0; i<arr.length; i++) {
      //Add message
      let add = arr[i];
      if (i < arr.length-1) add += " ";

      msg += add;

      //Add width
      wid += textWidth(add);

      if (wid > msgWidth) {
        msg += "\n";

        wid = 0;
        height += lh;
      }
    }

    //Split by line breaks
    let msgs = msg.split("\n");

    //Draw box
    if (sprites.msgData.loaded) {
      let _w = 0;

      //Get longest line
      for (let l=0; l<msgs.length; l++) {
        let msg_w = textWidth(msgs[l]);

        if (msg_w > _w) _w = msg_w;
      }

      //Coordinates and sizes
      let x1 = players[plr].x - _w/2;
      let x2 = players[plr].x + _w/2;
      let y1 = players[plr].y - height - lh;
      let y2 = players[plr].y - heightOrg + lh;

      let cs = sprites.msgData.cellSize;

      //Offset
      x1 -= cs/2;
      x2 -= cs/2;

      let _h = y2 - y1;

      //Draw
      context.drawImage(sprites.msg, 0, 0, cs, cs, x1, y1, cs, cs); // Top-left
      context.drawImage(sprites.msg, cs*2, 0, cs, cs, x2-cs, y1, cs, cs); // Top-right
      context.drawImage(sprites.msg, cs*2, cs*2, cs, cs, x2-cs, y2-cs, cs, cs); // Bottom-right
      context.drawImage(sprites.msg, 0, cs*2, cs, cs, x1, y2-cs, cs, cs); // Bottom-left

      context.drawImage(sprites.msg, cs, 0, cs, cs, x1+cs, y1, _w - cs*2, cs); // Top
      context.drawImage(sprites.msg, cs, cs*2, cs, cs, x1+cs, y2-cs, _w - cs*2, cs); // Bottom
      context.drawImage(sprites.msg, 0, cs, cs, cs, x1, y1+cs, cs, _h - cs*2); // Left
      context.drawImage(sprites.msg, cs*2, cs, cs, cs, x2-cs, y1+cs, cs, _h - cs*2); // Right
      
      context.drawImage(sprites.msg, cs, cs, cs, cs, x1+cs, y1+cs, _w - cs*2, _h - cs*2); // Center

      //Arrow
      if (sprites.arrowData.loaded) {
        _w -= cs*2;

        context.drawImage(sprites.arrow, (x1+_w/2) + 8, y2);
      }
    }
    
    //Draw message
    let char_prev = 0;

    for(let l=0; l<msgs.length; l++) {
      //msgs[l] = msgs[l].trim();
      let _msg = msgs[l];

      //Char
      let end_here = false;
      let char_this = players[plr].char - char_prev;

      if (char_this < _msg.length) {
        end_here = true;

        _msg = _msg.substr(0, char_this);
      }
      //Offset X
      let xoff = 0;
      if (players[plr].facing < 0) {
        xoff = -6;
      }

      //Width
      let w = textWidth(msgs[l]);
      
      context.fillStyle = "#FEFEFE";
      context.font = fontSize + "px Helvetica";
      players[plr].drawnMessage = context.fillText(_msg, (players[plr].x - w/2) + xoff, players[plr].y - height);
      
      height -= lh;

      //End
      if (end_here) break;
      else {
        char_prev += _msg.length;
      }
    }
    
    //Draw name
    let name = players[plr].author;
    let w = textWidth(name);
    
    context.fillStyle = "#CACACA";
    context.font = fontSize + "px Helvetica";
    players[plr].drawnMessage = context.fillText(name, players[plr].x - w/2, players[plr].y + 64);

    //Char
    if (players[plr].char < msg.length) players[plr].char += textSpeed;
  }
  
  //Get text width
  function textWidth(str) {
    let test = document.getElementById("Test");
    test.style.fontSize = fontSize;
    test.innerHTML = str;
    
    return test.clientWidth - 12;
  }
  
  //Nearest distance
  function nearestDist(x, y) {
    let dist = 10000;
    
    for(let i=0; i<players.length; i++) {
      let _x = players[i].x;
      let _y = players[i].y;
      
      let _dist = distance(x, y, _x, _y);
      
      if (_dist < dist) {
        dist = _dist;
      }
    }
    
    return dist;
  }
  
  //Text objects
  function createText(x, y, text, life) {
    textObjs.push({
        "x" : x,
        "y" : y,
        "text" : text,
        "life" : life
    });
  }
}

//Game log
function log(str) {
  console.log("**GAME**: " + str);
}

//Find player
function indexOfPlayer(arr, author) {
  for(let i=0; i<arr.length; i++) {
    let obj = arr[i];
    
    if (obj.author == author) {
      return i;
    }
  }
  
  return -1;
}

//Distance
function distance(x1, y1, x2, y2) {
  let a = x1 - x2;
  let b = y1 - y2;

  let c = Math.sqrt( a*a + b*b );
  
  return c;
}

//Zero padding
function zeroes(number, digits) {
  number = number.toString();

  while (number.length < digits) {
    number = "0" + number;
  }

  return number;
}