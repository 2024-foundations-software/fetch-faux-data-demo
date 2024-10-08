import { TaskSchema } from '../../types';
import { runTaskManagerTests } from './TaskManagerTestRunner';
import JSONFileContainer from '../src/JSONFileContainer';
import * as fileUtils from '../src/file-utils';

import * as fs from 'fs';
import * as path from 'path';

const documentTestPath = 'testdocuments';
const databaseRootLocation: string = path.join(__dirname, '..', 'jsonDB');
const mockDatabaseName = 'testDatabase';
let jsonFileContainer: JSONFileContainer;

/**
 * Recursively delete files in a directory and then delete the directory itself.
 * @param dirPath - The path of the directory to delete.
 */
function deleteDirectoryRecursively(dirPath: string) {
    // Check if the directory is a file or a directory
    if (fs.lstatSync(dirPath).isFile()) {
        fs.unlinkSync(dirPath); // Delete the file
        return;
    }
    if (fs.existsSync(dirPath)) {
        // Iterate through all files and subdirectories in the directory
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
        // Delete the directory itself after all files have been deleted
        fs.rmdirSync(dirPath);
    }
}

/**
 * Clear all test databases by deleting all directories and files in the database root location.
 */
const clearTestDatabases = () => {
    if (fs.existsSync(databaseRootLocation)) {
        const files = fs.readdirSync(databaseRootLocation);
        files.forEach((file) => {
            // check to see if the file starts with test_db
            if (!file.startsWith('test_db')) {
                return;
            }
            const filePath = path.join(databaseRootLocation, file);
            deleteDirectoryRecursively(filePath);
        });
    }
}

// Run before all tests to clear out any existing test databases
beforeAll(() => {
    clearTestDatabases();
});

// Run after all tests to perform any necessary cleanup (currently empty)
afterAll(() => {
    // wait 5 seconds then clear the databases
    setTimeout(() => {
        clearTestDatabases();
    }, 5000);
});

// Tests for verifying the implementation details of the JSONFileContainer class
// These tests check for the existence of files, directories, and file contents
// They do not directly test the functionality of the class methods.
describe('ListManagerImplementation', () => {
    test('constructor should create a directory for the database', () => {
        // Create a new JSONFileContainer instance
        const listManager = new JSONFileContainer('database1');

        // Verify that the expected directory for the database is created
        const expectedDBLocation = path.join(databaseRootLocation, 'database1');
        expect(fs.existsSync(expectedDBLocation)).toBeTruthy();
    });
});

// Tests for the JSONFileContainer class constructor
// These tests mock filesystem operations to simulate different scenarios
describe('JSONFileContainer Constructor', () => {
    let existsSyncMock: jest.SpyInstance;
    let mkdirSyncMock: jest.SpyInstance;

    beforeEach(() => {
        // Mock fs.existsSync and fs.mkdirSync functions
        existsSyncMock = jest.spyOn(fileUtils, 'existsSync').mockReturnValue(true);
        mkdirSyncMock = jest.spyOn(fileUtils, 'mkdirSync').mockImplementation(() => undefined);
    });

    afterEach(() => {
        // Restore all mocked functions after each test
        jest.restoreAllMocks();
    });

    it('should create the database root directory if it does not exist', () => {
        // Simulate the root directory not existing
        existsSyncMock.mockReturnValueOnce(false);
        jsonFileContainer = new JSONFileContainer(mockDatabaseName);
        const expectedPath = path.join(__dirname, '..', 'jsonDB');
        // Verify that mkdirSync is called to create the root directory
        expect(mkdirSyncMock).toHaveBeenCalledWith(expectedPath);
        // Log all calls to the mkdirSync mock for debugging purposes
        console.log(mkdirSyncMock.mock.calls.map(call => call[0]));
        existsSyncMock.mockRestore();
    });

    it('should cause an error if there is an error reading a file', () => {
        // Restore original implementations for this test
        existsSyncMock.mockRestore();
        mkdirSyncMock.mockRestore();
        jsonFileContainer = new JSONFileContainer('test_db_missingFileDB');
        jsonFileContainer.addTask({
            taskName: 'task1',
            approver1: 'approver1',
            approver2: 'approver2',
            approver3: 'approver3',
            comments: [],
            taskDescription: 'taskDescription',
            recommendation: 'recommendation',
            decisionMaker: 'decisionMaker'
        });

        // Mock the readFileSync function to throw an error
        const readFileSyncMock = jest.spyOn(fileUtils, 'readFileSync').mockImplementation(() => {
            throw new Error('Error reading file');
        });
        // Attempt to get a task, which should trigger the error
        const [code, result] = jsonFileContainer.getTask('task1', 'approver1');
        expect(code).toBe(500);
        expect(result as string).toBe('Error reading file.');

        readFileSyncMock.mockRestore();
    });

    it('should cause an error if there is an error writing a file', () => {
        // Restore original implementations for this test
        existsSyncMock.mockRestore();
        mkdirSyncMock.mockRestore();
        jsonFileContainer = new JSONFileContainer('test_db_missingFileDB2');
        // Mock the writeFileSync function to throw an error
        const writeFileSyncMock = jest.spyOn(fileUtils, 'writeFileSync').mockImplementation(() => {
            throw new Error('Error writing file');
        });

        // Attempt to add a task, which should trigger the error
        const [code, result] = jsonFileContainer.addTask({
            taskName: 'task1',
            approver1: 'approver1',
            approver2: 'approver2',
            approver3: 'approver3',
            comments: [],
            taskDescription: 'taskDescription',
            recommendation: 'recommendation',
            decisionMaker: 'decisionMaker'
        });
        expect(code).toBe(500);
        expect(result as string).toBe('Error writing file: Error: Error writing file');

        writeFileSyncMock.mockRestore();
    });
});

// Run the generic task manager tests on the JSONFileContainer class
runTaskManagerTests((name: string) => new JSONFileContainer(name));