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
  setInterval(() => { 
    socket.send(Buffer.from("TEST"), 0, 4, peerPort, yourIP);
    console.log("backend send");
  }
    , 500);
 
};

natPunch();