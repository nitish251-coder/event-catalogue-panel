const API_URL = 'https://api.jsonbin.io/v3/b/686eb079e3d25703b38cc4f6';
const MASTER_KEY = '$2a$10$58X/YsHzDhy7448n2ZM1Hu0rICv36XEenaxZhyNZind39ZsFNCK/2';

async function loadCatalogue() {
  const res = await fetch(API_URL + '/latest', {
    headers: { 'X-Master-Key': MASTER_KEY }
  });
  const json = await res.json();
  const catalogue = json.record;
  const container = document.getElementById('catalogue');
  container.innerHTML = '';

  for (const category in catalogue) {
    catalogue[category].forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'package';
      div.innerHTML = `<b>${item.title}</b><br>₹${item.price}<br>
        <button onclick="deletePackage('${category}', ${index})">❌ Delete</button>`;
      container.appendChild(div);
    });
  }
}

async function deletePackage(category, index) {
  const res = await fetch(API_URL + '/latest', {
    headers: { 'X-Master-Key': MASTER_KEY }
  });
  const json = await res.json();
  const data = json.record;
  data[category].splice(index, 1);
  await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': MASTER_KEY
    },
    body: JSON.stringify(data)
  });
  loadCatalogue();
}

function addPackage() {
  alert("Adding package UI is under development. Please update JSONBin manually.");
}

loadCatalogue();
