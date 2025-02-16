const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
