import os
import json
from typing import Tuple, Union, List


class JSONFileContainer:
    def __init__(self, database_name: str):
        """
        Initialize the JSONFileContainer object with the directory where the task files are stored.
        Create the databaseLocation directory if it does not exist.
        """
        self.database_root_location = os.path.join(
            os.path.dirname(__file__), '..', 'jsonDB')
        if not os.path.exists(self.database_root_location):
            os.makedirs(self.database_root_location)

        self.database_location = os.path.join(
            self.database_root_location, database_name)
        if not os.path.exists(self.database_location):
            os.makedirs(self.database_location)

    def _read_json_file(self, file_path: str) -> Union[dict, None]:
        """
        Read a JSON file and parse it into a dictionary object.
        """
        try:
            with open(file_path, 'r') as file:
                return json.load(file)
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return None

    def _write_json_file(self, file_path: str, data: dict) -> None:
        """
        Write a dictionary object to a JSON file.
        """
        try:
            with open(file_path, 'w') as file:
                json.dump(data, file, indent=2)
        except Exception as e:
            print(f"Error writing file {file_path}: {e}")
            raise

    def get_all_tasks(self) -> Tuple[int, Union[List[dict], str]]:
        """
        Get all tasks from the database.
        """
        try:
            files = os.listdir(self.database_location)
            tasks = [
                self._read_json_file(os.path.join(
                    self.database_location, file))
                for file in files if file.endswith('.json')
            ]
            tasks = [task for task in tasks if task is not None]
            return 200, tasks
        except Exception as e:
            return 500, str(e)

    def add_task(self, task: dict) -> Tuple[int, str]:
        """
        Add a new task to the database.
        """
        file_path = os.path.join(self.database_location, f"{
                                 task['taskName']}.json")
        if os.path.exists(file_path):
            return 409, f"Task {task['taskName']} already exists."
        try:
            self._write_json_file(file_path, task)
            return 200, f"Task {task['taskName']} added."
        except Exception as e:
            return 500, f"Error writing file: {e}"

    def get_task(self, task_name: str, user: str) -> Tuple[int, Union[dict, str]]:
        """
        Retrieve a task by its name.
        """
        file_path = os.path.join(self.database_location, f"{task_name}.json")
        if os.path.exists(file_path):
            task = self._read_json_file(file_path)
            if task is None:
                return 500, 'Error reading file.'
            return 200, task
        return 404, f"Task {task_name} not found."

    def add_comment(self, task_name: str, comment: str, user: str) -> Tuple[int, str]:
        """
        Add a comment to a task if the user is an approver.
        """
        file_path = os.path.join(self.database_location, f"{task_name}.json")
        if os.path.exists(file_path):
            task = self._read_json_file(file_path)
            if task and (task['approver1'] == user or task['approver2'] == user or task['approver3'] == user):
                task['comments'].append(f"{comment}:--:{user}")
                self._write_json_file(file_path, task)
                return 200, f"Comment added to task {task_name}."
            else:
                return 401, f"User {user} is not an approver for task {task_name}."
        return 404, f"Task {task_name} not found."

    def add_recommendation(self, task_name: str, recommendation: str, user: str) -> Tuple[int, str]:
        """
        Add a recommendation to a task if the user is an approver.
        """
        file_path = os.path.join(self.database_location, f"{task_name}.json")
        if os.path.exists(file_path):
            task = self._read_json_file(file_path)
            if task and (task['approver1'] == user or task['approver2'] == user or task['approver3'] == user):
                task['recommendation'] = recommendation
                task['decisionMaker'] = user
                self._write_json_file(file_path, task)
                return 200, f"Recommendation added to task {task_name}."
            else:
                return 401, f"User {user} is not an approver for task {task_name}."
        return 404, f"Task {task_name} not found."

    def clear_comments(self, task_name: str, user: str) -> Tuple[int, str]:
        """
        Clear all comments for a task if the user is an approver.
        """
        file_path = os.path.join(self.database_location, f"{task_name}.json")
        if os.path.exists(file_path):
            task = self._read_json_file(file_path)
            if task and (task['approver1'] == user or task['approver2'] == user or task['approver3'] == user):
                task['comments'] = []
                self._write_json_file(file_path, task)
                return 200, f"Comments cleared for task {task_name}."
            else:
                return 401, f"User {user} is not an approver for task {task_name}."
        return 404, f"Task {task_name} not found."


# Example TaskSchema for testing
task_example = {
    "taskName": "ExampleTask",
    "approver1": "user1",
    "approver2": "user2",
    "approver3": "user3",
    "comments": [],
    "taskDescription": "An example task description",
    "recommendation": "",
    "decisionMaker": ""
}

# Example usage
if __name__ == "__main__":
    container = JSONFileContainer("testDatabase")
    print(container.add_task(task_example))
    print(container.get_task("ExampleTask", "user1"))
    print(container.add_comment("ExampleTask", "This is a comment", "user1"))
    print(container.get_all_tasks())
