const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
// const helmet = require('helmet');
// const config = require('./config.js');
const path = require('path');
const app = require('express')()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let spaces = {}

app.post("/api/joinSocket", function(req, res){
  let nsp = req.body.socketId
  if(!spaces[nsp]){

    console.log('new room created')
    spaces[nsp] = io.of('/' + nsp)

    spaces[nsp].on('connection', function(socket){
      console.log('someone connected');

      socket.on('disconnect', function(){
        console.log('user disconnected');
      })

      socket.on('chat message', function(msg){
        spaces[nsp].emit('chat message', "To: " + nsp + ", " + msg);
      })

      socket.on('call peer', function(data){
        spaces[nsp].emit('call peer', data)
      })

      socket.on('answer peer', function(data){
        spaces[nsp].emit('answer peer', data)
      })
    });

    res.send({status:200})

  } else {

    console.log('room already exists')
    res.send({status:200})

  }
})

// app.post('/api/callPeer', function(req, res){
//   let nsp = req.body.connectId
//   spaces[nsp] = io.of('/' + nsp)
//   if (!spaces[nsp].initiator){
//     spaces[nsp].initiator = req.body.ipObj
//   } else if (spaces[nsp].initiator !== req.body.ipObj){
//     spaces[nsp].answerer = req.body.ipObj
//   }
//   spaces[nsp].on('connection', function(socket){
//     if(spaces[nsp].initiator && spaces[nsp].answerer){
//       spaces[nsp].emit('callingPeer', {initiator:spaces[nsp].initiator, answerer:spaces[nsp].answerer});
//     }
//   });
//   res.send({status:200})
// })

app.use(express.static(path.join(__dirname, "/")));

http.listen(8080, '0.0.0.0', function() {
  console.log('Listening to port:  ' + 8080);
});