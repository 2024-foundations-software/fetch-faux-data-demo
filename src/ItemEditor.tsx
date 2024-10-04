import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Container,
    FormControl, MenuItem, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Snackbar, Alert, InputLabel, Select, SelectChangeEvent,
    Box, Divider
} from '@mui/material';

import { TaskSchema } from './ItemCheckerDemo/src/TaskSchema'

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

        if (!user) {
            setError('Please Login');
            setLoading(false);
            return;
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
                    if (!response.ok) {
                        response.text().then(text => setError(text));
                        return;
                    }
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
                    if (!response.ok) {
                        response.text().then(text => setError(text));
                        return;
                    }
                    updateTask();
                    setSuccess('Comment added successfully');
                })
                .catch(error => {
                    setError(error.message);
                });
        }
    };

    const handleClearComments = async () => {

        // ask the user to confirm
        if (!window.confirm('Are you sure you want to clear all comments?')) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:3500/tasks/${task.taskName}/comments`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user })
            });

            const result = await response.text();

            if (response.ok) {
                if (!response.ok) {
                    response.text().then(text => setError(text));
                    return;
                }
                setSuccess(result);
                updateTask();
            } else {
                setError(result);
            }
        } catch (error) {
            setError('An error occurred while clearing comments.');
        }
    };

    const formatComment = (comment: string) => {
        const [commentText, commenter] = comment.split(':--:');
        return (<div>
            <strong>{commenter}</strong>:{commentText}
        </div>);
    }

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    const ItemDisplay = () => {
        return (
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
                            <TableCell>{task ? task.taskName : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Approver 1</TableCell>
                            <TableCell>{task ? task.approver1 : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Approver 2</TableCell>
                            <TableCell>{task ? task.approver2 : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Approver 3</TableCell>
                            <TableCell>{task ? task.approver3 : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Task Description</TableCell>
                            <TableCell>{task ? task.taskDescription : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Recommendation</TableCell>
                            <TableCell>{task ? task.recommendation : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Decision Maker</TableCell>
                            <TableCell>{task ? task.decisionMaker : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Comments</TableCell>
                            <TableCell>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    {task && task.comments && Array.isArray(task.comments) ? (
                                        task.comments.map((comment: string, index: React.Key | null | undefined) => (
                                            <li key={index}>{formatComment(comment)}</li>
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
        )
    };

    const VariableItemDisplay = () => {
        if (loading) {
            return <Typography variant="h6">Loading...</Typography>;
        }
        if (task) {
            return <ItemDisplay />;
        }
        return <Typography variant="h6" color="error">{error || 'No task found'}</Typography>;
    };

    const TaskDisplay = () => {
        return (
            <Paper>
                <Typography variant="h6" gutterBottom>
                    Task Details
                </Typography>
                <VariableItemDisplay />
            </Paper>
        )
    };



    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100vh' }}>
            <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between" sx={{ gap: '10px' }}>
                <TaskDisplay />
                <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
                    <Typography variant="h6" gutterBottom>
                        Logged in as: {user}
                    </Typography>
                    <Divider sx={{ my: 4 }} />
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
                    <Divider sx={{ my: 4 }} />

                    <FormControl fullWidth>
                        <Typography variant="h6" gutterBottom>
                            Select Recommendation
                        </Typography>
                        <Select
                            value={task ? task.recommendation : 'no task'}
                            onChange={handleRecommendationChange}
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="Do the task">Do the task</MenuItem>
                            <MenuItem value="Delay the task">Delay the task</MenuItem>
                            <MenuItem value="Forget the task">Forget the task</MenuItem>
                        </Select>
                    </FormControl>
                    <Divider sx={{ my: 4 }} />
                    <Button variant="contained" color="secondary" onClick={handleClearComments} style={{ marginTop: '16px' }}>
                        Clear Comments
                    </Button>

                </Paper>
            </Box>
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
        </Box>
    );
};

export default ItemEditor;