var remoteVideo = document.getElementById("remoteVideo");
var localVideo = document.getElementById("localVideo");

var hangupButton = document.getElementById("hangupButton");
hangupButton.onclick = hangup;

var startButton = document.getElementById("startButton");
startButton.disabled = true;
startButton.onclick = start;

var callButton = document.getElementById("callButton");
callButton.disabled = true;
callButton.onclick = startCreatingOffer;

var localPeerConnection;
var localStream;

var servers = {
  'iceServers': [
            {'url': 'stun:stun.l.google.com:19302'}
]};

var pc_constraints = {
  'optional': [
    {'DtlsSrtpKeyAgreement': true}
  ]};

adquireLocalMedia({audio: true, video:true});

/* Socket handlers */
var socket = io.connect();

socket.on('connect', function() {
        
    this.on("message", function(data) {
        handleServerMessages(data);
    }); 
    
    $("#status").html("Online");
    $("#status").css("color","green");
    
    startButton.disabled = false;
});

socket.on('disconnect', function() {
    //alert("Disconnected!");
});

/**** Functions ****/

function start() {
 
    localPeerConnection = new RTCPeerConnection(servers, pc_constraints);
    
    localPeerConnection.onicecandidate = gotLocalIceCandidate;
    
    localPeerConnection.addStream(localStream);
    localPeerConnection.onaddstream = gotRemoteStream;
    
    startButton.disabled = true;
    callButton.disabled = false;
}

function adquireLocalMedia(constraints) {
    /* Get local video stream, using adapter.js */
    getUserMedia(constraints, gotLocalStream, handleError);
}

function gotLocalStream(stream){
    localStream = stream;
    localVideo.src = URL.createObjectURL(stream);
    localVideo.play();
}

function gotLocalIceCandidate(event){
  if (event.candidate) {
    socket.send(
       {"type": "ice",
        "data": event.candidate
       }
    );
  } 
}

function gotRemoteStream(event){
  remoteVideo.src = URL.createObjectURL(event.stream);
  remoteVideo.play();
}

function doAnswer() {
    localPeerConnection.createAnswer(function(answer) {
        
        localPeerConnection.setLocalDescription(answer);
        
        socket.send(
           {"type": "answer",
            "data": answer
           }
        );
    }, handleError);
}

function startCreatingOffer() {
    
    localPeerConnection.createOffer(function(offer) {
        
        localPeerConnection.setLocalDescription(new RTCSessionDescription(offer));
                                               
        socket.send(
           {"type": "offer",
            "data": offer
           }
        );
      }, handleError);
}

function handleServerMessages(msg) {
    switch(msg.type) {
                    
        case "ice":
	       localPeerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
        break;
            
        case "offer":
	       localPeerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
           doAnswer();
        break;
            
        case "answer":
	       localPeerConnection.setRemoteDescription(new RTCSessionDescription(msg.data)); 
        break;
    }
}

function hangup() {
    socket.close();
    localPeerConnection.close();
    localPeerConnection = null;
}

function handleError(err){
    $("#status").html("Error: " + err);
}