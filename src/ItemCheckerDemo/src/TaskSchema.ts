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

