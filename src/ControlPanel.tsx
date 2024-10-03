import React, { useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, TextField } from '@mui/material';
import DonorTable from './DonorTable';
import Cities from './Cities';
import EventTable from './EventTable';
import ItemCreator from './ItemCreator';
import ItemEditor from './ItemEditor';
import UserLogin from './UserLogin';

/**
 * The ControlPanel component is the main component that manages the state and logic
 * for displaying different tabs and their respective content.
 * 
 * @returns {JSX.Element} The JSX code to render the ControlPanel component.
 */
const ControlPanel: React.FC = () => {
    // State to store the selected cities
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    // State to store the headers of the fetched event data
    const [headers, setHeaders] = useState<string[]>([]);
    // State to store the fetched event data
    const [data, setData] = useState<(string | number)[][]>([]);
    // State to store the limit for the number of events to fetch
    const [limit, setLimit] = useState<number>(1);
    // State to store the index of the currently selected tab
    const [tabIndex, setTabIndex] = useState<number>(0);

    /**
     * Handles the selection and deselection of cities.
     * 
     * @param {string} name - The name of the city to select or deselect.
     */
    const handleSelectCity = (name: string) => {
        setSelectedCities((prevSelected) =>
            prevSelected.includes(name)
                ? prevSelected.filter((cityName) => cityName !== name)
                : [...prevSelected, name]
        );
    };

    /**
     * Fetches event data based on the selected cities and limit.
     */
    const handleGetEvents = () => {
        // Construct query parameters from the selected cities and limit
        const queryParams = selectedCities.map(city => `cities=${encodeURIComponent(city)}`).join('&');
        const url = `https://bc-cancer-faux.onrender.com/event?${queryParams}&limit=${limit}&format=json`;

        // Fetch event data from the API
        fetch(url)
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                // Update the state with the fetched headers and data
                setHeaders(data.headers);
                setData(data.data);
                console.log('Fetched events:', data);
            })
            .catch(error => console.error('Error fetching events:', error)); // Log any errors
    };

    /**
     * Handles the change in the limit input field.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input field.
     */
    const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newLimit = Number(event.target.value);
        if (newLimit < 1) {
            newLimit = 1;
        }
        setLimit(Number(newLimit));
    };

    /**
     * Handles the change of the selected tab.
     * 
     * @param {React.ChangeEvent<{}>} _event - The change event from the tab component.
     * @param {number} newValue - The index of the newly selected tab.
     */
    const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box p={2} position="absolute" top={0} left={0} mt={8} width="100%">
            {/* Tabs component to switch between different views */}
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Event Panel Tabs">
                <Tab label="Donors" />
                <Tab label="Event Set Up" />
                <Tab label="Event Review" />
                <Tab label="Item Creator" />
                <Tab label="Item Editor" />
                <Tab label="User Login" />
            </Tabs>

            {/* Render the content based on the selected tab */}
            {tabIndex === 0 && (
                <Box mt={4}>
                    <DonorTable />
                </Box>
            )}

            {tabIndex === 1 && (
                <Box mt={4}>
                    <Box display="flex" alignItems="center">
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                Cities
                            </Typography>
                            <Box width="400px">
                                <Cities selectedCities={selectedCities} onSelectCity={handleSelectCity} />
                            </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" alignItems="flex-start" ml={2}>

                            <Box display="flex" alignItems="center" mb={2} mt={2}>
                                <Typography variant="h4" gutterBottom>
                                    Maximum guests
                                </Typography>
                                <TextField
                                    label="Limit"
                                    type="number"
                                    value={limit}
                                    onChange={handleLimitChange}
                                    variant="outlined"
                                    size="small"
                                    style={{ marginLeft: '16px' }}
                                />
                            </Box>
                            <Button variant="contained" color="primary" onClick={handleGetEvents}>
                                Get Event
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}

            {tabIndex === 2 && (
                <Box mt={4}>
                    <EventTable headers={headers} data={data} />
                </Box>
            )}

            {tabIndex === 3 && (
                <Box mt={4}>
                    <ItemCreator />
                </Box>
            )}

            {tabIndex === 4 && (
                <Box mt={4}>
                    <ItemEditor />
                </Box>
            )};

            {tabIndex === 5 && (
                <Box mt={4}>
                    <UserLogin />
                </Box>
            )}
        </Box>
    )
}

// Export the ControlPanel component as the default export of this module
export default ControlPanel;