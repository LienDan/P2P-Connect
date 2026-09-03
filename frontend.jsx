import { createRoot } from 'react-dom/client';
import { useState } from "react";

function tryConnect(submission) {
  submission.preventDefault();
  console.log(submission);

  // Read the form data
  const form = submission.target;
  const formData = new FormData(form);
  //console.log("Your IP: " + formData.get("yourIP") + "\nPeer IP: " + formData.get("peerIP") + "\nYour Port: " + formData.get("yourPort") + "\nPeer Port: " + formData.get("peerPort"));

  window.electronAPI.tryConnect(formData.get("yourIP"), formData.get("peerIP"), formData.get("yourPort"), formData.get("peerPort"))
}

window.electronAPI.connectResult((value) => {
  if(value == true){
    root.render(<Messenger />)
  }
  else{
    root.render(
    <div>
      <label>CONNECTION IN PROGRESS...</label>
      <button type="submit" id="cancelButton" onClick={() => root.render(<ConnectionForm />)}>Cancel Connection</button>
    </div>
    )
  }
})



function Messenger(){
  //react doesnt automatically rerender when variables get updated, so we use useState
  const [messageHistory, updateMessageHistory] = useState("You are now connected.");

  window.electronAPI.recieveMessage((message) => {
    updateMessageHistory(messageHistory + "\nPeer: " + message);
  })

  function sendMessage(submission){
    submission.preventDefault();
    const form = submission.target;
    const formData = new FormData(form);

    updateMessageHistory(messageHistory + "\nYou: " + formData.get("message"));
    window.electronAPI.sendMessage(formData.get("message"));
    
    form.reset();
  }

  return (
    <div>
      <p>{messageHistory}</p>
      <form id="messageForm" onSubmit={sendMessage}>
        <input id="messageInput" name="message" type="message" required />
        <div>
          <button type="submit" id="sendMessageButton">Send</button>
        </div>
      </form>

    </div>
  );
}

function ConnectionForm(){
    //reminder that react component needs to start with a capital, so the function name needs to start with captial
    return (
    <form id="setup" onSubmit={tryConnect}>
      <div className="inputs">
        <label htmlFor="yourIP">Your IP </label>
        <input type="text" id="yourIP" name="yourIP" defaultValue="localhost" required />
      </div>

      <div className="inputs">
        <label htmlFor="peerIP">Peer IP </label>
        <input type="text" id="peerIP" name="peerIP" defaultValue="localhost" required />
      </div>

      <div className="inputs">
        <label htmlFor="yourPort">Your Port </label>
        <input type="number" id="yourPort" name="yourPort" defaultValue="50000" min="0" max="65535" required />
      </div>

      <div className="inputs">
        <label htmlFor="peerPort">Peer Port</label>
        <input type="number" id="peerPort" name="peerPort" defaultValue="50000" min="0" max="65535" required
        />
      </div>

      <div className="inputs">
        <button type="submit" id="connectButton">Connect</button>
      </div>
    </form>
  );
}


let root = createRoot(document.getElementById('reactApp'));
root.render(<ConnectionForm />);
