import unittest
# Assuming the Python version is named JSONFileContainer
from JSONFileContainer import JSONFileContainer
from typing import List, Tuple


class TaskSchema:
    def __init__(self, task_name: str, approver1: str, approver2: str, approver3: str, comments: List[str], task_description: str, recommendation: str, decision_maker: str):
        self.task_name = task_name
        self.approver1 = approver1
        self.approver2 = approver2
        self.approver3 = approver3
        self.comments = comments
        self.task_description = task_description
        self.recommendation = recommendation
        self.decision_maker = decision_maker


class TestTaskManager(unittest.TestCase):

    def setUp(self):
        self.task_manager = JSONFileContainer("test_db.json")
        self.sample_task = TaskSchema(
            task_name="task1",
            approver1="user1",
            approver2="user2",
            approver3="user3",
            comments=[],
            task_description="Task 1 description",
            recommendation="",
            decision_maker=""
        )

    def test_add_task(self):
        code, message = self.task_manager.add_task(self.sample_task)
        self.assertEqual(code, 200)
        self.assertEqual(message, "Task task1 added.")

        # Verify the task was added
        code, result = self.task_manager.get_task("task1", "user1")
        self.assertEqual(code, 200)
        self.assertEqual(result.task_name, "task1")
        self.assertEqual(result.approver1, "user1")
        self.assertEqual(result.approver2, "user2")
        self.assertEqual(result.approver3, "user3")
        self.assertEqual(result.task_description, "Task 1 description")
        self.assertEqual(result.comments, [])
        self.assertEqual(result.recommendation, "")
        self.assertEqual(result.decision_maker, "")

    def test_add_existing_task(self):
        self.task_manager.add_task(self.sample_task)
        code, message = self.task_manager.add_task(self.sample_task)
        self.assertEqual(code, 409)
        self.assertEqual(message, "Task task1 already exists.")

    def test_add_comment(self):
        self.task_manager.add_task(self.sample_task)
        code, result = self.task_manager.add_comment(
            "task1", "This is a comment", "user1")
        self.assertEqual(code, 200)
        self.assertEqual(result, "Comment added to task task1.")

        # Verify the comment was added
        code, task = self.task_manager.get_task("task1", "user1")
        self.assertEqual(code, 200)
        self.assertIn("This is a comment:--:user1", task.comments)

    def test_add_comment_to_nonexistent_task(self):
        code, result = self.task_manager.add_comment(
            "nonexistent_task", "Comment", "user1")
        self.assertEqual(code, 404)
        self.assertEqual(result, "Task nonexistent_task not found.")

    def test_add_comment_by_non_approver(self):
        self.task_manager.add_task(self.sample_task)
        code, result = self.task_manager.add_comment(
            "task1", "Comment", "user4")
        self.assertEqual(code, 401)
        self.assertEqual(
            result, "User user4 is not an approver for task task1.")

    def test_get_nonexistent_task(self):
        code, result = self.task_manager.get_task("nonexistent_task", "user1")
        self.assertEqual(code, 404)
        self.assertEqual(result, "Task nonexistent_task not found.")

    def test_get_all_tasks(self):
        task2 = TaskSchema(
            task_name="task2",
            approver1="user1",
            approver2="user2",
            approver3="user3",
            comments=[],
            task_description="Task 2 description",
            recommendation="",
            decision_maker=""
        )
        self.task_manager.add_task(self.sample_task)
        self.task_manager.add_task(task2)

        code, tasks = self.task_manager.get_all_tasks()
        self.assertEqual(code, 200)
        self.assertEqual(len(tasks), 2)

    def test_add_recommendation(self):
        self.task_manager.add_task(self.sample_task)
        code, result = self.task_manager.add_recommendation(
            "task1", "This is a recommendation", "user1")
        self.assertEqual(code, 200)
        self.assertEqual(result, "Recommendation added to task task1.")

        code, task = self.task_manager.get_task("task1", "user1")
        self.assertEqual(task.recommendation, "This is a recommendation")
        self.assertEqual(task.decision_maker, "user1")

    def test_clear_comments(self):
        self.task_manager.add_task(self.sample_task)
        self.task_manager.add_comment("task1", "comment1", "user1")
        code, result = self.task_manager.clear_comments("task1", "user1")
        self.assertEqual(code, 200)
        self.assertEqual(result, "Comments cleared for task task1.")

        code, task = self.task_manager.get_task("task1", "user1")
        self.assertEqual(len(task.comments), 0)


if __name__ == "__main__":
    unittest.main()
