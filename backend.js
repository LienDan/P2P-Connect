const dgram = require('node:dgram');
const readline = require('node:readline');
const crypto = require('node:crypto');

let yourIP;
let peerIP;
let yourPort;
let peerPort;
let connected = false;
let mainWindow;

let socket = dgram.createSocket('udp4');;

//use diffe hellements to exchange private keys that will be used later for AES encryption and decryption
const keyexchange = crypto.getDiffieHellman('modp14'); //get DF (instead of create DF) using predefined group as we want to share G and p between clients
keyexchange.generateKeys();
const publickey = keyexchange.getPublicKey();
let secretKey;

function getIntegrity(message){
  let hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('hex');
}

//data is a Object message from the peer
function createsecretKey(data){
  let peerPublickey = Buffer.from(data.publickey.data); //convert back into a buffer
  let secretValue = keyexchange.computeSecret(peerPublickey); //computes the secret value using the peer's public key (both peers have this same value)

  //however, since secretValue can't be used as our key as it is too long to be used in AES, so we need to create a secret key based on our secret value
  //pbkdf2Sync is a function that takes an input, and returns a key with the specificed length (ignore salt, which is a random value to change the output key)
  secretKey = crypto.pbkdf2Sync(secretValue, '', 10000, 32, 'sha256');
};

function encrypt(message){
  // Generate a random initialization vector (this makes it so the same message can have a different encrypted output)
  const iv = crypto.randomBytes(16);

  // Create cipher with AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

  // Encrypt the data
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  //returns both the encrypted message and the IV
  return {
    iv: iv.toString('hex'),
    encrypted: encrypted
  };
};

function decrypt(message, iv){
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));

  // decrypts the enrypted message
  let decrypted = decipher.update(message, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

function resetSocket(socket){
  //socket.close closes the socket globally, but setting socket = dgram... only applies to the local socket variable, so we return this socket later
  socket.close();
  socket = dgram.createSocket('udp4');

  socket.on('error', (err) => {
    console.error(`socket error:\n${err.stack}`);
    socket.close();
  });

  socket.on('message', (msg, rinfo) => {
    let msgJson = JSON.parse(String(msg));

    switch(msgJson.type){
      case "ping":
        //ping messages are sent only to keep NAT port alive, so we just return when we get it
        return;
      case "message":
        let message = decrypt(msgJson.value.encrypted, msgJson.value.iv);
        console.log(msgJson.value);
        if(msgJson.integrity == getIntegrity(msgJson.value.encrypted + msgJson.value.iv)){
          mainWindow.webContents.send('recieveMessage', message);
        }
        else{
          console.log("Integrity failed.");
          console.log("Given integrity value: " + msgJson.integrity + "\ncalculated integrity value: " + getIntegrity(msgJson.value.encrypted + msgJson.value.iv));
        }
        break;
      case "connect":
        createsecretKey(msgJson);

        NATPunchStatus += 1;
        if(NATPunchStatus < 2){
          let packet = {"type" : "connect", "value" : NATPunchStatus, "publickey" : publickey};
          let packetString = JSON.stringify(packet);
          socket.send(packetString, 0, packetString.length, peerPort, peerIP);
          clearInterval(NATPunchInterval);
          connected = true;
          console.log("CONNECTED!");
          mainWindow.webContents.send('connectResult', true);
          ping();
          break;
        }
    }

  });
  socket.on('listening', () => {
    const address = socket.address();
    console.log(`socket listening ${address.address}:${address.port}`);
  });

  return socket;
}

function tryConnect(arg1, arg2, arg3, arg4, mainWindowArg){
  socket = resetSocket(socket);
  yourIP = arg1;
  peerIP = arg2;
  yourPort = arg3;
  peerPort = arg4;
  NATPunchStatus = 0;
  socket.bind(yourPort);
  natPunch();
  
  mainWindow = mainWindowArg;
  mainWindow.webContents.send('connectResult', false);
};

function stopConnect(){
  clearInterval(NATPunchInterval);
  clearInterval(pingInterval);
};

let NATPunchInterval = null;
let pingInterval = null;
let NATPunchStatus = 0; 

function natPunch(){
  NATPunchInterval = setInterval(() => { 
    let packet = {"type" : "connect", "value" : NATPunchStatus, "publickey" : publickey}; //wrap messages in a json object format to include meta data, such as the message type, to check if its a connection, a message, etc
    let packetString = JSON.stringify(packet);
    socket.send(packetString, 0, packetString.length, peerPort, peerIP);
  }
  , 500);
};

function sendMessage(message){
  let encryptedMessage = encrypt(message);
  let packet = {"type" : "message", "value" : encryptedMessage, "integrity" : getIntegrity(encryptedMessage.encrypted + encryptedMessage.iv)};
  let packetString = JSON.stringify(packet);
  socket.send(packetString, 0, packetString.length, peerPort, peerIP);
};

function ping(){
    pingInterval = setInterval(() => { 
    let packetString = JSON.stringify({"type" : "ping"});
    socket.send(packetString, 0, packetString.length, peerPort, peerIP);
  }
  , 10000); //send a ping every 10 seconds in case of inactivity so the NAT port doesnt close
};

//export functions so it can be used in main.js
module.exports = {
    tryConnect,
    stopConnect,
    sendMessage
};