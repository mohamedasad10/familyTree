const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define Person Schema
const personSchema = new mongoose.Schema({
  name: String,
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
});

const Person = mongoose.model('Person', personSchema);

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the HTML form when visiting the homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Family Tree App</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        label, input, button { display: block; margin: 10px 0; }
        .parent-container, .children-container { margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>Family Tree - Add a Person</h1>

      <form action="/add" method="POST">
        <label for="name">Person's Name:</label>
        <input type="text" name="name" required>

        <div id="parents">
          <label>Parents' Names:</label>
          <div class="parent-container">
            <input type="text" name="parents[]" placeholder="Parent's Name">
          </div>
          <button type="button" onclick="addParentField()">Add Parent</button>
        </div>

        <div id="children">
          <label>Children's Names:</label>
          <div class="children-container">
            <input type="text" name="children[]" placeholder="Child's Name">
          </div>
          <button type="button" onclick="addChildField()">Add Child</button>
        </div>

        <button type="submit">Add Person</button>
      </form>

      <h1>View Person</h1>
      <form action="/view" method="GET">
        <label for="viewName">Enter Person's Name:</label>
        <input type="text" name="name" required>
        <button type="submit">View Person</button>
      </form>

      <h2>Person Details:</h2>
      <div id="personDetails"></div>

      <script>
        function addParentField() {
          const container = document.querySelector('.parent-container');
          const newInput = document.createElement('input');
          newInput.type = 'text';
          newInput.name = 'parents[]';
          newInput.placeholder = "Parent's Name";
          container.appendChild(newInput);
        }

        function addChildField() {
          const container = document.querySelector('.children-container');
          const newInput = document.createElement('input');
          newInput.type = 'text';
          newInput.name = 'children[]';
          newInput.placeholder = "Child's Name";
          container.appendChild(newInput);
        }
      </script>
    </body>
    </html>
  `);
});

// Handle Adding a Person
app.post('/add', async (req, res) => {
  try {
    const { name, parents, children } = req.body;

    // Convert names to an array (remove empty values)
    const parentNames = Array.isArray(parents) ? parents.filter(p => p.trim() !== '') : [];
    const childNames = Array.isArray(children) ? children.filter(c => c.trim() !== '') : [];

    // Find or create the person
    let person = await Person.findOne({ name });
    if (!person) {
      person = new Person({ name, parents: [], children: [] });
      await person.save();
    }

    // Handle Parents
    for (const parentName of parentNames) {
      let parent = await Person.findOne({ name: parentName });
      if (!parent) {
        parent = new Person({ name: parentName, children: [person._id] });
        await parent.save();
      } else {
        if (!parent.children.includes(person._id)) {
          parent.children.push(person._id);
          await parent.save();
        }
      }
      person.parents.push(parent._id);
    }

    // Handle Children
    for (const childName of childNames) {
      let child = await Person.findOne({ name: childName });
      if (!child) {
        child = new Person({ name: childName, parents: [person._id] });
        await child.save();
      } else {
        if (!child.parents.includes(person._id)) {
          child.parents.push(person._id);
          await child.save();
        }
      }
      person.children.push(child._id);
    }

    await person.save();
    res.send(`<h2>${name} has been added to the family tree!</h2><a href="/">Go back</a>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding person.');
  }
});

// Handle Viewing a Person
app.get('/view', async (req, res) => {
  try {
    const name = req.query.name;
    const person = await Person.findOne({ name })
      .populate('parents', 'name')
      .populate('children', 'name');

    if (!person) {
      return res.send('<h2>Person not found</h2><a href="/">Go back</a>');
    }

    // Generate HTML response
    let response = `<h2>Name: ${person.name}</h2>`;
    response += `<strong>Parents:</strong> ${person.parents.map(p => p.name).join(', ') || 'None'}<br>`;
    response += `<strong>Children:</strong> ${person.children.map(c => c.name).join(', ') || 'None'}<br>`;
    response += '<br><a href="/">Go back</a>';

    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching person.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
