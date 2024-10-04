import sqlite3 from 'sqlite3';
import path from 'path';
import { TaskSchema } from './TaskSchema';

class ListManagerSQL {
    private db!: sqlite3.Database;
    private dbFilename = '';

    constructor(database: string) {

        const dataPath = path.join(__dirname, '..')
        this.dbFilename = path.join(dataPath, database);
        this.initializeDatabase();
    }

    private initializeDatabase() {
        this.db = new sqlite3.Database(this.dbFilename, (err) => {
            console.error(`Error opening database: ${err}`);
            return;
        });

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                taskName TEXT PRIMARY KEY,
                approver1 TEXT,
                approver2 TEXT,
                approver3 TEXT,
                taskDescription TEXT,
                recommendation TEXT,
                decisionMaker TEXT
            );
        `, (err) => {
            console.error(`Error creating table: ${err}`);
        });

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                taskName TEXT,
                comment TEXT,
                user TEXT,
                FOREIGN KEY (taskName) REFERENCES tasks (taskName)
            );
        `, (err) => {
            console.error(`Error creating table: ${err}`);
        });

        // check if the database was created
        const result = this.db.all(`SELECT name FROM sqlite_master WHERE type='table';`, (err, rows) => {
            if (err) {
                console.log(`Error creating database: ${err}`);
            }
            else {
                console.log(`Database created: ${result}`);
                const tables = rows.map((row: any) => row.name);
                console.log(`Tables: ${tables}`);
            }
        });

        // force the database to be written to disk
        this.db.exec('PRAGMA synchronous = FULL');

        console.log(`Database created: ${result}`);
    }

    // // Add a comment to a task if the user is an approver
    // public addComment(taskName: string, comment: string, user: string): [number, string] {
    //     const taskResult = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?').get(taskName);

    //     // if the task exists convert it to task object

    //     const task = taskResult ? {
    //         taskName: taskResult.taskName,
    //         approver1: taskResult.approver1,
    //         approver2: taskResult.approver2,
    //         approver3: taskResult.approver3
    //     } : undefined;
    //     if (task) {
    //         if (task.approver1 === user || task.approver2 === user || task.approver3 === user) {
    //             this.db.prepare('INSERT INTO comments (taskName, comment, user) VALUES (?, ?, ?)').run(taskName, comment, user);
    //             return [200, `Comment added to task ${taskName}.`];
    //         } else {
    //             return [401, `User ${user} is not an approver for task ${taskName}.`];
    //         }
    //     } else {
    //         return [404, `Task ${taskName} not found.`];
    //     }
    // }

    // public addRecommendation(taskName: string, recommendation: string, user: string): [number, string] {
    //     const task = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?').get(taskName);
    //     if (task) {
    //         if (task.approver1 === user || task.approver2 === user || task.approver3 === user) {
    //             this.db.prepare('UPDATE tasks SET recommendation = ?, decisionMaker = ? WHERE taskName = ?').run(recommendation, user, taskName);
    //             this.addComment(taskName, `Recommendation: ${recommendation}`, user);
    //             return [200, `Recommendation added to task ${taskName}.`];
    //         } else {
    //             return [401, `User ${user} is not an approver for task ${taskName}.`];
    //         }
    //     } else {
    //         return [404, `Task ${taskName} not found.`];
    //     }
    // }

    // public clearComments(taskName: string, user: string): [number, string] {
    //     const task = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?').get(taskName);
    //     if (task) {
    //         if (task.approver1 === user || task.approver2 === user || task.approver3 === user) {
    //             this.db.prepare('DELETE FROM comments WHERE taskName = ?').run(taskName);
    //             return [200, `Comments cleared for task ${taskName}.`];
    //         } else {
    //             return [401, `User ${user} is not an approver for task ${taskName}.`];
    //         }
    //     } else {
    //         return [404, `Task ${taskName} not found.`];
    //     }
    // }

    // // Get all tasks
    // public getAllTasks(): [number, any[]] {
    //     const tasks = this.db.prepare('SELECT * FROM tasks').all();
    //     return [200, tasks];
    // }

    // Add a new task
    public addTask(task: TaskSchema): [number, string] {
        // get the values for the ins
        try {
            const sqlQuery = `INSERT INTO tasks (taskName, approver1, approver2, approver3, taskDescription) 
                               VALUES (?, ?, ?, ?, ?)`;
            this.db.prepare(sqlQuery).
                run(task.taskName, task.approver1, task.approver2, task.approver3, task.taskDescription);
            return [200, `Task ${task.taskName} added.`];
        } catch (error) {
            if ((error as any).code === 'SQLITE_CONSTRAINT') {
                return [409, `Task ${task.taskName} already exists.`];
            }
            return [500, `An error occurred: ${(error as Error).message}`];
        }
    }

    // // Get a specific task
    // public getTask(taskName: string): [number, any] {
    //     const task = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?').get(taskName);
    //     if (task) {
    //         const comments = this.db.prepare('SELECT * FROM comments WHERE taskName = ?').all(taskName);
    //         task.comments = comments;
    //         return [200, task];
    //     } else {
    //         return [404, `Task ${taskName} not found.`];
    //     }
    // }
}

export default ListManagerSQL;