import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ListManager } from './ListManager';
import { TaskSchema } from './TaskSchema';
import path from 'path';

const app = express();
const port = 3500;
const listManager = new ListManager(path.join(__dirname, '..', 'documents'));

app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // make it globally available

// Get all tasks
app.get('/tasks', (req, res) => {
    const tasks = listManager.getAllTasks();
    res.json(tasks);
});

// Add a new task
app.post('/tasks', (req, res) => {
    const task: TaskSchema = req.body;
    listManager.addTask(task);
    res.status(201).send('Task added successfully.');
});

app.post('/tasks/create/:taskName', (req, res) => {
    const { taskName } = req.params;
    const { approver1, approver2, approver3, comments, taskDescription } = req.body;
    const task: TaskSchema = { taskName, approver1, approver2, approver3, comments, taskDescription, recommendation: "", decisionMaker: "" };
    const [code, message] = listManager.addTask(task);

    res.status(code).send(message);

});

// Add a comment to a task
app.post('/tasks/:taskName/comments', (req, res) => {
    const { taskName } = req.params;
    const { comment, user } = req.body;
    const [code, result] = listManager.addComment(taskName, comment, user);
    res.status(code).send(result);
});

// Clear all the comments for a task
app.delete('/tasks/:taskName/comments', (req, res) => {
    const { taskName } = req.params;
    const { user } = req.body;
    const [code, result] = listManager.clearComments(taskName, user);
    res.status(code).send(result);
});

// Add a recommendation to a task
app.post('/tasks/:taskName/recommendation', (req, res) => {
    const { taskName } = req.params;
    const { recommendation, user } = req.body;
    const [code, result] = listManager.addRecommendation(taskName, recommendation, user);
    res.status(code).send(result);
});

// Get a task by name
app.get('/tasks/:taskName', (req, res) => {
    const { taskName } = req.params;
    const { user } = req.body;
    const [code, task] = listManager.getTask(taskName, user);
    if (code === 200) {
        res.json(task);
        return;
    }

    res.status(code).send(task);

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
