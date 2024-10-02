import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import { TaskSchema } from './ItemCheckerDemo/src/TaskSchema';

const ItemEditor: React.FC = () => {
    const [task, setTask] = useState<TaskSchema | null>(null);
    const [user, setUser] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
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
                    sessionStorage.setItem('5500taskdata', data);
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
    }, []);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const user = e.target.value;
        sessionStorage.setItem('5500user', user);
        setUser(user);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value);
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
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to add comment');
                    }
                })
                .then(updatedTask => {
                    setTask(updatedTask);
                    sessionStorage.setItem('5500taskdata', updatedTask);
                    setSuccess('Comment added successfully');
                    setComment('');
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

    const cachedTask = sessionStorage.getItem('5500taskdata') || task;
    console.log('cachedTask', cachedTask);
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
                                <TableCell>Comments</TableCell>
                                <TableCell>
                                    <ul>
                                        {task.comments && Array.isArray(task.comments) ? (
                                            task.comments.map((comment, index) => (
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