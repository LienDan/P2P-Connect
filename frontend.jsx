import { createRoot } from 'react-dom/client';
console.log("This is a test setup from the react tutorial page.");

function tryConnect(submission) {
  submission.preventDefault();
  console.log(submission);

  // Read the form data
  const form = submission.target;
  const formData = new FormData(form);
  console.log("Your IP: " + formData.get("yourIP") + "\nPeer IP: " + formData.get("peerIP") + "\nYour Port: " + formData.get("yourPort") + "\nPeer Port: " + formData.get("peerPort"));

}

function ConnectionForm(){
    //reminder that react component needs to start with a capital, so the function name needs to start with captial
    return (
    <form id="setup" onSubmit={tryConnect}>
      <div className="inputs">
        <label htmlFor="yourIP">Your IP </label>
        <input type="text" id="yourIP" name="yourIP" required />
      </div>

      <div className="inputs">
        <label htmlFor="peerIP">Peer IP </label>
        <input type="text" id="peerIP" name="peerIP" required />
      </div>

      <div className="inputs">
        <label htmlFor="yourPort">Your Port </label>
        <input type="number" id="yourPort" name="yourPort" min="0" max="65535" required />
      </div>

      <div className="inputs">
        <label htmlFor="peerPort">Peer Port</label>
        <input type="number" id="peerPort" name="peerPort" min="0" max="65535" required
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
