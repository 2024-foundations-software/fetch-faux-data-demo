import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Container,
    FormControl, MenuItem, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Snackbar, Alert, InputLabel, Select, SelectChangeEvent
} from '@mui/material';

import { TaskSchema } from './TaskSchema';

const ItemEditor: React.FC = () => {
    const [task, setTask] = useState<TaskSchema | null>(null);
    const [user, setUser] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const updateTask = () => {
        const taskName = sessionStorage.getItem('5500task');
        const user = sessionStorage.getItem('5500user');
        setUser(user || '');
        if (taskName) {
            fetch(`http://localhost:3500/tasks/${taskName}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch task details');
                    }
                })
                .then(data => {
                    setTask(data);

                    setLoading(false);
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
                });
        } else {
            setError('No task name found in sessionStorage');
            setLoading(false);
        }
    }

    useEffect(() => {
        updateTask();
    }, [task]);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const user = e.target.value;
        sessionStorage.setItem('5500user', user);
        setUser(user);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value);
    };

    const handleRecommendationChange = (e: SelectChangeEvent) => {
        if (task) {
            const recommendation = e.target.value as string;
            fetch(`http://localhost:3500/tasks/${task.taskName}/recommendation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recommendation, user })
            })
                .then(response => {
                    updateTask();
                })
                .catch(error => {
                    setError(error.message);
                });
        }
    };

    const handleAddComment = () => {
        if (task) {
            fetch(`http://localhost:3500/tasks/${task.taskName}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment, user })
            })
                .then(response => {
                    updateTask();
                })
                .catch(error => {
                    setError(error.message);
                });
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Task Details
            </Typography>
            {loading ? (
                <Typography variant="h6">Loading...</Typography>
            ) : task ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Field</TableCell>
                                <TableCell>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Task Name</TableCell>
                                <TableCell>{task.taskName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Approver 1</TableCell>
                                <TableCell>{task.approver1}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Approver 2</TableCell>
                                <TableCell>{task.approver2}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Approver 3</TableCell>
                                <TableCell>{task.approver3}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Task Description</TableCell>
                                <TableCell>{task.taskDescription}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Recommendation</TableCell>
                                <TableCell>
                                    <FormControl fullWidth>
                                        <InputLabel>Recommendation</InputLabel>
                                        <Select
                                            value={task.recommendation}
                                            onChange={handleRecommendationChange}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value="Do the task">Do the task</MenuItem>
                                            <MenuItem value="Delay the task">Delay the task</MenuItem>
                                            <MenuItem value="Forget the task">Forget the task</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Decision Maker</TableCell>
                                <TableCell>{task.decisionMaker}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Comments</TableCell>
                                <TableCell>
                                    <ul>
                                        {task.comments && Array.isArray(task.comments) ? (
                                            task.comments.map((comment: string, index: React.Key | null | undefined) => (
                                                <li key={index}>{comment}</li>
                                            ))
                                        ) : (
                                            <li>No comments available</li>
                                        )}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="h6" color="error">
                    {error || 'No task found'}
                </Typography>
            )}
            <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
                <Typography variant="h6" gutterBottom>
                    User Login
                </Typography>
                <TextField
                    label="User"
                    value={user}
                    onChange={handleUserChange}
                    fullWidth
                    margin="normal"
                />
                <Typography variant="h6" gutterBottom>
                    Add Comment
                </Typography>
                <TextField
                    label="Comment"
                    value={comment}
                    onChange={handleCommentChange}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleAddComment}>
                    Add Comment
                </Button>
            </Paper>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ItemEditor;