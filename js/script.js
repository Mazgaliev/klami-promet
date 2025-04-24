// js/script.js
const products = [];
const pageSize = 8;
let currentPage = 1;

const searchInput       = document.getElementById('searchInput');
const categoryFilter    = document.getElementById('categoryFilter');
const tableBody         = document.querySelector('#productTable tbody');
const pagination        = document.getElementById('paginationContainer');

function populateCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value       = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function filterProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const cat  = categoryFilter.value;
  return products.filter(p => {
    const okTerm = p.name.toLowerCase().includes(term)
                || p.barcode.includes(term);
    const okCat  = !cat || p.category === cat;
    return okTerm && okCat;
  });
}

function renderTable(items) {
  tableBody.innerHTML = '';
  items.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.barcode}</td>
      <td>${p.name}</td>
      <td>MKD ${p.price.toFixed(0)}</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  pagination.innerHTML = '';

  const createPageItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement('li');
    li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href      = '#';
    a.innerHTML = label;
    a.addEventListener('click', e => {
      e.preventDefault();
      if (!disabled && page !== currentPage) {
        currentPage = page;
        updateDisplay();
      }
    });
    li.appendChild(a);
    return li;
  };

  // ← arrow
  pagination.appendChild(createPageItem('&laquo;', currentPage - 1, currentPage === 1));

  const maxVisiblePages = 5;
  const showEllipsis    = totalPages > maxVisiblePages;
  const startPage       = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisiblePages + 1));
  const endPage         = showEllipsis
                          ? Math.min(totalPages - 1, startPage + maxVisiblePages - 2)
                          : totalPages;

  for (let i = startPage; i <= endPage; i++) {
    pagination.appendChild(createPageItem(i, i, false, i === currentPage));
  }
  if (showEllipsis && endPage < totalPages - 1) {
    const ell = document.createElement('li');
    ell.className = 'page-item disabled';
    ell.innerHTML = `<span class="page-link">&hellip;</span>`;
    pagination.appendChild(ell);
  }
  if (showEllipsis && endPage < totalPages) {
    pagination.appendChild(createPageItem(totalPages, totalPages, false, totalPages === currentPage));
  }

  // → arrow
  pagination.appendChild(createPageItem('&raquo;', currentPage + 1, currentPage === totalPages));
}

function updateDisplay() {
  const filtered  = filterProducts();
  const start     = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  renderTable(pageItems);
  renderPagination(filtered.length);
}

async function init() {
  try {
    const resp = await fetch('../products.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    products.push(...data);
  } catch (err) {
    console.error('Failed to load products.json:', err);
    return;
  }

  populateCategories();
  updateDisplay();
  searchInput.addEventListener('input', () =>  { currentPage = 1; updateDisplay(); });
  categoryFilter.addEventListener('change', () => { currentPage = 1; updateDisplay(); });
}

document.addEventListener('DOMContentLoaded', init);
