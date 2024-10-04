import { TaskSchema } from '../src/TaskSchema';
import ListManagerSQL from '../src/ListManagerSQL';
import * as fs from 'fs';
import * as path from 'path';
import { after } from 'node:test';


const testDatabase = 'test.db';
const testDirectory = path.join(__dirname, '..');
const testFilePath = path.join(testDirectory, testDatabase);
console.log(testDirectory);

beforeAll(() => {

    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }
});

afterAll(() => {
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }
});

describe('ListManager', () => {
    test('addTask should create a database in testFilePath', () => {
        const listManager = new ListManagerSQL(testDatabase);
        expect(fs.existsSync(testFilePath)).toBe(true);
        console.log('the database was created')
    });

    // test('addTask should return 409 if task already exists', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task11',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 11 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     };

    //     const [code, message] = listManager.addTask(mockTask);

    //     expect(code).toEqual(201);
    //     expect(message).toEqual('Task added successfully.');

    //     const [code2, message2] = listManager.addTask(mockTask);

    //     expect(code2).toEqual(409);
    //     expect(message2).toEqual('Task task11 already exists.');
    // });

    // test('addComment should add a comment to a task', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task2',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 2 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task2.json');
    //     listManager.addTask(mockTask);

    //     const comment = 'This is a comment';
    //     const user = 'user1';
    //     const [code, result] = listManager.addComment('task2', comment, user);

    //     expect(code).toEqual(200);
    //     expect(result).toEqual(`Comment added to task task2.`);
    //     const data = fs.readFileSync(mockFilePath, 'utf-8');
    //     const task = JSON.parse(data) as TaskSchema;

    //     const expectedComment = `${comment}:--:${user}`;

    //     expect(task.comments).toEqual([expectedComment]);
    // });

    // test('addComment should return 404 if task does not exist', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const comment = 'This is a comment';
    //     const user = 'user1';
    //     const [code, result] = listManager.addComment('task3', comment, user);

    //     expect(code).toEqual(404);
    //     expect(result).toEqual(`Task task3 not found.`);
    // });

    // test('addComment should return 401 if user is not an approver', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task4',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 4 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task4.json');
    //     listManager.addTask(mockTask);

    //     const comment = 'This is a comment';
    //     const user = 'user4';
    //     const [code, result] = listManager.addComment('task4', comment, user);

    //     expect(code).toEqual(401);
    //     expect(result).toEqual(`User user4 is not an approver for task task4.`);
    // });

    // test('getTask should return the task if user is an approver', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task2222',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 2222 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task2.json');

    //     listManager.addTask(mockTask);

    //     const [code, result] = listManager.getTask('task2222', 'user1');

    //     expect(code).toBe(200);
    //     expect(result).toEqual(mockTask);
    // });



    // test('getTask should return 404 if task does not exist', () => {
    //     const listManager = new ListManager(testDirectory);



    //     const [code, result] = listManager.getTask('task30000', 'user1');

    //     expect(code).toBe(404);
    //     expect(result).toBe('Task task30000 not found.');
    // });

    // test('addRecommendation should add a recommendation to a task', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task5',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 5 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task5.json');
    //     listManager.addTask(mockTask);

    //     const recommendation = 'This is a recommendation';
    //     const user = 'user1';
    //     const [code, result] = listManager.addRecommendation('task5', recommendation, user);

    //     expect(code).toEqual(200);
    //     expect(result).toEqual(`Recommendation added to task task5.`);
    //     const data = fs.readFileSync(mockFilePath, 'utf-8');
    //     const task = JSON.parse(data) as TaskSchema;

    //     expect(task.recommendation).toEqual(recommendation);
    //     expect(task.decisionMaker).toEqual(user);
    // });

    // test('addRecommendation should return 404 if task does not exist', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const recommendation = 'This is a recommendation';
    //     const user = 'user1';
    //     const [code, result] = listManager.addRecommendation('task6', recommendation, user);

    //     expect(code).toEqual(404);
    //     expect(result).toEqual(`Task task6 not found.`);
    // });

    // test('addRecommendation should return 401 if user is not an approver', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task7',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: [],
    //         taskDescription: 'Task 7 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task7.json');
    //     listManager.addTask(mockTask);

    //     const recommendation = 'This is a recommendation';
    //     const user = 'user4';
    //     const [code, result] = listManager.addRecommendation('task7', recommendation, user);

    //     expect(code).toEqual(401);
    //     expect(result).toEqual(`User user4 is not an approver for task task7.`);
    // });

    // test('clearComments should clear comments for a task', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task8',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: ['comment1', 'comment2'],
    //         taskDescription: 'Task 8 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     };
    //     const mockFilePath = path.join(testDirectory, 'task8.json');
    //     listManager.addTask(mockTask);

    //     const user = 'user1';
    //     const [code, result] = listManager.clearComments('task8', user);

    //     expect(code).toEqual(200);
    //     expect(result).toEqual(`Comments cleared for task task8.`);

    //     const [code2, newTask] = listManager.getTask('task8', user);

    //     if (code2 === 200) {
    //         const castTask = newTask as TaskSchema;
    //         expect(castTask.comments).toEqual([]);
    //     }
    // });

    // test('clearComments should return 404 if task does not exist', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const user = 'user1';
    //     const [code, result] = listManager.clearComments('task9', user);

    //     expect(code).toEqual(404);
    //     expect(result).toEqual(`Task task9 not found.`);
    // });

    // test('clearComments should return 401 if user is not an approver', () => {
    //     const listManager = new ListManager(testDirectory);
    //     const mockTask: TaskSchema = {
    //         taskName: 'task10',
    //         approver1: 'user1',
    //         approver2: 'user2',
    //         approver3: 'user3',
    //         comments: ['comment1', 'comment2'],
    //         taskDescription: 'Task 10 description',
    //         recommendation: '',
    //         decisionMaker: ''
    //     }; const mockFilePath = path.join(testDirectory, 'task10.json');
    //     listManager.addTask(mockTask);

    //     const user = 'user4';
    //     const [code, result] = listManager.clearComments('task10', user);

    //     expect(code).toEqual(401);
    //     expect(result).toEqual(`User user4 is not an approver for task task10.`);

    // });


});