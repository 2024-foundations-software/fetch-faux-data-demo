import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, List, ListItem, ListItemText, Paper, Box } from '@mui/material';
import { TaskSchema } from 'types';

const ItemCreator: React.FC = () => {
    const [task, setTask] = useState<TaskSchema>({
        taskName: '',
        approver1: '',
        approver2: '',
        approver3: '',
        comments: [],
        taskDescription: '',
        recommendation: '',
        decisionMaker: '',
    });


    const getCurrentTaskName = () => {
        return sessionStorage.getItem('5500task') || '';
    };

    const [currentTaskName, setCurrentTaskName] = useState<string>(getCurrentTaskName());
    const [tasks, setTasks] = useState<TaskSchema[]>([]);

    useEffect(() => {
        // Fetch updated tasks list
        fetch('http://localhost:3500/tasks')
            .then(response => response.json())
            .then(data => updateTasks(data));

    }, []);



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTask((prevTask: any) => ({ ...prevTask, [name]: value }));
    };



    const updateTasks = (tasks: TaskSchema[]) => {
        console.log(tasks);

        setTasks(tasks);
    }

    const checkTaskIsFilledOut = (task: TaskSchema) => {
        return task.approver1 && task.approver2 && task.approver3 && task.taskDescription && task.taskName;
    }



    const handleNewTask = () => {

        if (!checkTaskIsFilledOut(task)) {
            alert('Please fill in all the fields');
            return;
        }

        fetch(`http://localhost:3500/tasks/create/${task.taskName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })
            .then(response => {
                if (response.ok) {
                    console.log('Task created successfully');

                } else {
                    throw new Error('Failed to create task');
                }
            })
            .then(() => {
                // Fetch updated tasks list
                fetch('http://localhost:3500/tasks')
                    .then(response => response.json())

                    .then(data => updateTasks(data));
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message);
            });
    };
    const handleSaveTaskName = (taskName: string) => {
        sessionStorage.setItem('5500task', taskName);
        setCurrentTaskName(taskName);
        console.log(`Task name ${taskName} saved to localStorage with key 5500task`);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Item Creator
            </Typography>
            <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
                <Typography variant="h6" gutterBottom>
                    New Item Editor
                </Typography>
                <TextField
                    label="Task Name"
                    name="taskName"
                    value={task.taskName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Approver 1"
                    name="approver1"
                    value={task.approver1}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Approver 2"
                    name="approver2"
                    value={task.approver2}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Approver 3"
                    name="approver3"
                    value={task.approver3}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Task Description"
                    name="taskDescription"
                    value={task.taskDescription}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleNewTask}>
                    New
                </Button>
            </Paper>

            <Paper elevation={3} style={{ padding: '16px' }}>
                <Typography variant="h6" gutterBottom>
                    List of Tasks
                </Typography>
                <List>
                    {tasks.map((task, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={task.taskName}
                                secondary={task.taskDescription}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSaveTaskName(task.taskName)}
                            >
                                {currentTaskName === task.taskName ? 'Current' : 'Edit'}
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default ItemCreator;