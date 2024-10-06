// Define the TaskSchema interface
export interface TaskSchema {
    approver1: string;
    approver2: string;
    approver3: string;
    comments: string[];
    taskName: string; // taskName this is used as the file name
    taskDescription: string;
    recommendation: string; // New field
    decisionMaker: string; // New field
}


export interface TaskManagerInterface {
    addTask(task: TaskSchema): [number, string];
    getTask(taskName: string, user: string): [number, TaskSchema | string];
    addComment(taskName: string, comment: string, user: string): [number, string];
    clearComments(taskName: string, user: string): [number, string];
    getAllTasks(): [number, TaskSchema[] | string];
    addRecommendation(taskName: string, recommendation: string, user: string): [number, string];
}