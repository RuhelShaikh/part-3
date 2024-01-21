const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();

const Person = require("./models/person");

app.use(cors());

morgan.token("postData", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "-";
});

app.use(
  morgan(":method :url :status - :response-time ms :postData", {
    stream: {
      write: (message) => {
        console.log(message.trim());
      },
    },
  })
);
app.use(express.json());

app.use(express.static("dist"));

function generateId() {
  return Math.floor(Math.random() * 10000) + 1;
}

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const time = new Date();
    const ppls = persons.length;

    response.send(
      `<p>Phonebook has info for ${ppls} people</p><p>${time.toLocaleString()}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or number missing",
    });
  }

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number,
  });

  // if (
  //   Person.find((ppl) => ppl.name.toLowerCase() === person.name.toLowerCase())
  // ) {
  //   return response.status(400).json({
  //     error: "Name must be unique",
  //   });
  // }

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
