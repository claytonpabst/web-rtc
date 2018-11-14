var Peer = require('simple-peer')
let initiator = false;
let peer;
let socket;

function newMessage(e){
  e.preventDefault()
  socket.emit('chat message', $('#new-message').val());
  $('#new-message').val('');
}

document.querySelector('#join-socket-form').addEventListener('submit', function (ev) {
  ev.preventDefault()
  let socketId = $("#socket-id-input").val().trim()
  if(socket){
    socket.disconnect()
    document.querySelector('#socket-message-form').removeEventListener('submit', newMessage)
  }
  socket = io('/' + socketId, {forceNew:true}) 
  $.post("/api/joinSocket", {socketId:socketId}, function(res){
    console.log(res)
    socket.on('chat message', function(msg){
      $('#socket-messages').append($('<li>').text(msg));
    });
    socket.on('call peer', function(data){
      if(!initiator){
        $('#socket-messages').append($('<li>').text("Someone is calling you!"));
        gettingCall(data)
      }
    })
    socket.on('answer peer', function(data){
      if(initiator){
        $('#socket-messages').append($('<li>').text("The other party answered your call!"));
        gettingAnswer(data)
      }
    })
    document.querySelector('#socket-message-form').addEventListener('submit', newMessage)
  })
})

function gettingAnswer(data){
  peer.signal(data.ipObj)
}

function gettingCall(data){
  navigator.getUserMedia({video:true, audio:true}, (stream) => gotMediaAfterBeingCalled(stream, data), function(){})
}

function gotMediaAfterBeingCalled(stream, data){
  peer = new Peer({ initiator: initiator, trickle:false, stream:stream })

  peer.on('error', function (err) { console.log('error', err) })

  peer.on('signal', function(data){
    if(data.renegotiate){return}
    $("#answer").on('click', function(){
      alert('answer')
      socket.emit('answer peer', {initiator:initiator, ipObj:JSON.stringify(data)})
    })
    document.querySelector('#outgoing').textContent = JSON.stringify(data)
  })

  peer.signal(JSON.parse(data.ipObj))

  peer.on('connect', function () {
    console.log('CONNECT')
    peer.send('whatever' + Math.random())
  })
   
  peer.on('data', function (data) {
    console.log('data: ' + data) 
  })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
}

$("#call").on('click', function(){
  initiator = true
  navigator.getUserMedia({video:true, audio:true}, gotMediaForCall, function(){})
})


function gotMediaForCall(stream){
  peer = new Peer({ initiator: initiator, trickle:false, stream:stream })

  peer.on('error', function (err) { console.log('error', err) })
   
  peer.on('signal', function (data) {
    alert('hit')
    socket.emit('call peer', {initiator:initiator, ipObj:JSON.stringify(data)})
    document.querySelector('#outgoing').textContent = JSON.stringify(data)
  })
   
  peer.on('connect', function () {
    console.log('CONNECT')
    peer.send('whatever' + Math.random())
  })
   
  peer.on('data', function (data) {
    console.log('data: ' + data) 
  })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
}
