import axios from "axios";

const BIN_ID = "686eb079e3d25703b38cc4f6"; // Your Bin ID
const API_KEY = "$2a$10$58X/YsHzDhy7448n2ZM1Hu0rICv36XEenaxZhyNZind39ZsFNCK/2"; // Replace with your JSONBin secret key

const catalogueList = document.getElementById("catalogue-list");
const form = document.getElementById("addForm");

// Load catalogue from JSONBin
async function loadCatalogue() {
  catalogueList.innerHTML = "🔄 Loading...";
  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = res.data.record;
    renderCatalogue(data);
  } catch (err) {
    catalogueList.innerHTML = "❌ Error loading catalogue: " + err.message;
  }
}

function renderCatalogue(catalogue) {
  catalogueList.innerHTML = "";
  for (const category in catalogue) {
    const container = document.createElement("div");
    container.className = "category";

    const title = document.createElement("h3");
    title.textContent = category.toUpperCase();
    container.appendChild(title);

    catalogue[category].forEach((item, index) => {
      const textarea = document.createElement("textarea");
      textarea.rows = 8;
      textarea.cols = 60;
      textarea.value = JSON.stringify(item, null, 2);
      textarea.dataset.category = category;
      textarea.dataset.index = index;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "💾 Save";
      saveBtn.onclick = () => saveItem(category, index, textarea.value);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.onclick = () => deleteItem(category, index);

      const wrapper = document.createElement("div");
      wrapper.className = "item-block";
      wrapper.appendChild(textarea);
      wrapper.appendChild(saveBtn);
      wrapper.appendChild(deleteBtn);

      container.appendChild(wrapper);
    });

    catalogueList.appendChild(container);
  }
}

// Save edited item
async function saveItem(category, index, jsonText) {
  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });

    const latest = res.data.record;
    latest[category][index] = JSON.parse(jsonText);

    await updateBin(latest);
    alert("✅ Item saved!");
  } catch (err) {
    alert("❌ Failed to save item: " + err.message);
  }
}

// Delete item from category
async function deleteItem(category, index) {
  const confirmDelete = confirm("Are you sure you want to delete this package?");
  if (!confirmDelete) return;

  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });

    const latest = res.data.record;
    latest[category].splice(index, 1);

    await updateBin(latest);
    alert("🗑️ Package deleted!");
    loadCatalogue();
  } catch (err) {
    alert("❌ Error deleting package: " + err.message);
  }
}

// Add new package
form.onsubmit = async (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value.toLowerCase();
  const title = document.getElementById("title").value;
  const price = parseInt(document.getElementById("price").value);
  const originalPrice = parseInt(document.getElementById("originalPrice").value);
  const keywords = document.getElementById("keywords").value.split(',').map(k => k.trim().toLowerCase());
  const includes = document.getElementById("includes").value.split(',').map(i => i.trim());
  const excludesRaw = document.getElementById("excludes").value;
  const excludes = excludesRaw ? excludesRaw.split(',').map(i => i.trim()) : undefined;

  const newItem = { title, price, originalPrice, keywords, includes };
  if (excludes) newItem.excludes = excludes;

  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });

    const latest = res.data.record;
    if (!latest[category]) latest[category] = [];
    latest[category].push(newItem);

    await updateBin(latest);
    alert("✅ New package added!");
    form.reset();
    loadCatalogue();
  } catch (err) {
    alert("❌ Error adding package: " + err.message);
  }
};

// Helper: Update entire bin
async function updateBin(updatedCatalogue) {
  await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, updatedCatalogue, {
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
      "X-Bin-Versioning": false
    }
  });
}

loadCatalogue();