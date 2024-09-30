// Import the ControlPanel component from the local file './ControlPanel'
import ControlPanel from './ControlPanel';

// Import the CSS file for styling the App component
import './App.css';

/**
 * The App component serves as the root component of the application.
 * It is responsible for rendering the main ControlPanel component.
 * 
 * @returns {JSX.Element} The JSX code to render the App component.
 */
function App() {
  return (
    <>
      {/* Fragment shorthand syntax to group multiple elements without adding extra nodes to the DOM */}
      <div>
        {/* Render the ControlPanel component */}
        <ControlPanel />
      </div>
    </>
  );
}

// Export the App component as the default export of this module
export default App;