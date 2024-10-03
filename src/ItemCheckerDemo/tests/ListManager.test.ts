import { TaskSchema } from '../src/TaskSchema';
import { ListManager } from '../src/ListManager';
import * as fs from 'fs';
import * as path from 'path';
import { after } from 'node:test';

const documentTestPath = 'testdocuments';
const testDirectory = path.join(__dirname, '..', documentTestPath);

beforeAll(() => {
    if (fs.existsSync(testDirectory)) {
        const files = fs.readdirSync(testDirectory);
        files.forEach(file => {
            const filePath = path.join(testDirectory, file);
            if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(testDirectory);
    }
});

afterAll(() => {
    if (fs.existsSync(testDirectory)) {
        fs.readdirSync(testDirectory).forEach(file => {
            const filePath = path.join(testDirectory, file);
            if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(testDirectory);
    }
});

describe('ListManager', () => {
    test('addTask should write a task to a file', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task1',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 1 description',
            recommendation: '',
            decisionMaker: ''
        };
        const mockFilePath = path.join(testDirectory, 'task1.json');

        const [code, message] = listManager.addTask(mockTask);

        expect(code).toEqual(201);
        expect(message).toEqual('Task added successfully.');

        // check to see if the file was written
        // use fs and the file path to check to see if it is there
        expect(fs.existsSync(mockFilePath)).toBeTruthy();
        // now read the contents of the file and compare it to the mockTask
        const data = fs.readFileSync(mockFilePath, 'utf-8');
        const task = JSON.parse(data) as TaskSchema;

        expect(task.taskName).toEqual(mockTask.taskName);
        expect(task.approver1).toEqual(mockTask.approver1);
        expect(task.approver2).toEqual(mockTask.approver2);
        expect(task.approver3).toEqual(mockTask.approver3);
        expect(task.comments).toEqual(mockTask.comments);
        expect(task.taskDescription).toEqual(mockTask.taskDescription);
    });

    test('addTask should return 409 if task already exists', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task11',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 11 description',
            recommendation: '',
            decisionMaker: ''
        };

        const [code, message] = listManager.addTask(mockTask);

        expect(code).toEqual(201);
        expect(message).toEqual('Task added successfully.');

        const [code2, message2] = listManager.addTask(mockTask);

        expect(code2).toEqual(409);
        expect(message2).toEqual('Task task11 already exists.');
    });

    test('addComment should add a comment to a task', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task2',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 2 description',
            recommendation: '',
            decisionMaker: ''
        }; const mockFilePath = path.join(testDirectory, 'task2.json');
        listManager.addTask(mockTask);

        const comment = 'This is a comment';
        const user = 'user1';
        const [code, result] = listManager.addComment('task2', comment, user);

        expect(code).toEqual(200);
        expect(result).toEqual(`Comment added to task task2.`);
        const data = fs.readFileSync(mockFilePath, 'utf-8');
        const task = JSON.parse(data) as TaskSchema;

        const expectedComment = `${comment}:--:${user}`;

        expect(task.comments).toEqual([expectedComment]);
    });

    test('addComment should return 404 if task does not exist', () => {
        const listManager = new ListManager(testDirectory);
        const comment = 'This is a comment';
        const user = 'user1';
        const [code, result] = listManager.addComment('task3', comment, user);

        expect(code).toEqual(404);
        expect(result).toEqual(`Task task3 not found.`);
    });

    test('addComment should return 401 if user is not an approver', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task4',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 4 description',
            recommendation: '',
            decisionMaker: ''
        }; const mockFilePath = path.join(testDirectory, 'task4.json');
        listManager.addTask(mockTask);

        const comment = 'This is a comment';
        const user = 'user4';
        const [code, result] = listManager.addComment('task4', comment, user);

        expect(code).toEqual(401);
        expect(result).toEqual(`User user4 is not an approver for task task4.`);
    });

    test('getTask should return the task if user is an approver', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task2222',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 2222 description',
            recommendation: '',
            decisionMaker: ''
        }; const mockFilePath = path.join(testDirectory, 'task2.json');

        listManager.addTask(mockTask);

        const [code, result] = listManager.getTask('task2222', 'user1');

        expect(code).toBe(200);
        expect(result).toEqual(mockTask);
    });



    test('getTask should return 404 if task does not exist', () => {
        const listManager = new ListManager(testDirectory);



        const [code, result] = listManager.getTask('task30000', 'user1');

        expect(code).toBe(404);
        expect(result).toBe('Task task30000 not found.');
    });

    test('addRecommendation should add a recommendation to a task', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task5',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 5 description',
            recommendation: '',
            decisionMaker: ''
        }; const mockFilePath = path.join(testDirectory, 'task5.json');
        listManager.addTask(mockTask);

        const recommendation = 'This is a recommendation';
        const user = 'user1';
        const [code, result] = listManager.addRecommendation('task5', recommendation, user);

        expect(code).toEqual(200);
        expect(result).toEqual(`Recommendation added to task task5.`);
        const data = fs.readFileSync(mockFilePath, 'utf-8');
        const task = JSON.parse(data) as TaskSchema;

        expect(task.recommendation).toEqual(recommendation);
        expect(task.decisionMaker).toEqual(user);
    });

    test('addRecommendation should return 404 if task does not exist', () => {
        const listManager = new ListManager(testDirectory);
        const recommendation = 'This is a recommendation';
        const user = 'user1';
        const [code, result] = listManager.addRecommendation('task6', recommendation, user);

        expect(code).toEqual(404);
        expect(result).toEqual(`Task task6 not found.`);
    });

    test('addRecommendation should return 401 if user is not an approver', () => {
        const listManager = new ListManager(testDirectory);
        const mockTask: TaskSchema = {
            taskName: 'task7',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 7 description',
            recommendation: '',
            decisionMaker: ''
        }; const mockFilePath = path.join(testDirectory, 'task7.json');
        listManager.addTask(mockTask);

        const recommendation = 'This is a recommendation';
        const user = 'user4';
        const [code, result] = listManager.addRecommendation('task7', recommendation, user);

        expect(code).toEqual(401);
        expect(result).toEqual(`User user4 is not an approver for task task7.`);
    });


});