import { TaskSchema } from '../../types';
import { runTaskManagerTests } from './TaskManagerTestRunner';
import { ListManager } from '../src/JSONFileContainer';

import * as fs from 'fs';
import * as path from 'path';
import { after } from 'node:test';
import { clear } from 'console';

const documentTestPath = 'testdocuments';
const databaseRootLocation: string = path.join(__dirname, '..', 'jsonDB');


/**
 * Recursively delete files in a directory and then delete the directory itself.
 * @param dirPath - The path of the directory to delete.
 */
function deleteDirectoryRecursively(dirPath: string) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const filePath = path.join(dirPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                // Recursively delete files in the subdirectory
                deleteDirectoryRecursively(filePath);
            } else {
                // Delete the file
                fs.unlinkSync(filePath);
            }
        });
        // Delete the directory itself
        fs.rmdirSync(dirPath);
    }
}


const clearTestDatabases = () => {
    if (fs.existsSync(databaseRootLocation)) {
        const files = fs.readdirSync(databaseRootLocation);
        files.forEach((file) => {
            const filePath = path.join(databaseRootLocation, file);
            deleteDirectoryRecursively(filePath);

        });
    }
}

beforeAll(() => {
    clearTestDatabases();
});

afterAll(() => {
    clearTestDatabases();
});


// the tests here are for the implementation and as such will do thinks like check for the 
// existence of files and directories and the contents of files.  These tests will not be 
// testing the functionality of the class.
describe('ListManagerImplementation', () => {
    test('constructor should create a directory for the database', () => {
        const listManager = new ListManager('database1');

        const expectedDBLocation = path.join(databaseRootLocation, 'database1');
        expect(fs.existsSync(expectedDBLocation)).toBeTruthy();

    });
});



runTaskManagerTests((name: string) => new ListManager(name));