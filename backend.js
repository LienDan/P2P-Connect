const net = require('node:net');
const dgram = require('node:dgram');

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
  console.log(`socket got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`socket listening ${address.address}:${address.port}`);
});


socket.bind(yourPort);


function natPunch(){
  //I decided to wrap messages in a json object format so I could include meta data, such as the message type, to check if its a connection, a message, etc
  const packet = {type : "connect"};
  let packetString = JSON.stringify(packet);

  setInterval(() => { 
    socket.send(packetString, 0, packetString.length, peerPort, yourIP);
  }
  , 500);
 
};

natPunch();