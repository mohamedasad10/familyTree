document.getElementById('personForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent default form submission
  
    const name = document.getElementById('name').value;
    const parents = Array.from(document.querySelectorAll('input[name="parent[]"]')).map(input => input.value);
    const children = Array.from(document.querySelectorAll('input[name="child[]"]')).map(input => input.value);
  
    const personData = {
      name,
      parents,
      children
    };
  
    try {
      const response = await fetch('http://localhost:5000/api/person/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personData)
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Person added successfully!');
        document.getElementById('personForm').reset();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  });
  
  function addParentField() {
    const parentContainer = document.querySelector('.parent-container');
    const newParentInput = document.createElement('input');
    newParentInput.type = 'text';
    newParentInput.name = 'parent[]';
    newParentInput.placeholder = "Parent's Name";
    parentContainer.appendChild(newParentInput);
  }
  
  function addChildField() {
    const childrenContainer = document.querySelector('.children-container');
    const newChildInput = document.createElement('input');
    newChildInput.type = 'text';
    newChildInput.name = 'child[]';
    newChildInput.placeholder = "Child's Name";
    childrenContainer.appendChild(newChildInput);
  }

  document.getElementById('viewForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission
  
    const name = document.getElementById('viewName').value;
  
    try {
      const response = await fetch(`http://localhost:5000/api/person/view/${name}`);
  
      if (!response.ok) {
        const result = await response.json();
        alert(result.message || 'Person not found');
        return;
      }
  
      const person = await response.json();
  
      // Display the person's details
      const personDetails = document.getElementById('personDetails');
      personDetails.innerHTML = `
        <strong>Name:</strong> ${person.name}<br>
        <strong>Parents:</strong> ${person.parents.map(parent => parent.name).join(', ')}<br>
        <strong>Children:</strong> ${person.children.map(child => child.name).join(', ')}<br>
      `;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  });
  

  