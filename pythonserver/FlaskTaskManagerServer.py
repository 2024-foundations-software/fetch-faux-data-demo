from flask import Flask, request, jsonify
from JSONFileContainer import JSONFileContainer

app = Flask(__name__)

task_manager = JSONFileContainer('task_database')

# Add a new task


@app.route('/tasks', methods=['POST'])
def add_task():
    task_data = request.get_json()
    task = {
        "task_name": task_data.get("taskName"),
        "approver1": task_data.get("approver1"),
        "approver2": task_data.get("approver2"),
        "approver3": task_data.get("approver3"),
        "comments": [],
        "task_description": task_data.get("taskDescription"),
        "recommendation": "",
        "decision_maker": ""
    }
    code, message = task_manager.add_task(task)
    return jsonify({"message": message}), code

# Get a specific task by name


@app.route('/tasks/<task_name>', methods=['GET'])
def get_task(task_name):
    user = request.args.get('user')
    code, result = task_manager.get_task(task_name, user)
    if code == 200:
        return jsonify(result), code
    else:
        return jsonify({"message": result}), code

# Add a comment to a task


@app.route('/tasks/<task_name>/comments', methods=['POST'])
def add_comment(task_name):
    data = request.get_json()
    comment = data.get("comment")
    user = data.get("user")
    code, message = task_manager.add_comment(task_name, comment, user)
    return jsonify({"message": message}), code

# Get all tasks


@app.route('/tasks', methods=['GET'])
def get_all_tasks():
    code, tasks = task_manager.get_all_tasks()
    if code == 200:
        return jsonify(tasks), code
    else:
        return jsonify({"message": tasks}), code

# Add a recommendation to a task


@app.route('/tasks/<task_name>/recommendation', methods=['POST'])
def add_recommendation(task_name):
    data = request.get_json()
    recommendation = data.get("recommendation")
    user = data.get("user")
    code, message = task_manager.add_recommendation(
        task_name, recommendation, user)
    return jsonify({"message": message}), code

# Clear all comments for a task


@app.route('/tasks/<task_name>/comments', methods=['DELETE'])
def clear_comments(task_name):
    user = request.args.get('user')
    code, message = task_manager.clear_comments(task_name, user)
    return jsonify({"message": message}), code


if __name__ == '__main__':
    print("Starting Flask Server")
    try:
        app.run(debug=True)
        print("it looks like the server exited.<<<<<<<<<<")
    except Exception as e:
        print(f"Error starting Flask server: {e}")

    print("Server running on port 5000")
