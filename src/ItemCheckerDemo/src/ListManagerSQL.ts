import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { TaskSchema } from './TaskSchema';

class ListManagerSQL {
    private db: sqlite3.Database | null = null;
    private dbFilename = '';


    constructor(database: string) {
        const dataPath = path.join(__dirname, '..');
        this.dbFilename = path.join(dataPath, database);
        console.log(`Database file path: ${this.dbFilename}`);
    }



    public async initializeDatabase(): Promise<void> {
        console.log(`Initializing database.${this.dbFilename}`);
        await this.openDatabase();

        console.log('Creating tables.');
        await this.createUserTable();

        console.log('Creating comments table.');
        await this.createCommentTable();
    }

    private openDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            sqlite3.verbose();
            this.db = new sqlite3.Database(this.dbFilename, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database opened successfully.');
                    resolve();
                }
            });
        });
    }

    private createUserTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not open.');
            } else {
                this.db.run(`CREATE TABLE IF NOT EXISTS tasks (
                    taskName TEXT PRIMARY KEY,
                    approver1 TEXT NOT NULL,
                    approver2 TEXT NOT NULL,
                    approver3 TEXT NOT NULL,
                    taskDescription TEXT,
                    recommendation TEXT,
                    decisionMaker TEXT
                )`, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Table created or already exists.');
                        resolve();
                    }
                });
            }
        });
    }

    private createCommentTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not open.');
            } else {
                this.db.run(`CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    taskName TEXT NOT NULL,
                    comment TEXT NOT NULL,
                    user TEXT NOT NULL
                )`, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Table created or already exists.');
                        resolve();
                    }
                });
            }
        });
    }

    // Add a comment to a task if the user is an approver
    public async addComment(taskName: string, comment: string, user: string): Promise<[number, string]> {



        try {
            sqlite3.verbose();
            console.log(`Adding to task ${taskName}: ${comment} by ${user}`);

            // get the task and check for the user permissions

            const result = await new Promise<[number, string]>((resolve, reject) => {
                if (!this.db) {
                    reject([500, 'Database not open.']);
                }

                const task = await this.getTask(taskName);

                if (task[0] !== 200) {
                    resolve([task[0], task[1] as string]);
                }

                const taskData = task[1] as TaskSchema;

                if (taskData.approver1 !== user && taskData.approver2 !== user && taskData.approver3 !== user) {
                    resolve([401, `User ${user} is not an approver for task ${taskName}.`]);
                }

                const stmt = this.db!.prepare('INSERT INTO comments (taskName, comment, user) VALUES (?, ?, ?)');
                stmt.run(taskName, comment, user, (err: Error | null) => {
                    if (err) {
                        console.error('Error inserting comment:', err.message);
                        resolve([500, `An error occurred: ${err.message}`]);
                    } else {
                        console.log(`Comment added to task ${taskName}.`);
                        resolve([200, `Comment added to task ${taskName}.`]);
                    }
                });
            });

            return result

        }
        catch (error) {
            console.error('Error preparing statement:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`];
        }
    }

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

    public async addTask(task: { taskName: string, approver1: string, approver2: string, approver3: string, taskDescription: string }): Promise<[number, string]> {
        const sqlQuery = `
        INSERT INTO tasks (taskName, approver1, approver2, approver3, taskDescription)
        VALUES (?, ?, ?, ?, ?)
    `;

        try {
            sqlite3.verbose();
            console.log('Adding task:', task);

            const result = await new Promise<[number, string]>((resolve, reject) => {
                if (!this.db) {
                    reject([500, 'Database not open.']);
                }

                const stmt = this.db!.prepare(sqlQuery);
                stmt.run(task.taskName, task.approver1, task.approver2, task.approver3, task.taskDescription, (err: Error | null) => {
                    if (err) {
                        if ((err as any).code === 'SQLITE_CONSTRAINT') {
                            console.error('Error inserting task:', err.message);
                            resolve([409, `Task ${task.taskName} already exists.`]);
                        } else {
                            console.error('Error inserting task:', err.message);
                            resolve([500, `An error occurred: ${err.message}`]);
                        }
                    } else {
                        console.log(`++++ Task ${task.taskName} added successfully.`);
                        resolve([200, `Task ${task.taskName} added.`]);
                    }
                });
                stmt.finalize((finalizeErr: Error | null) => {
                    if (finalizeErr) {
                        console.error('Error finalizing statement:', finalizeErr.message);
                    }
                });
            });

            return result;
        } catch (error) {
            console.error('Error preparing statement:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`];
        }
    }


    private sanitizeTask(task: TaskSchema): TaskSchema {
        if (task.decisionMaker === null) {
            task.decisionMaker = '';
        }
        if (task.recommendation === null) {
            task.recommendation = '';
        }
        return task;
    }

    // Get a specific task
    public async getTask(taskName: string): Promise<[number, TaskSchema | string]> {
        if (!this.db) {
            return [500, 'Database not open.'];
        }

        try {
            // Get the task details
            const task = await new Promise<any>((resolve, reject) => {
                const taskStmt = this.db!.prepare('SELECT * FROM tasks WHERE taskName = ?');
                taskStmt.get(taskName, (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!task) {
                return [404, `Task ${taskName} not found.`];
            }

            // Get the comments associated with the task
            const comments = await new Promise<any[]>((resolve, reject) => {
                const commentsStmt = this.db!.prepare('SELECT * FROM comments WHERE taskName = ?');
                commentsStmt.all(taskName, (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            // Add the comments to the task object
            task.comments = comments;

            return [200, this.sanitizeTask(task)];
        } catch (error) {
            console.error('Error getting task:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`];
        }
    }
}

export default ListManagerSQL;