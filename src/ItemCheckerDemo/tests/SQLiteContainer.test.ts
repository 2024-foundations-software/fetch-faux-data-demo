import { TaskSchema } from '../src/TaskSchema';
import SQLiteContainer from '../src/SQLiteContainer';

import * as fs from 'fs';
import * as path from 'path';

const testDirectory = path.join(__dirname, '..');

/**
 * We do this before to make sure that if a previous suite failed, the files are deleted
 */
beforeAll(() => {
    // Find all the files that look like test_db_*.db and delete them
    if (fs.existsSync(testDirectory)) {
        fs.readdirSync(testDirectory).forEach(file => {
            const filePath = path.join(testDirectory, file);
            // Check to see if the prefix is test_db_ and the suffix is .db   
            if (file.startsWith('test_db_') && file.endsWith('.db')) {
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`);
            }
        });
    }
});

/**
 * Clean up test database files after all tests have run
 */
afterAll(() => {
    // Find all the files that look like test_db_*.db and delete them
    if (fs.existsSync(testDirectory)) {
        fs.readdirSync(testDirectory).forEach(file => {
            const filePath = path.join(testDirectory, file);
            // Check to see if the prefix is test_db_ and the suffix is .db   
            if (file.startsWith('test_db_') && file.endsWith('.db')) {
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`);
            }
        });
    }
});

