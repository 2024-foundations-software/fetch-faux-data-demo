import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';

/**
 * Interface defining the props for the EventTable component.
 * 
 * @property {string[]} headers - An array of strings representing the table headers.
 * @property {(string | number)[][]} data - A 2D array representing the table data, where each inner array is a row.
 */
interface EventTableProps {
    headers: string[];
    data: (string | number)[][];
}

/**
 * The EventTable component renders a table with event data.
 * It displays headers and data passed as props.
 * 
 * @param {EventTableProps} props - The props for the EventTable component.
 * @returns {JSX.Element} The JSX code to render the EventTable component.
 */
const EventTable: React.FC<EventTableProps> = ({ headers, data }) => {
    return (
        <Box p={2}>
            {/* Typography component to display the title */}
            <Typography variant="h4" gutterBottom>
                Event
            </Typography>
            {/* TableContainer component to contain the table with a max height and auto overflow */}
            <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto' }}>
                {/* Table component with sticky headers */}
                <Table stickyHeader>
                    {/* TableHead component to render the table headers */}
                    <TableHead>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableCell key={index}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    {/* TableBody component to render the table data */}
                    <TableBody>
                        {data.map((row, rowIndex) => (
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
};

// Export the EventTable component as the default export of this module
export default EventTable;