import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, TextField } from '@mui/material';

// Define the types for the API response
interface ApiResponse {
    headers: string[];
    data: (string | number)[][];
}

/**
 * The DonorTable component fetches and displays donor data in a table.
 * It allows users to set a limit on the number of rows to fetch.
 * 
 * @returns {JSX.Element} The JSX code to render the DonorTable component.
 */
function DonorTable() {
    // State to store the headers of the fetched data
    const [headers, setHeaders] = useState<string[]>([]);
    // State to store the rows of the fetched data
    const [rows, setRows] = useState<(string | number)[][]>([]);
    // State to store the limit for the number of rows to fetch
    const [limit, setLimit] = useState<number>(1);

    /**
     * useEffect hook to fetch the data when the component mounts or the limit changes.
     * The dependency array includes the limit, so the effect runs whenever the limit changes.
     */
    useEffect(() => {
        // Fetch data from the API
        fetch(`https://bc-cancer-faux.onrender.com/event?cities=Vancouver&limit=${limit}&format=json`)
            .then((response) => response.json()) // Parse the JSON response
            .then((data: ApiResponse) => {
                // Update the state with the fetched headers and rows
                setHeaders(data.headers);
                setRows(data.data);
            })
            .catch((error) => {
                // Log any errors
                console.error('Error fetching data:', error);
            });
    }, [limit]); // Dependency array to run the effect when the limit changes

    /**
     * Handles the change in the limit input field.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input field.
     */
    const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Get the new limit value and ensure it is at least 1
        let tmpLimit = Number(event.target.value);
        if (tmpLimit < 1) {
            tmpLimit = 1;
        }
        // Update the limit state
        setLimit(tmpLimit);
    };

    return (
        <Box p={2}>
            {/* Header section with title and limit input field */}
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h4" gutterBottom>
                    Donor Table
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
            {/* Table container with a maximum height and auto overflow */}
            <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {/* Render table headers */}
                            {headers.map((header, index) => (
                                <TableCell key={index}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Render table rows */}
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

// Export the DonorTable component as the default export of this module
export default DonorTable;