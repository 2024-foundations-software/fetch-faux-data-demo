import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { TaskSchema } from 'types';

/**
 * Interface representing the structure of a task with associated comments.
 */
interface TaskSchemaCommentJoin {
    taskName: string,
    approver1: string,
    approver2: string,
    approver3: string,
    taskDescription: string,
    recommendation: string,
    decisionMaker: string,
    commentId: number,
    comment: string,
    user: string
};

/**
 * Class representing a SQLite container for managing tasks and comments.
 */
class SQLiteContainer {
    private db: Database.Database; // The SQLite database instance
    private dbFilename: string; // The filename of the SQLite database

    /**
     * Constructor for SQLiteContainer.
     * @param database - The name of the database file.
     */
    constructor(database: string) {
        // Define the path to the database file
        const dataPath = path.join(__dirname, '..');
        this.dbFilename = path.join(dataPath, database + '.db');
        console.log(`Database file path: ${this.dbFilename}`);

        // Check if the database file exists
        if (!fs.existsSync(this.dbFilename)) {
            console.log('Database file does not exist. Creating a new one.');
            fs.writeFileSync(this.dbFilename, ''); // Create an empty database file
        }

        // Open the database
        this.db = new Database(this.dbFilename);
        console.log('Database opened successfully.');

        // Initialize the database schema
        this.initializeDatabase();
    }

