const express = require('express');
const Person = require('../models/personModel');
const router = express.Router();

// Route to add a new person
router.post('/add', async (req, res) => {
    try {
      const { name, parents, children } = req.body;
  
      // Create the new person
      const newPerson = new Person({
        name,
        parents: parents || [],
        children: children || [],
      });
  
      // Save the new person
      await newPerson.save();
  
      // Optionally, update the parents' children and children's parents
      if (parents) {
        for (let parentName of parents) {
          const parent = await Person.findOne({ name: parentName });
          if (parent) {
            parent.children.push(newPerson._id);
            await parent.save();
          }
        }
      }
  
      if (children) {
        for (let childName of children) {
          const child = await Person.findOne({ name: childName });
          if (child) {
            child.parents.push(newPerson._id);
            await child.save();
          }
        }
      }
  
      res.status(201).json({ message: 'Person added successfully!', newPerson });
    } catch (error) {
      console.error('Error adding person:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  router.get('/view/:name', async (req, res) => {
    try {
      const personName = req.params.name;
  
      // Find the person by their name
      const person = await Person.findOne({ name: personName })
        .populate('parents', 'name') // Populate the parents' names
        .populate('children', 'name'); // Populate the children's names
  
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }
  
      res.status(200).json(person);
    } catch (error) {
      console.error('Error fetching person:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
