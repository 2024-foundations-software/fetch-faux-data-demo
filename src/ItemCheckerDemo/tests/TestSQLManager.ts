import { TaskSchema } from '../src/TaskSchema';
import ListManagerSQL from '../src/ListManagerSQL';
import * as fs from 'fs';
import * as path from 'path';
import { after } from 'node:test';


const testDatabase = 'test.db';
const testDirectory = path.join(__dirname, '..');
const testFilePath = path.join(testDirectory, testDatabase);
let listManager: ListManagerSQL;
console.log(testDirectory);

console.log(testFilePath);

// delete any database file that exists
if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
}

function deleteDatabase(database: string) {
    const dbPath = path.join(testDirectory, database);
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
}

function testAddItem() {
    const addListManager = new ListManagerSQL('writeOne.db');
    deleteDatabase('writeOne.db');

    addListManager.initializeDatabase().then(() => {
        console.log('Database initialized.');

        const task: TaskSchema = {
            taskName: 'Task1',
            approver1: 'Alice',
            approver2: 'Bob',
            approver3: 'Charlie',
            taskDescription: 'This is a test task.',
            comments: [],
            recommendation: '',
            decisionMaker: ''
        };

        let codeWrite: number = 0;
        let resultWrite: TaskSchema | string = "";
        addListManager.addTask(task).then(([code, result]) => {
            codeWrite = code;
            resultWrite = result;

            if (codeWrite === 200) {
                console.log('Item added.');
            } else {
                console.error('Error adding item:', resultWrite);
            }

            // now lets try to read the data
            addListManager.getTask('Task1').then(([code, result]) => {
                if (code === 200) {
                    const task = result as TaskSchema;
                    console.log('Item read:', task);
                } else {
                    console.error('Error reading item:', result);
                }
            }
            );



        });



        // console.log('All items:', tasks);
    }
    );
}


async function testInitializeDatabase() {
    listManager = new ListManagerSQL(testDatabase);

    await listManager.initializeDatabase();
    console.log('Database initialized.');

    // check if the database file exists
    if (fs.existsSync(testFilePath)) {
        console.log('xxxxxx Database file exists.');
    }
}

testInitializeDatabase().then(() => {
    console.log('Database initialization completed.');
    testAddItem();

}).catch((err) => {
    console.error('Error initializing database:', err);
});






