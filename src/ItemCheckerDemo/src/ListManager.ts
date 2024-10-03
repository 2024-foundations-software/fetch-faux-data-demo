import { TaskSchema } from './TaskSchema';
import * as fs from 'fs';
import * as path from 'path';


class ListManager {
    private directory: string;

    // Initialize the ListManager object with the directory where the task files are stored
    constructor(directory: string = path.join(__dirname, 'fetch-faux-data-demo', 'documents')) {
        // Create the directory if it does not exist
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        this.directory = directory;
    }

    // Read a JSON file and parse it into a TaskSchema object
    private readJsonFile(filePath: string): TaskSchema | null {
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data) as TaskSchema;
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }

    // Write a TaskSchema object to a JSON file
    private writeJsonFile(filePath: string, data: TaskSchema): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Error writing file ${filePath}:`, error);
        }
    }

    // Get all tasks
    public getAllTasks(): TaskSchema[] {
        const files = fs.readdirSync(this.directory);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => this.readJsonFile(path.join(this.directory, file)))
            .filter(task => task !== null) as TaskSchema[];
    }

    public addTask(task: TaskSchema): [number, string] {
        const filePath = path.join(this.directory, `${task.taskName}.json`);
        if (fs.existsSync(filePath)) {
            return [409, `Task ${task.taskName} already exists.`];
        }
        this.writeJsonFile(filePath, task);
        return [201, 'Task added successfully.'];
    }

    public getTask(taskName: string, user: string): [number, TaskSchema | string] {
        const filePath = path.join(this.directory, `${taskName}.json`);

        if (fs.existsSync(filePath)) {
            // check to see if the user is an approver
            const task = this.readJsonFile(filePath);

            if (!task) {
                return [404, `Task ${taskName} not found.`];
            }
            return [200, task];
        }
        return [404, `Task ${taskName} not found.`];
    }

    // Add a comment to a task if the user is an approver
    public addComment(taskName: string, comment: string, user: string): [number, string] {
        const filePath = path.join(this.directory, `${taskName}.json`);
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
        return [200, `Comment added to task ${taskName}.`];
    }

    public addRecommendation(taskName: string, recommendation: string, user: string): [number, string] {
        const filePath = path.join(this.directory, `${taskName}.json`);
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


}

export { ListManager };