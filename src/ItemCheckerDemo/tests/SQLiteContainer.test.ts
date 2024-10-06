import { TaskSchema } from '../../types';
import SQLiteContainer from '../src/SQLiteContainer';
import { runTaskManagerTests } from './TaskManagerTestRunner';

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


describe('Internal testing', () => {
    /**
         * Test to ensure that initializing the SQLiteContainer creates a database file
         */
    test('initialize list manager should create a database file', () => {
        const listManager = new SQLiteContainer('test_db_1.db');
        const dbPath = path.join(testDirectory, 'test_db_1.db');

        expect(fs.existsSync(dbPath)).toBe(true);
    });
});


runTaskManagerTests((name: string) => new SQLiteContainer(name));