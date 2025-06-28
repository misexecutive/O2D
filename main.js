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
