var Peer = require('simple-peer')
let p;
let initiator;
let connectId;
   
document.querySelector('#call').addEventListener('submit', function (ev) {
  ev.preventDefault()
  initiator = true
  connectId = $("#call-id").val().trim()
  p2pConnect()
})
document.querySelector('#answer').addEventListener('submit', function (ev) {
  ev.preventDefault()
  initiator = false
  connectId = $("#answer-id").val().trim()
  p2pConnect()
})

function p2pConnect(initiator){
  navigator.getUserMedia({video:true, audio:true}, gotMedia, function(){})
}

function gotMedia(stream){
  p = new Peer({ initiator: initiator, trickle:false, stream:stream })

  p.on('error', function (err) { console.log('error', err) })
   
  p.on('signal', function (data) {
    console.log('SIGNAL', JSON.stringify(data))
    $.post('/api/callPeer', {connectId:connectId, initiator:initiator, ipObj:JSON.stringify(data)}, function(res){
      socket = io('/' + connectId, {forceNew:true})
      socket.emit('callingPeer')
      socket.on('callingPeer', function(ipObjects){
        if(initiator){
          p.signal(JSON.parse(ipObjects.initiator))
        } else {
          p.signal(JSON.parse(ipObjects.answerer))
        }
      });
    })
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
 
// $(function () {
//   var socket;

//   document.querySelector('#form1').addEventListener('submit', function (ev) {
//     ev.preventDefault()
//     p.signal(JSON.parse(document.querySelector('#incoming').value))
//     let newName = $(this).text()
//     currentContact = newName
//     $("#sending-message-to").text("Sending Message To: " + newName)
//     $.post('/api/newContact', {newNameSpace:newName}, function(res){
//       socket = io('/' + newName, {forceNew:true})
//       socket.on('chat message', function(msg){
//         $('#' + currentContact.toLocaleLowerCase() + '-messages').append($('<li>').text(msg));
//       });
//     })
//   })

// });
