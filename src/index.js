const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).json({
      error: "User not found",
    });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);
  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };
  if (userAlreadyExists) {
    response.status(400).json({
      error: "User already exists",
    });
  } else {
    users.push(user);
  }
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todos);
  return response.status(201).json({
    deadline: todos.deadline,
    done: todos.done,
    id: todos.id,
    title: todos.title,
    created_at: todos.created_at,
  });
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;
  const todos = user.todos.find((todos) => todos.id === id);
  if (!todos) {
    response.status(404).json({
      error: "Invalid todo id",
    });
  } else {
    todos.title = title;
    todos.deadline = new Date(deadline);
  }
  return response.status(200).json(todos);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    response.status(404).json({
      error: "Invalid todo id",
    });
  } else {
    todo.done = true;
  }
  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
const {user} = request;
const { id } = request.params;
const todos = user.todos;
const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    response.status(404).json({
      error: "Invalid todo id",
    });
  } else {
    const index = todos.indexOf(todo)
    todos.splice(index,1);
  }
  return response.status(204).json(user.todos)
});

module.exports = app;
