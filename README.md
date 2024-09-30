# Example React Application 
## A demonstration of how to get data from the API and display it in a table format.

This project is a simple React application that demonstrates how to fetch data from an API and display it in a table format. The application fetches data from a the faux-data server https://bc-cancer-faux.onrender.com/

 The application consists of a `ControlPanel` component that manages the state and logic for displaying different tabs and their respective content. The tabs include `Donors`, `Event Set Up`, and `Event Review`. Each tab displays data in a table format.



### Key Files and Directories

- **.vscode/**: Contains Visual Studio Code specific settings.
  - `launch.json`: Configuration for debugging the project.

- **eslint.config.js**: ESLint configuration file. It includes settings for TypeScript, React, and various plugins.

- **index.html**: The main HTML file that includes the root div where the React app will be mounted.

- **package.json**: Contains project metadata and dependencies.

- **public/**: Directory for static assets.

- **src/**: Contains the source code of the application.
  - `App.css`: CSS file for styling the `App` component.
  - `App.tsx`: The root component of the application. It renders the `ControlPanel` component.
  - `Cities.tsx`: Component for managing and displaying city-related data.
  - `ControlPanel.tsx`: Main component that manages the state and logic for displaying different tabs and their respective content.
  - `DonorTable.tsx`: Component for displaying donor-related data in a table format.
  - `EventTable.tsx`: Component for displaying event-related data in a table format.
  - `index.css`: Global CSS file.
  - `main.tsx`: Entry point of the application. It renders the `App` component into the root div.
  - `vite-env.d.ts`: TypeScript declaration file for Vite.

- **tsconfig.app.json**: TypeScript configuration specific to the application.

- **tsconfig.json**: Base TypeScript configuration file.

- **tsconfig.node.json**: TypeScript configuration specific to Node.js.

- **vite.config.ts**: Vite configuration file.

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- npm (version 9 or higher)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/2024-foundations-software/fetch-faux-data-demo.git
   cd <fetch-faux-data-demo>
   npm install
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173/` to view the application.


## Components Overview

### `App.tsx`

The `App` component serves as the root component of the application. It is responsible for rendering the main `ControlPanel` component.

### `ControlPanel.tsx`

The `ControlPanel` component is the main component that manages the state and logic for displaying different tabs and their respective content. It includes functionalities for selecting cities, fetching event data, and managing tabs.

### `Cities.tsx`

The `Cities` component is responsible for managing and displaying city-related data.  It also provides a selection for each city.  This is used in setting up the cities for the request to set up an event.

### `DonorTable.tsx`

The `DonorTable` component displays donor-related data in a table format.  This gets all of the donors up to a limit defined in an input field.

### `EventTable.tsx`

The `EventTable` component displays event-related data in a table format.  This displays all of the donors who might potentially attend an event in a city, or a number of cities.

### Disclaimer

This code is provided as is.  It is intended for educational purposes only and should not be used in production environments without proper testing and validation.