    /**
     * Initializes the database schema by creating the necessary tables.
     */
    private initializeDatabase() {
        // Create the tasks table if it does not exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                taskName TEXT PRIMARY KEY CHECK(length(taskName) <= 255),
                approver1 TEXT,
                approver2 TEXT,
                approver3 TEXT,
                taskDescription TEXT,
                recommendation TEXT,
                decisionMaker TEXT
            );
        `);
        console.log('Tasks table created or already exists.');

        // Create the comments table if it does not exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                taskName TEXT,
                comment TEXT,
                user TEXT,
                FOREIGN KEY (taskName) REFERENCES tasks (taskName)
            );
        `);
        console.log('Comments table created or already exists.');
    }

    /**
     * Adds a new task to the database.
     * @param task - The task object containing task details.
     * @returns A tuple containing the status code and a message.
     */
    public addTask(task: { taskName: string, approver1: string, approver2: string, approver3: string, taskDescription: string }): [number, string] {
        const sqlQuery = `
            INSERT INTO tasks (taskName, approver1, approver2, approver3, taskDescription)
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            const stmt = this.db.prepare(sqlQuery); // Prepare the SQL statement
            stmt.run(task.taskName, task.approver1, task.approver2, task.approver3, task.taskDescription); // Execute the statement
            console.log(`Task ${task.taskName} added successfully.`);
            return [200, `Task ${task.taskName} added.`]; // Return success status and message
        } catch (error) {
            if ((error as any).code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                console.error('Error inserting task:', (error as Error).message);
                return [409, `Task ${task.taskName} already exists.`]; // Return conflict status if task already exists
            }
            console.error('Error inserting task:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }

    /**
     * Retrieves a task and its associated comments from the database.
     * @param taskName - The name of the task to retrieve.
     * @param user - The user requesting the task.
     * @returns A tuple containing the status code and the task object or an error message.
     */
    public getTask(taskName: string, user: string): [number, TaskSchema | string] {
        try {
            // Perform a join query to get the task and its associated comments
            const sqlQuery = `
                SELECT 
                    t.taskName, t.approver1, t.approver2, t.approver3, t.taskDescription, t.recommendation, t.decisionMaker,
                    c.id AS commentId, c.comment, c.user
                FROM tasks t
                LEFT JOIN comments c ON t.taskName = c.taskName
                WHERE t.taskName = ?
            `;

            const rows = this.db.prepare(sqlQuery).all(taskName) as TaskSchemaCommentJoin[]; // Execute the query

            if (rows.length === 0) {
                return [404, `Task ${taskName} not found.`]; // Return not found status if no rows are returned
            }

            // Extract task details from the first row
            const firstRow = rows[0];
            const resultingTask: TaskSchema = {
                taskName: firstRow.taskName,
                approver1: firstRow.approver1,
                approver2: firstRow.approver2,
                approver3: firstRow.approver3,
                taskDescription: firstRow.taskDescription,
                recommendation: firstRow.recommendation || '',
                decisionMaker: firstRow.decisionMaker || '',
                comments: []
            };

            // Extract comments from the rows
            for (const row of rows) {
                if (row.commentId !== null) {
                    resultingTask.comments.push(`${row.comment}:--:${row.user}`);
                }
            }

            return [200, resultingTask]; // Return success status and the task object
        } catch (error) {
            console.error('Error getting task:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }

    /**
     * Adds a comment to a task.
     * @param taskName - The name of the task to add the comment to.
     * @param comment - The comment text.
     * @param user - The user adding the comment.
     * @returns A tuple containing the status code and a message.
     */
    public addComment(taskName: string, comment: string, user: string): [number, string] {
        try {
            const taskStmt = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?');
            const task = taskStmt.get(taskName) as TaskSchema; // Retrieve the task

            if (!task) {
                return [404, `Task ${taskName} not found.`]; // Return not found status if task does not exist
            }

            // Check if the user is an approver for the task
            if (task.approver1 !== user && task.approver2 !== user && task.approver3 !== user) {
                return [401, `User ${user} is not an approver for task ${taskName}.`]; // Return unauthorized status if user is not an approver
            }

            const stmt = this.db.prepare('INSERT INTO comments (taskName, comment, user) VALUES (?, ?, ?)');
            stmt.run(taskName, comment, user); // Add the comment to the task
            console.log(`Comment added to task ${taskName}.`);
            return [200, `Comment added to task ${taskName}.`]; // Return success status and message
        } catch (error) {
            console.error('Error adding comment:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }

    /**
     * Clears all comments for a task.
     * @param taskName - The name of the task to clear comments for.
     * @param user - The user requesting to clear comments.
     * @returns A tuple containing the status code and a message.
     */
    public clearComments(taskName: string, user: string): [number, string] {
        try {
            const taskStmt = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?');
            const task = taskStmt.get(taskName) as TaskSchema; // Retrieve the task

            if (!task) {
                return [404, `Task ${taskName} not found.`]; // Return not found status if task does not exist
            }

            // Check if the user is an approver for the task
            if (task.approver1 !== user && task.approver2 !== user && task.approver3 !== user) {
                return [401, `User ${user} is not an approver for task ${taskName}.`]; // Return unauthorized status if user is not an approver
            }

            const stmt = this.db.prepare('DELETE FROM comments WHERE taskName = ?');
            stmt.run(taskName); // Delete all comments for the task
            console.log(`Comments cleared for task ${taskName}.`);
            return [200, `Comments cleared for task ${taskName}.`]; // Return success status and message
        } catch (error) {
            console.error('Error clearing comments:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }

    /**
     * Retrieves all tasks and their associated comments from the database.
     * @returns A tuple containing the status code and an array of tasks or an error message.
     */
    public getAllTasks(): [number, TaskSchema[] | string] {
        try {
            // Perform a join query to get all tasks and their associated comments
            const sqlQuery = `
                SELECT 
                    t.taskName, t.approver1, t.approver2, t.approver3, t.taskDescription, t.recommendation, t.decisionMaker,
                    c.id AS commentId, c.comment, c.user
                FROM tasks t
                LEFT JOIN comments c ON t.taskName = c.taskName
            `;

            const rows = this.db.prepare(sqlQuery).all() as TaskSchemaCommentJoin[]; // Execute the query

            // Process the rows to group comments by their respective tasks
            const tasksMap: { [key: string]: TaskSchema } = {};

            for (const row of rows) {
                if (!tasksMap[row.taskName]) {
                    tasksMap[row.taskName] = {
                        taskName: row.taskName,
                        approver1: row.approver1,
                        approver2: row.approver2,
                        approver3: row.approver3,
                        taskDescription: row.taskDescription,
                        recommendation: row.recommendation || '',
                        decisionMaker: row.decisionMaker || '',
                        comments: []
                    };
                }

                if (row.commentId !== null) {
                    tasksMap[row.taskName].comments.push(`${row.comment}:--:${row.user}`);
                }
            }

            // Convert the tasks map to an array
            const tasks = Object.values(tasksMap);

            return [200, tasks]; // Return success status and the array of tasks
        } catch (error) {
            console.error('Error getting tasks:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }

    /**
     * Adds a recommendation to a task and updates the decision maker.
     * @param taskName - The name of the task to add the recommendation to.
     * @param recommendation - The recommendation text.
     * @param user - The user adding the recommendation.
     * @returns A tuple containing the status code and a message.
     */
    public addRecommendation(taskName: string, recommendation: string, user: string): [number, string] {
        try {
            const taskStmt = this.db.prepare('SELECT * FROM tasks WHERE taskName = ?');
            const task = taskStmt.get(taskName) as TaskSchema; // Retrieve the task

            if (!task) {
                return [404, `Task ${taskName} not found.`]; // Return not found status if task does not exist
            }

            // Check if the user is an approver for the task
            if (task.approver1 !== user && task.approver2 !== user && task.approver3 !== user) {
                return [401, `User ${user} is not an approver for task ${taskName}.`]; // Return unauthorized status if user is not an approver
            }

            const stmt = this.db.prepare('UPDATE tasks SET recommendation = ?, decisionMaker = ? WHERE taskName = ?');
            stmt.run(recommendation, user, taskName); // Update the task with the recommendation and decision maker
            console.log(`Recommendation added to task ${taskName}.`);
            return [200, `Recommendation added to task ${taskName}.`]; // Return success status and message
        } catch (error) {
            console.error('Error adding recommendation:', (error as Error).message);
            return [500, `An error occurred: ${(error as Error).message}`]; // Return server error status for other errors
        }
    }
}

export default SQLiteContainer;