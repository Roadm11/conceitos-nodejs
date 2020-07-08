const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)){
    return response.status(400).json({ error: "Invalid repository Id"});
  }

  return next();
};

app.use(logRequest);
app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  repositories.push(repository);

  return response.status(200).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repoIndex = repositories.findIndex(repo => repo.id === id);
  
  if (repoIndex < 0){
    return response.status(400).json({ error: "Repository not exists."})
  }

  const repository = repositories[repoIndex];
  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  repositories[repoIndex] = repository;

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);
 
  if (repoIndex < 0){
    return response.status(400).json({ error: "Repository not exists."})
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).json(repositories);
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  
  if (repoIndex < 0){
    return response.status(400).json({ error: "Repository not exists."})
  }
  
  const repository = repositories[repoIndex];
  repository.likes += 1
  repositories[repoIndex] = repository;

  return response.status(200).json(repository);
});

module.exports = app;
