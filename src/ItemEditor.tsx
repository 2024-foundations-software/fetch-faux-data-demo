import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import { TaskSchema } from './TaskSchema';

const ItemEditor: React.FC = () => {
    const [task, setTask] = useState<TaskSchema | null>(null);
    const [user, setUser] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const taskName = localStorage.getItem('5500task');
        const username = localStorage.getItem('5500user');
        if (username) {
            setUser(username);
        }
        if (taskName) {
            fetch(`http://localhost:3500/tasks/${taskName}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch task details');
                    }
                })
                .then(data => setTask(data))
                .catch(error => setError(error.message));
        } else {
            setError('No task name found in localStorage');
        }
    }, []);

    const updateTask = (task: TaskSchema) => {
        console.log(task);
        setTask(task);
    }

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value;
        // store in local storage
        localStorage.setItem('5500user', username);
        setUser(e.target.value);
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

                    console.log('Updated task:', updatedTask);
                    updateTask(updatedTask);
                    setSuccess('Comment added successfully');
                    setComment('');
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
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
            {task ? (
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
                                        {

                                            task.comments.map((comment, index) => (
                                                <li key={index}>{comment}</li>
                                            ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="h6" color="error">
                    {error || 'Loading...'}
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