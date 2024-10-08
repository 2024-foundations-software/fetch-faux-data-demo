import { TaskSchema } from 'types';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from './file-utils';
import fs from 'fs';
import * as path from 'path';


class JSONFileContainer {
    private databaseLocation: string;
    private databaseRootLocation: string = path.join(__dirname, '..', 'jsonDB');


    // Initialize the ListManager object with the directory where the task files are stored
    constructor(databaseName: string) {

        /**
         * Create the databaseLocation directory if it does not exist
         * This is where the database directories will be created.
         */
        // this is the root location of the database and should be set up in the system
        // install.  
        if (!existsSync(this.databaseRootLocation)) {
            mkdirSync(this.databaseRootLocation);
        }

        this.databaseLocation = path.join(this.databaseRootLocation, databaseName);
        // Create the directory if it does not exist
        if (!existsSync(this.databaseLocation)) {
            mkdirSync(this.databaseLocation);
        }

    }

    // Read a JSON file and parse it into a TaskSchema object
    // we have a guard on all calls to this such that the file exists.
    private readJsonFile(filePath: string): TaskSchema | null {
        try {
            const data = readFileSync(filePath);
            return JSON.parse(data) as TaskSchema;
        } catch {
            console.error(`Error reading file ${filePath}`);
            return null;
        }

    }

    // Write a TaskSchema object to a JSON file
    // if the file write fails we have larger issues than the task not being written
    // this is guarded by the creation of the directory in the constructor
    private writeJsonFile(filePath: string, data: TaskSchema): void {
        try {
            writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing file ${filePath}:`, error);
            throw error;
        }
    }

    // Get all tasks
    // database exists since we have a guard on the constructor
    public getAllTasks(): [number, TaskSchema[] | string] {

        const files = fs.readdirSync(this.databaseLocation);

        const tasks = files
            .filter(file => file.endsWith('.json'))
            .map(file => this.readJsonFile(path.join(this.databaseLocation, file)))
            .filter(task => task !== null) as TaskSchema[];
        return [200, tasks];
    }

    public addTask(task: TaskSchema): [number, string] {
        const filePath = path.join(this.databaseLocation, `${task.taskName}.json`);
        if (existsSync(filePath)) {
            return [409, `Task ${task.taskName} already exists.`];
        }
        try {
            this.writeJsonFile(filePath, task);
        } catch (error) {
            return [500, `Error writing file: ${error}`];
        }

        return [200, `Task ${task.taskName} added.`];
    }

    public getTask(taskName: string, user: string): [number, TaskSchema | string] {
        const filePath = path.join(this.databaseLocation, `${taskName}.json`);

        if (fs.existsSync(filePath)) {

            const task = this.readJsonFile(filePath);
            if (!task) {
                return [500, 'Error reading file.'];
            }

            return [200, task!];
        }
        return [404, `Task ${taskName} not found.`];
    }

    // Add a comment to a task if the user is an approver
    public addComment(taskName: string, comment: string, user: string): [number, string] {
        const filePath = path.join(this.databaseLocation, `${taskName}.json`);
        if (fs.existsSync(filePath)) {
            const task = this.readJsonFile(filePath);
            if (task && (task.approver1 === user || task.approver2 === user || task.approver3 === user)) {
                task.comments.push(`${comment}:--:${user}`);
                this.writeJsonFile(filePath, task);
                return [200, `Comment added to task ${taskName}.`];;
            } else {
                return [401, `User ${user} is not an approver for task ${taskName}.`];
            }
        } else {
            return [404, `Task ${taskName} not found.`];
        }

    }

    public addRecommendation(taskName: string, recommendation: string, user: string): [number, string] {
        const filePath = path.join(this.databaseLocation, `${taskName}.json`);
        if (fs.existsSync(filePath)) {
            const task = this.readJsonFile(filePath);
            if (task && (task.approver1 === user || task.approver2 === user || task.approver3 === user)) {
                // Add the recommendation to the task
                task.recommendation = recommendation;
                task.decisionMaker = user;
                this.writeJsonFile(filePath, task);
                return [200, `Recommendation added to task ${taskName}.`];
            } else {
                return [401, `User ${user} is not an approver for task ${taskName}.`];
            }
        }
        return [404, `Task ${taskName} not found.`];
    }

    public clearComments(taskName: string, user: string): [number, string] {
        const filePath = path.join(this.databaseLocation, `${taskName}.json`);
        if (fs.existsSync(filePath)) {
            const task = this.readJsonFile(filePath);
            if (task && (task.approver1 === user || task.approver2 === user || task.approver3 === user)) {
                task.comments = [];
                this.writeJsonFile(filePath, task);
                return [200, `Comments cleared for task ${taskName}.`];
            } else {
                return [401, `User ${user} is not an approver for task ${taskName}.`];
            }
        }
        return [404, `Task ${taskName} not found.`];
    }


}

export default JSONFileContainer;