describe('SQLiteContainer', () => {
    /**
     * Test to ensure that initializing the SQLiteContainer creates a database file
     */
    test('initialize list manager should create a database file', () => {
        const listManager = new SQLiteContainer('test_db_1.db');
        const dbPath = path.join(testDirectory, 'test_db_1.db');

        expect(fs.existsSync(dbPath)).toBe(true);
    });

    /**
     * Test to ensure that adding a task works correctly
     */
    test('add task should add a task to the database', () => {
        const listManager = new SQLiteContainer('test_db_2.db');
        const task: TaskSchema = {
            taskName: 'task1',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 1 description',
            recommendation: '',
            decisionMaker: ''
        };

        const [code, message] = listManager.addTask(task);

        expect(code).toEqual(200);
        expect(message).toEqual("Task task1 added.");

        // Check if the task was added to the database
        const [code2, result2] = listManager.getTask('task1', 'user1') as [number, TaskSchema];
        expect(code2).toEqual(200);

        expect(result2.taskName).toBe('task1');
        expect(result2.approver1).toBe('user1');
        expect(result2.approver2).toBe('user2');
        expect(result2.approver3).toBe('user3');
        expect(result2.taskDescription).toBe('Task 1 description');
        expect(result2.comments).toEqual([]);
        expect(result2.recommendation).toBe('');
        expect(result2.decisionMaker).toBe('');
    });

    /**
     * Test to ensure that adding a task that already exists returns a 409 status code
     */
    test('addTask should return 409 if task already exists', () => {
        const listManager = new SQLiteContainer('test_db_3.db');
        const mockTask: TaskSchema = {
            taskName: 'task1',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 11 description',
            recommendation: '',
            decisionMaker: ''
        };

        const [code, message] = listManager.addTask(mockTask);

        expect(code).toEqual(200);
        expect(message).toEqual('Task task1 added.');

        const [code2, message2] = listManager.addTask(mockTask);

        expect(code2).toEqual(409);
        expect(message2).toEqual('Task task1 already exists.');
    });

    /**
     * Test to ensure that adding a comment to a task works correctly
     */
    test('addComment should add a comment to a task', () => {
        const listManager = new SQLiteContainer('test_db_4.db');
        const mockTask: TaskSchema = {
            taskName: 'task2',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 2 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const comment = 'This is a comment';
        const user = 'user1';
        const [code, result] = listManager.addComment('task2', comment, user);

        expect(code).toEqual(200);
        expect(result).toEqual(`Comment added to task task2.`);

        // Check if the comment was added to the database
        const [code2, result2] = listManager.getTask('task2', 'user1') as [number, TaskSchema];
        expect(code2).toEqual(200);
        expect(result2.comments).toEqual([`${comment}:--:${user}`]);
    });

    /**
     * Test to ensure that adding multiple comments to a task with multiple approvers works correctly
     */
    test('addComment should add comments to a task with multiple approvers', () => {
        const listManager = new SQLiteContainer('test_db_5.db');
        const mockTask: TaskSchema = {
            taskName: 'task3',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 3 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const comment1 = 'This is a comment from User1';
        const comment2 = 'This is a comment from User2';
        const comment3 = 'This is a comment from User3';

        let [code, result] = listManager.addComment('task3', comment1, 'user1');

        expect(code).toEqual(200);
        expect(result).toEqual(`Comment added to task task3.`);

        [code, result] = listManager.addComment('task3', comment2, 'user2');

        expect(code).toEqual(200);
        expect(result).toEqual(`Comment added to task task3.`);

        [code, result] = listManager.addComment('task3', comment3, 'user3');

        expect(code).toEqual(200);
        expect(result).toEqual(`Comment added to task task3.`);

        // Check if the comments were added to the database
        const [code2, result2] = listManager.getTask('task3', 'user2') as [number, TaskSchema];
        expect(code2).toEqual(200);
        expect(result2.comments.length).toEqual(3);

        const comments = result2.comments;
        expect(comments).toContain(`${comment1}:--:user1`);
        expect(comments).toContain(`${comment2}:--:user2`);
        expect(comments).toContain(`${comment3}:--:user3`);
    });

    /**
     * Test to ensure that adding a comment to a non-existent task returns a 404 status code
     */
    test('addComment should return 404 if task does not exist', () => {
        const listManager = new SQLiteContainer('test_db_6.db');
        const comment = 'This is a comment';
        const user = 'user1';
        const [code, result] = listManager.addComment('task3', comment, user);

        expect(code).toEqual(404);
        expect(result).toEqual(`Task task3 not found.`);
    });

    /**
     * Test to ensure that adding a comment by a non-approver returns a 401 status code
     */
    test('addComment should return 401 if user is not an approver', () => {
        const listManager = new SQLiteContainer('test_db_7.db');
        const mockTask: TaskSchema = {
            taskName: 'task4',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 4 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const comment = 'This is a comment';
        const user = 'user4';
        const [code, result] = listManager.addComment('task4', comment, user);

        expect(code).toEqual(401);
        expect(result).toEqual(`User user4 is not an approver for task task4.`);
    });

    /**
     * Test to ensure that getting a non-existent task returns a 404 status code
     */
    test('getTask should return 404 if task does not exist', () => {
        const listManager = new SQLiteContainer('test_db_8.db');
        const [code, result] = listManager.getTask('task30000', 'user1');

        expect(code).toBe(404);
        expect(result).toBe('Task task30000 not found.');
    });

    /**
     * Test to ensure that getting all tasks works correctly
     */
    test('getAllTasks should return all tasks', () => {
        const listManager = new SQLiteContainer('test_db_9.db');
        const mockTask1: TaskSchema = {
            taskName: 'task5',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 5 description',
            recommendation: '',
            decisionMaker: ''
        };

        const mockTask2: TaskSchema = {
            taskName: 'task6',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 6 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask1);
        listManager.addTask(mockTask2);

        // Add some comments
        listManager.addComment('task5', 'comment1', 'user1');
        listManager.addComment('task5', 'comment2', 'user2');
        listManager.addComment('task6', 'comment3', 'user1');
        listManager.addComment('task6', 'comment4', 'user2');

        const [code, result] = listManager.getAllTasks() as [number, TaskSchema[]];

        expect(code).toBe(200);
        expect(result.length).toBe(2);

        const task1 = result[0];
        const task2 = result[1];

        expect(task1.taskName).toBe('task5');
        expect(task1.approver1).toBe('user1');
        expect(task1.approver2).toBe('user2');
        expect(task1.approver3).toBe('user3');
        expect(task1.comments.length).toBe(2);
        expect(task1.comments[0]).toBe('comment1:--:user1');
        expect(task1.comments[1]).toBe('comment2:--:user2');
        expect(task1.taskDescription).toBe('Task 5 description');
        expect(task1.recommendation).toBe('');
        expect(task1.decisionMaker).toBe('');

        expect(task2.taskName).toBe('task6');
        expect(task2.approver1).toBe('user1');
        expect(task2.approver2).toBe('user2');
        expect(task2.approver3).toBe('user3');
        expect(task2.comments.length).toBe(2);
        expect(task2.comments[0]).toBe('comment3:--:user1');
        expect(task2.comments[1]).toBe('comment4:--:user2');
        expect(task2.taskDescription).toBe('Task 6 description');
        expect(task2.recommendation).toBe('');
        expect(task2.decisionMaker).toBe('');
    });



    /**
     * Test to ensure that adding a recommendation to a task works correctly
     */
    test('addRecommendation should add a recommendation to a task', () => {
        const listManager = new SQLiteContainer('test_db_10.db');
        const mockTask: TaskSchema = {
            taskName: 'task5',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 5 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const recommendation = 'This is a recommendation';
        const user = 'user1';
        const [code, result] = listManager.addRecommendation('task5', recommendation, user);

        expect(code).toEqual(200);
        expect(result).toEqual(`Recommendation added to task task5.`);

        const [code2, newTask] = listManager.getTask('task5', user) as [number, TaskSchema];

        expect(newTask.recommendation).toEqual(recommendation);
        expect(newTask.decisionMaker).toEqual(user);
    });

    /**
     * Test to ensure that adding a recommendation to a non-existent task returns a 404 status code
     */
    test('addRecommendation should return 404 if task does not exist', () => {
        const listManager = new SQLiteContainer('test_db_11.db');
        const recommendation = 'This is a recommendation';
        const user = 'user1';
        const [code, result] = listManager.addRecommendation('task6', recommendation, user);

        expect(code).toEqual(404);
        expect(result).toEqual(`Task task6 not found.`);
    });

    /**
     * Test to ensure that adding a recommendation by a non-approver returns a 401 status code
     */
    test('addRecommendation should return 401 if user is not an approver', () => {
        const listManager = new SQLiteContainer('test_db_12.db');
        const mockTask: TaskSchema = {
            taskName: 'task7',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 7 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const recommendation = 'This is a recommendation';
        const user = 'user4';
        const [code, result] = listManager.addRecommendation('task7', recommendation, user);

        expect(code).toEqual(401);
        expect(result).toEqual(`User user4 is not an approver for task task7.`);
    });

    /**
     * Test to ensure that clearing comments for a task works correctly
     */
    test('clearComments should clear comments for a task', () => {
        const listManager = new SQLiteContainer('test_db_13.db');
        const mockTask: TaskSchema = {
            taskName: 'task8',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 8 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        listManager.addComment('task8', 'comment1', 'user1');
        listManager.addComment('task8', 'comment2', 'user2');

        const user = 'user1';
        const [code, result] = listManager.clearComments('task8', user);

        expect(code).toEqual(200);
        expect(result).toEqual(`Comments cleared for task task8.`);

        const [code2, newTask] = listManager.getTask('task8', user) as [number, TaskSchema];

        expect(newTask.comments.length).toEqual(0);
    });

    /**
     * Test to ensure that clearing comments for a non-existent task returns a 404 status code
     */
    test('clearComments should return 404 if task does not exist', () => {
        const listManager = new SQLiteContainer('test_db_14.db');
        const user = 'user1';
        const [code, result] = listManager.clearComments('task9', user);

        expect(code).toEqual(404);
        expect(result).toEqual(`Task task9 not found.`);
    });

    /**
     * Test to ensure that clearing comments by a non-approver returns a 401 status code
     */
    test('clearComments should return 401 if user is not an approver', () => {
        const listManager = new SQLiteContainer('test_db_15.db');
        const mockTask: TaskSchema = {
            taskName: 'task10',
            approver1: 'user1',
            approver2: 'user2',
            approver3: 'user3',
            comments: [],
            taskDescription: 'Task 10 description',
            recommendation: '',
            decisionMaker: ''
        };

        listManager.addTask(mockTask);

        const user = 'user4';
        const [code, result] = listManager.clearComments('task10', user);

        expect(code).toEqual(401);
        expect(result).toEqual(`User user4 is not an approver for task task10.`);
    });


});