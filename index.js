var Peer = require('simple-peer')
let p;
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
    document.querySelector('#socket-message-form').addEventListener('submit', newMessage)
  })
})

navigator.getUserMedia({video:true, audio:true}, gotMedia, function(){})

function gotMedia(stream){
  p = new Peer({ initiator: location.hash === '#1', trickle:false, stream:stream })

  p.on('error', function (err) { console.log('error', err) })
   
  p.on('signal', function (data) {
    console.log('SIGNAL', JSON.stringify(data))
    document.querySelector('#outgoing').textContent = JSON.stringify(data)
  })
   
  document.querySelector('#form1').addEventListener('submit', function (ev) {
    ev.preventDefault()
    p.signal(JSON.parse(document.querySelector('#incoming').value))
  })
  document.querySelector('#form2').addEventListener('submit', function (ev) {
    ev.preventDefault()
    p.send(document.querySelector('#new-message').value)
  })
   
  p.on('connect', function () {
    console.log('CONNECT')
    p.send('whatever' + Math.random())
  })
   
  p.on('data', function (data) {
    console.log('data: ' + data) 
  })

  p.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
}






// var Peer = require('simple-peer')
// let p;
// let initiator;
// let connectId;
   
// document.querySelector('#call').addEventListener('submit', function (ev) {
//   ev.preventDefault()
//   initiator = true
//   connectId = $("#call-id").val().trim()
//   p2pConnect()
// })
// document.querySelector('#answer').addEventListener('submit', function (ev) {
//   ev.preventDefault()
//   initiator = false
//   connectId = $("#answer-id").val().trim()
//   p2pConnect()
// })

// function p2pConnect(initiator){
//   navigator.getUserMedia({video:true, audio:true}, gotMedia, function(){})
// }

// function gotMedia(stream){
//   p = new Peer({ initiator: initiator, trickle:false, stream:stream })

//   p.on('error', function (err) { console.log('error', err) })
  
//   p.on('signal', function (data) {
//     // console.log('SIGNAL', JSON.stringify(data))
//     $.post('/api/callPeer', {connectId:connectId, initiator:initiator, ipObj:JSON.stringify(data)}, function(res){
//       connect()
//     })
//   })

//   let funcShouldRun = true
//   function connect(){
//     if(!funcShouldRun){return}
//     funcShouldRun = false 
//     socket = io('/' + connectId, {forceNew:true})
//     console.log(socket)
//     socket.on('callingPeer', function(ipObjects){
//       console.log(ipObjects)
//       if(initiator){
//         p.signal(JSON.parse(ipObjects.answerer))
//       } else {
//         p.signal(JSON.parse(ipObjects.initiator))
//       }
//     });
//   }
   
//   p.on('connect', function () {
//     console.log('CONNECT')
//     p.send('whatever' + Math.random())
//   })
   
//   p.on('data', function (data) {
//     console.log('data: ' + data) 
//   })

//   p.on('stream', function (stream) {
//     // got remote video stream, now let's show it in a video tag
//     var video = document.querySelector('video')
//     video.src = window.URL.createObjectURL(stream)
//     video.play()
//   })
// }
