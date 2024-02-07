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
  const id = request.params.id;

  // Use Mongoose's findByIdAndDelete method to delete the person by their ID
  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        // If the person was found and deleted, send a 204 No Content response
        response.status(204).end();
      } else {
        // If the person with the specified ID was not found, send a 404 Not Found response
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => {
      // If an error occurred during the delete operation, send a 500 Internal Server Error response
      console.error("Error deleting person:", error);
      response.status(500).json({ error: "Internal Server Error" });
    });
});

app.post("/api/persons", async (request, response) => {
  const body = request.body;

  // Validate the request body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or number missing",
    });
  }

  // Create a new Person object using the request body
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  try {
    // Save the person to the database
    const savedPerson = await person.save();

    // Respond with the saved person object
    response.json(savedPerson);
  } catch (error) {
    // If Mongoose validation fails, respond with a 400 status code and the validation error message
    if (error.name === "ValidationError") {
      return response.status(400).json({ error: error.message });
    }
    // For other types of errors, respond with a generic error message
    response.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/persons/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  // Create a new Person object with the updated information
  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  try {
    // Update the person in the database
    const result = await Person.findByIdAndUpdate(id, updatedPerson, {
      new: true,
    });

    if (!result) {
      return response.status(404).json({ error: "Person not found" });
    }

    // Respond with the updated person object
    response.json(result);
  } catch (error) {
    // If an error occurred during the update operation, respond with a 400 status code and the error message
    console.error("Error updating person:", error);
    response
      .status(400)
      .json({ error: "Failed to update person information." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
