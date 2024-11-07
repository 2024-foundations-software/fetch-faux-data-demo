
## storing data as documents vs tables.

In src/ItemCheckerDemo/src/SQLiteContainer.ts we have storage for tasks and comments.

```typescript
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
```   

The database has two tables, tasks, and comments.

### adding a comment to a task

The addComment method in SQLiteContainer.ts adds a comment to a task. The method first retrieves the task from the tasks table using the taskName parameter. If the task does not exist, the method returns a 404 status code and a message indicating that the task was not found. If the user is not an approver for the task, the method returns a 401 status code and a message indicating that the user is not an approver for the task. If the task and user are valid, the method inserts the comment into the comments table and returns a 200 status code and a message indicating that the comment was added successfully.
```typescript
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
```

### getting a task wwth comments

```typescript
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
```

### now compare this with document store

    In src/ItemCheckerDemo/src/JSONFileContainer.ts we have storage for tasks and comments.

```typescript
    
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
```

### adding a comment to a task

```typescript
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
```

### getting a task with comments

```typescript
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
```
