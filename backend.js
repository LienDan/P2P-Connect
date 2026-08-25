const dgram = require('node:dgram');
const readline = require('node:readline');

let yourIP = process.argv[2];
let peerIP = process.argv[3];
let yourPort = parseInt(process.argv[4]);
let peerPort = parseInt(process.argv[5]);
let connected = false;

const socket = dgram.createSocket('udp4');

socket.on('error', (err) => {
  console.error(`socket error:\n${err.stack}`);
  socket.close();
});

socket.on('message', (msg, rinfo) => {
  let msgJson = JSON.parse(String(msg));

  //console.log(`socket got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  switch(msgJson.type){
    case "ping":
      //ping messages are sent only to keep NAT port alive, so we just return when we get it
      return;
    case "message":
      console.log(msgJson.value);
    case "connect":
      NATPunchStatus += 1;
      if(NATPunchStatus < 2){
        let packet = {"type" : "connect", "value" : NATPunchStatus};
        let packetString = JSON.stringify(packet);
        socket.send(packetString, 0, packetString.length, peerPort, yourIP);
        clearInterval(NATPunchInterval);
        connected = true;
        ping();
      }
  }

});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`socket listening ${address.address}:${address.port}`);
});


socket.bind(yourPort);
let NATPunchInterval = null;
let NATPunchStatus = 0; 

function natPunch(){
  NATPunchInterval = setInterval(() => { 
    let packet = {"type" : "connect", "value" : NATPunchStatus}; //wrap messages in a json object format to include meta data, such as the message type, to check if its a connection, a message, etc
    let packetString = JSON.stringify(packet);
    socket.send(packetString, 0, packetString.length, peerPort, yourIP);
  }
  , 500);
};

function sendMessage(message){
  let packet = {"type" : "message", "value" : message}
  let packetString = JSON.stringify(packet);
  socket.send(packetString, 0, packetString.length, peerPort, yourIP);
}

function ping(){
    setInterval(() => { 
    let packetString = JSON.stringify({"type" : "ping"});
    socket.send(packetString, 0, packetString.length, peerPort, yourIP);
  }
  , 10000); //send a ping every 10 seconds in case of inactivity so the NAT port doesnt close
}

natPunch();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line", sendMessage);