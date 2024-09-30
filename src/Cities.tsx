import React, { useEffect, useState } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox } from '@mui/material';

// Define the type for the city object
interface City {
    id: number;
    name: string;
}

// Define the props for the Cities component
interface CitiesProps {
    selectedCities: string[];
    onSelectCity: (cityName: string) => void;
}

/**
 * The Cities component fetches and displays a list of cities in a table.
 * It allows users to select cities using checkboxes.
 * 
 * @param {CitiesProps} props - The props for the Cities component.
 * @returns {JSX.Element} The JSX code to render the Cities component.
 */
const Cities: React.FC<CitiesProps> = ({ selectedCities, onSelectCity }) => {
    // State to store the list of cities
    const [cities, setCities] = useState<City[]>([]);

    /**
     * useEffect hook to fetch the list of cities when the component mounts.
     * The empty dependency array ensures this effect runs only once.
     */
    useEffect(() => {
        // Fetch the list of cities from the API
        fetch('https://bc-cancer-faux.onrender.com/cities?format=json')
            .then((response) => response.json()) // Parse the JSON response
            .then((data) => {
                // Check if the response data is an array
                if (Array.isArray(data.data)) {
                    // Format the cities data
                    const formattedCities = data.data.map((cityArray: any[], index: number) => ({
                        id: index,
                        name: cityArray[0],
                    }));
                    // Update the state with the formatted cities
                    setCities(formattedCities);
                } else {
                    // Log an error if the response format is unexpected
                    console.error('Unexpected response format:', data);
                }
            })
            .catch((error) => console.error('Error fetching cities:', error)); // Log any errors
    }, []); // Empty dependency array to run the effect only once

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Select</TableCell>
                        <TableCell>City Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cities.map((city) => (
                        <TableRow key={city.id}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedCities.includes(city.name)} // Check if the city is selected
                                    onChange={() => onSelectCity(city.name)} // Handle checkbox change
                                />
                            </TableCell>
                            <TableCell>{city.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Cities;