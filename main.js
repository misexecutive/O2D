const API_URL = 'https://script.google.com/macros/s/AKfycbwqjDas0fZC6hdHeqhC-r6oucuPtQx4f4X0W9YdoluTwZL6DoO7v9cC2p-w-eyYrwIc-g/exec';

let ordersData = [];

document.addEventListener('DOMContentLoaded', () => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  fetchOrders();
});

function updateCurrentTime() {
  document.getElementById('currentTime').textContent = new Date().toLocaleString();
}

function showSuccessNotification(message) {
  const note = document.getElementById('successNotification');
  const msg = document.getElementById('successMessage');
  msg.textContent = message;
  note.classList.remove('hidden');
  setTimeout(() => note.classList.add('hidden'), 3000);
}

function renderOrders() {
  const container = document.getElementById('ordersContainer');
  container.innerHTML = '';

  if (!ordersData || ordersData.length === 0) {
    showNoData();
    return;
  }

  ordersData.forEach((order, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded shadow';
    card.innerHTML = `
      <h3 class="text-lg font-bold mb-2">${order.dealerName}</h3>
      <p><strong>Location:</strong> ${order.location}</p>
      <p><strong>Marketing Person:</strong> ${order.marketingPersonName}</p>
      <p><strong>CRM:</strong> ${order.crmName}</p>
      <p><strong>Concerned Owner:</strong> ${order.concernedOwner}</p>
      <p><a href="${order.fileUploadLink}" target="_blank" class="text-blue-500 underline">View File</a></p>
      <p class="text-xs text-gray-500 mt-2">Timestamp: ${new Date(order.timestamp).toLocaleString()}</p>
    `;
    container.appendChild(card);
  });

  container.classList.remove('hidden');
  document.getElementById('noDataContainer').classList.add('hidden');
}

async function fetchOrders() {
  showLoading(true);
  const crm = new URLSearchParams(location.search).get('crm');
  if (!crm) return alert('CRM name missing');

  try {
    const res = await fetch(`${API_URL}?action=getPendingOrders&crm=${encodeURIComponent(crm)}`);
    const result = await res.json();
    ordersData = result.data || [];
    renderOrders();
  } catch (err) {
    console.error(err);
    showNoData();
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  document.getElementById('loadingContainer').classList.toggle('hidden', !show);
  document.getElementById('ordersContainer').classList.toggle('hidden', show);
  document.getElementById('noDataContainer').classList.add('hidden');
}

function showNoData() {
  document.getElementById('loadingContainer').classList.add('hidden');
  document.getElementById('ordersContainer').classList.add('hidden');
  document.getElementById('noDataContainer').classList.remove('hidden');
}

function refreshData() {
  document.getElementById('refreshIcon').classList.add('animate-spin');
  fetchOrders().finally(() => {
    setTimeout(() => document.getElementById('refreshIcon').classList.remove('animate-spin'), 500);
  });
}

// Add similar modularized functions: createOrderCard(), toggleCreditStatus(), promptStockStatus(), submitStockStatus(), approveOrder()
// and modal handling similar to above
// Each of those should use the POST body like:
// { action: 'updateCreditStatus', timestamp: '...', creditStatus: 'Yes' }

async function sendPost(action, payload) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await res.json();
    if (result.status !== 'success') throw new Error(result.message);
    return result;
  } catch (error) {
    console.error(`Error in ${action}:`, error);
    throw error;
  }
}
