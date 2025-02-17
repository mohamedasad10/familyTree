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
app.get('/', async (req, res) => {
  try {
    const people = await Person.find()
      .populate('parents', 'name')
      .populate('children', 'name'); // Fetch all people with their parents and children

    const peopleOptions = people.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

    // Generate HTML for all people
    const peopleHTML = people.map(person => `
      <div class="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 fade-in">
        <h3 class="text-xl font-semibold text-green-900 mb-4">${person.name}</h3>
        <div class="space-y-2">
          <div>
            <span class="text-sm font-medium text-green-700">Parents:</span>
            <p class="text-green-900">${person.parents.map(p => p.name).join(', ') || 'None'}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-green-700">Children:</span>
            <p class="text-green-900">${person.children.map(c => c.name).join(', ') || 'None'}</p>
          </div>
        </div>
      </div>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Family Tree App</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in { animation: fadeIn 0.5s ease-in-out; }
        </style>
      </head>
      <body class="bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
        <!-- Top Navigation Bar -->
        <nav class="bg-green-600 shadow-lg sticky top-0 z-50">
          <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between items-center py-4">
              <div class="text-white text-2xl font-bold">Family Tree App</div>
              <div class="flex space-x-4">
                <a href="#add-person" class="text-white hover:text-green-200 transition-all">Add Person</a>
                <a href="#view-person" class="text-white hover:text-green-200 transition-all">View Person</a>
                <a href="#delete-person" class="text-white hover:text-green-200 transition-all">Delete Person</a>
              </div>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-6xl mx-auto p-8">
          <!-- Header -->
          <header class="text-center mb-12 fade-in">
            <h1 class="text-5xl font-bold text-green-900 mb-4">Family Tree App</h1>
            <p class="text-lg text-green-700">Create and manage your family tree with ease.</p>
          </header>

  

          <!-- Add Person Form -->
          <div id="add-person" class="bg-white p-8 rounded-2xl shadow-lg mb-8 transform transition-all hover:scale-105 fade-in">
            <h2 class="text-2xl font-semibold text-green-900 mb-6">Add a Person</h2>
            <form action="/add" method="POST" class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-green-700">Person's Name</label>
                <input type="text" name="name" required class="mt-1 block w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
              </div>

              <div id="parents">
                <label class="block text-sm font-medium text-green-700">Parents</label>
                <div class="parent-container space-y-3">
                  <input type="text" name="parents[]" placeholder="Parent's Name" class="w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
                </div>
                <button type="button" onclick="addParentField()" class="mt-3 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Add Parent
                </button>
              </div>

              <div id="children">
                <label class="block text-sm font-medium text-green-700">Children</label>
                <div class="children-container space-y-3">
                  <input type="text" name="children[]" placeholder="Child's Name" class="w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
                </div>
                <button type="button" onclick="addChildField()" class="mt-3 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Add Child
                </button>
              </div>

              <button type="submit" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
                Add Person
              </button>
            </form>
          </div>

          <!-- View Person Form -->
          <div id="view-person" class="bg-white p-8 rounded-2xl shadow-lg mb-8 transform transition-all hover:scale-105 fade-in">
            <h2 class="text-2xl font-semibold text-green-900 mb-6">View a Person</h2>
            <form action="/view" method="GET" class="space-y-6">
              <div>
                <label for="viewName" class="block text-sm font-medium text-green-700">Search or Select a Person</label>
                <select name="name" id="dropdownName" class="mt-1 block w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
                  <option value="" disabled selected>Select a person</option>
                  ${peopleOptions}
                </select>
                <input type="text" name="name" id="searchName" placeholder="Enter name" class="mt-1 block w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
              </div>
              <button type="submit" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
                View Person
              </button>
            </form>
          </div>

          <!-- Delete Person Form -->
          <div id="delete-person" class="bg-white p-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 fade-in">
            <h2 class="text-2xl font-semibold text-green-900 mb-6">Delete a Person</h2>
            <form id="deleteForm" class="space-y-6">
              <div>
                <label for="deleteName" class="block text-sm font-medium text-green-700">Select a Person to Delete</label>
                <select id="deleteName" name="name" required class="mt-1 block w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
                  <option value="" disabled selected>Select a person</option>
                  ${peopleOptions}
                </select>
              </div>
              <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all">
                Delete Person
              </button>
            </form>
          </div>
        </div>

        <!-- Display All People -->
          <div class="mb-12">
            <h2 class="text-2xl font-semibold text-green-900 mb-6">Display People</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${peopleHTML}
            </div>
          </div>

        <script>
          function addParentField() {
            const container = document.querySelector('.parent-container');
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.name = 'parents[]';
            newInput.placeholder = "Parent's Name";
            newInput.className = 'w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all';
            container.appendChild(newInput);
          }

          function addChildField() {
            const container = document.querySelector('.children-container');
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.name = 'children[]';
            newInput.placeholder = "Child's Name";
            newInput.className = 'w-full px-4 py-2 border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all';
            container.appendChild(newInput);
          }

          document.getElementById('deleteForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const name = document.getElementById('deleteName').value;

            try {
              const response = await fetch(\`http://localhost:5000/api/person/delete/\${name}\`, {
                method: 'DELETE',
              });

              const result = await response.json();
              alert(result.message || 'Person deleted successfully!');
              location.reload(); // Reload to update the dropdowns
            } catch (error) {
              console.error('Error:', error);
              alert('Something went wrong. Please try again.');
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle Adding a Person
app.post('/add', async (req, res) => {
  try {
    const { name, parents, children } = req.body;

    const parentNames = Array.isArray(parents) ? parents.filter(p => p.trim() !== '') : [];
    const childNames = Array.isArray(children) ? children.filter(c => c.trim() !== '') : [];

    let person = await Person.findOne({ name });
    if (!person) {
      person = new Person({ name, parents: [], children: [] });
      await person.save();
    }

    for (const parentName of parentNames) {
      let parent = await Person.findOne({ name: parentName });
      if (!parent) {
        parent = new Person({ name: parentName, children: [person._id] });
        await parent.save();
      } else if (!parent.children.includes(person._id)) {
        parent.children.push(person._id);
        await parent.save();
      }
      person.parents.push(parent._id);
    }

    for (const childName of childNames) {
      let child = await Person.findOne({ name: childName });
      if (!child) {
        child = new Person({ name: childName, parents: [person._id] });
        await child.save();
      } else if (!child.parents.includes(person._id)) {
        child.parents.push(person._id);
        await child.save();
      }
      person.children.push(child._id);
    }

    await person.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding person.');
  }
});

// Handle Viewing a Person
// Handle Viewing a Person
app.get('/view', async (req, res) => {
    try {
      const name = req.query.name;
      const person = await Person.findOne({ name })
        .populate('parents', 'name')
        .populate('children', 'name');
  
      if (!person) {
        return res.send(`
          <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-8 fade-in">
            <h2 class="text-2xl font-semibold text-green-900 mb-6">Person Not Found</h2>
            <p class="text-green-700 mb-6">The person you are looking for does not exist.</p>
            <a href="/" class="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
              Go Back
            </a>
          </div>
        `);
      }
  
      let response = `
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-8 fade-in">
          <h2 class="text-2xl font-semibold text-green-900 mb-6">Person Details</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium text-green-700">Name</h3>
              <p class="text-green-900">${person.name}</p>
            </div>
            <div>
              <h3 class="text-lg font-medium text-green-700">Parents</h3>
              <p class="text-green-900">${person.parents.map(p => p.name).join(', ') || 'None'}</p>
            </div>
            <div>
              <h3 class="text-lg font-medium text-green-700">Children</h3>
              <p class="text-green-900">${person.children.map(c => c.name).join(', ') || 'None'}</p>
            </div>
          </div>
          <a href="/" class="mt-6 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
            Go Back
          </a>
        </div>
      `;
  
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>View Person</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-in { animation: fadeIn 0.5s ease-in-out; }
          </style>
        </head>
        <body class="bg-gradient-to-br from-green-50 to-green-100 min-h-screen p-8">
          ${response}
        </body>
        </html>
      `);
    } catch (error) {
      console.error(error);
      res.status(500).send(`
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-8 fade-in">
          <h2 class="text-2xl font-semibold text-green-900 mb-6">Error</h2>
          <p class="text-green-700 mb-6">Something went wrong. Please try again.</p>
          <a href="/" class="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all">
            Go Back
          </a>
        </div>
      `);
    }
  });

// Handle Deleting a Person
app.delete('/api/person/delete/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const person = await Person.findOne({ name });

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    await Person.deleteOne({ name });
    res.json({ message: `${name} has been deleted successfully!` });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
