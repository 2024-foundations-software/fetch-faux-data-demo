import SQLiteContainer from '../src/SQLiteContainer';
import { runTaskManagerTests } from './TaskManagerTestRunner';
import Database, { Statement } from 'better-sqlite3';

import * as fs from 'fs';
import * as path from 'path';

const testDirectory = path.join(__dirname, '..');
// we need to test the failure of the database
let mockDb: jest.Mocked<Database.Database>;


const deleteTestDatabases = () => {
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
}
/**
 * We do this before to make sure that if a previous suite failed, the files are deleted
 */
beforeAll(() => {
    deleteTestDatabases();

});

/**
 * Clean up test database files after all tests have run
 */
afterAll(() => {
    deleteTestDatabases();
});


describe('Internal testing', () => {
    /**
         * Test to ensure that initializing the SQLiteContainer creates a database file
         */
    test('initialize list manager should create a database file', () => {
        const listManager = new SQLiteContainer('test_db_1');
        const dbPath = path.join(testDirectory, 'test_db_1.db');

        expect(fs.existsSync(dbPath)).toBe(true);
    });

    // The tests to see if a  500 is thrown when the database fails are here in the implementation 
    // specific test.  This is because the implementation is the only place where we can force the
    test('test for database failure using moc', () => {
        const listManager = new SQLiteContainer('test_db_2_longname');
        const task = {
            taskName: 'taskName',
            approver1: 'approver1',
            approver2: 'approver2',
            approver3: 'approver3',
            comments: 'comments',
            taskDescription: 'taskDescription',
            recommendation: 'recommendation',
            decisionMaker: 'decisionMaker'
        };
        const [code, message] = listManager.addTask(task);
        expect(code).toBe(200);

        mockDb = listManager['db'] as jest.Mocked<Database.Database>;
        // Mock the prepare method to throw an error
        mockDb.prepare = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // now lets try to add a task
        const [code2, message2] = listManager.addTask(task);
        expect(code2).toBe(500);

        const [code3, message3] = listManager.getAllTasks();
        expect(code3).toBe(500);

        const [code4, message4] = listManager.getTask('taskName', 'approver1');
        expect(code4).toBe(500);

        const [code5, message5] = listManager.addComment('taskName', 'comment', 'user');
        expect(code5).toBe(500);

        const [code6, message6] = listManager.clearComments('taskName', 'approver1');
        expect(code6).toBe(500);

        const [code7, message7] = listManager.addRecommendation('taskName', 'recommendation', 'user');
        expect(code7).toBe(500);


    });


});


runTaskManagerTests((name: string) => new SQLiteContainer(name));