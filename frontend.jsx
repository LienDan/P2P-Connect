import { createRoot } from 'react-dom/client';
console.log("This is a test setup from the react tutorial page.");

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<h1>Hello, world</h1>);

console.log("Test Print");