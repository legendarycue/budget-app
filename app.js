document.addEventListener('DOMContentLoaded', () => {
  // =======================
  // Global Data Variables
  // =======================
  let bills = [];
  let incomeEntries = [];
  let adhocExpenses = [];
  let accountBalance = 0; // Checking
  let accountName = '';
  let startDate = null;
  let projectionLength = 1; // Default to 1 month
  let categories = [];
  let runningBudgetAdjustments = [];

  // Chart variables
  let expensesChart;
  let categoryExpensesChart;

  // =======================
  // Utility: Basic parse with sanitization
  // =======================
  function parseMathExpression(rawValue) {
    let cleaned = rawValue.replace(/\$/g, '');
    cleaned = cleaned.replace(/[^0-9+\-*\\/().]/g, '');
    if (!cleaned) return 0;

    try {
      const result = new Function(`return (${cleaned});`)();
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Invalid expression');
      }
      return result;
    } catch {
      return parseFloat(rawValue) || 0;
    }
  }

  function parseDateInput(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // =======================
  // Custom Date Formatting
  // =======================
  // Running budget date: Two lines => e.g. "Mon\n1-25-25"
  function formatRunningBudgetDate(date) {
    const shortWeekday = date.toLocaleDateString('en-US', { weekday: 'short' }); 
    // e.g. "Mon"
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear().toString().slice(-2);
    // e.g. "1-25-25"

    return `${shortWeekday}\n${m}-${d}-${y}`;
  }

  // For the "Lowest Balances by Month" date: "Tue 1-28-25"
  function formatLowestBalanceDate(date) {
    const shortWeekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear().toString().slice(-2);

    return `${shortWeekday} ${m}-${d}-${y}`;
  }

  // Helper for unique file naming
  function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  // =======================
  // Local Storage
  // =======================
  function saveData() {
    const data = {
      bills,
      incomeEntries,
      adhocExpenses,
      accountBalance,
      accountName,
      startDate: startDate ? startDate.toISOString() : null,
      projectionLength,
      categories,
      runningBudgetAdjustments
    };
    localStorage.setItem('budgetAppData', JSON.stringify(data));
  }

  function loadData() {
    const stored = localStorage.getItem('budgetAppData');
    if (!stored) {
      categories = getDefaultCategories();
      return;
    }
    try {
      const data = JSON.parse(stored);
      bills = data.bills || [];
      incomeEntries = data.incomeEntries || [];
      adhocExpenses = data.adhocExpenses || [];
      accountBalance = data.accountBalance || 0;
      accountName = data.accountName || '';
      startDate = data.startDate ? new Date(data.startDate) : null;
      projectionLength = data.projectionLength || 1;
      categories = data.categories || getDefaultCategories();
      runningBudgetAdjustments = data.runningBudgetAdjustments || [];
    } catch (err) {
      // fallback if parse fails
      categories = getDefaultCategories();
    }
  }

  function getDefaultCategories() {
    return [
      "Charity/Donations",
      "Childcare",
      "Debt Payments",
      "Dining Out/Takeout",
      "Education",
      "Entertainment",
      "Healthcare",
      "Hobbies/Recreation",
      "Housing",
      "Insurance",
      "Personal Care",
      "Pets",
      "Savings/Investments",
      "Subscriptions/Memberships",
      "Transportation",
      "Travel",
      "Utilities",
      "Misc/Other"
    ];
  }

  // =======================
  // Initialization
  // =======================
  loadData();
  initializeStartDate();
  populateCategories();
  setupCollapsibleCards();
  updateDisplay();

  // =======================
  // Main Display
  // =======================
  function updateDisplay() {
    displayCheckingBalance();
    const runningTotals = calculateRunningTotals();
    displayLowestBalancesByMonth(runningTotals);
    renderRunningBudgetTable(runningTotals);

    renderBillsTable();
    renderAdhocExpensesTable();
    renderIncomeTable();

    // Charts
    const expenseTotals = calculateTotalExpenses();
    renderExpensesCharts(expenseTotals);

    const categoryTotals = calculateExpensesByCategory();
    renderCategoryCharts(categoryTotals);
  }

  function displayCheckingBalance() {
    let balanceEl = document.getElementById('balance-display');
    const text = accountName 
      ? `${accountName} (Checking) Balance: $${accountBalance.toFixed(2)}`
      : `Current Checking Balance: $${accountBalance.toFixed(2)}`;

    if (!balanceEl) {
      balanceEl = document.createElement('h3');
      balanceEl.id = 'balance-display';
      document.getElementById('display-area').prepend(balanceEl);
    }
    balanceEl.textContent = text;

    // Color coding
    if (accountBalance > 100) {
      balanceEl.style.color = 'green';
    } else if (accountBalance > 0) {
      balanceEl.style.color = 'orange';
    } else {
      balanceEl.style.color = 'red';
    }
  }

  // =======================
  // Calculate Running Totals
  // =======================
  function calculateRunningTotals() {
    if (!startDate) return [];
    let currentDate = new Date(startDate);
    let runningTotals = [];
    let currentBalance = accountBalance;

    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + projectionLength);

    while (currentDate <= endDate) {
      // incomes
      let dailyIncome = 0;
      incomeEntries.forEach((inc) => {
        if (isIncomeOnDate(inc, currentDate)) dailyIncome += inc.amount;
      });
      // bills/adhoc
      let dailyExpenses = 0;
      bills.forEach((b) => {
        if (isBillOnDate(b, currentDate)) dailyExpenses += b.amount;
      });
      adhocExpenses.forEach((a) => {
        if (isAdhocExpenseOnDate(a, currentDate)) dailyExpenses += a.amount;
      });

      let dailyNet = dailyIncome - dailyExpenses;
      let events = getEventsForDate(currentDate);

      // check adjustments
      const adj = runningBudgetAdjustments.find(ad => {
        const adDate = parseDateInput(ad.date);
        return adDate.toDateString() === currentDate.toDateString();
      });
      if (adj) {
        if (adj.amount !== undefined) {
          dailyNet = adj.amount;
          currentBalance = (runningTotals.length
            ? runningTotals[runningTotals.length - 1].balance
            : accountBalance
          ) + dailyNet;
        }
        if (adj.event) {
          events = adj.event;
        }
      } else {
        currentBalance += dailyNet;
      }

      runningTotals.push({
        date: new Date(currentDate),
        event: events,
        dailyNet,
        balance: currentBalance
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return runningTotals;
  }

  // =======================
  // Render Running Budget
  // =======================
  function renderRunningBudgetTable(runningTotals) {
    const tableBody = document
      .getElementById('running-budget-table')
      .getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    runningTotals.forEach((item, index) => {
      const row = tableBody.insertRow();
      
      // Date cell => formatted as multiline
      const dateCell = row.insertCell(0);
      dateCell.innerHTML = formatRunningBudgetDate(item.date).replace('\n', '<br/>');

      // Event cell
      row.insertCell(1).textContent = item.event || '---';

      // Debit/Credit cell
      const dcCell = row.insertCell(2);
      dcCell.textContent = `$${item.dailyNet.toFixed(2)}`;
      if (item.dailyNet > 0) {
        dcCell.classList.add('positive-amount');
      } else if (item.dailyNet === 0) {
        dcCell.classList.add('neutral-amount');
      } else {
        dcCell.classList.add('negative-amount');
      }

      // Balance cell
      const balCell = row.insertCell(3);
      balCell.textContent = `$${item.balance.toFixed(2)}`;
      if (item.balance > 100) {
        balCell.style.color = 'green';
      } else if (item.balance > 0) {
        balCell.style.color = 'orange';
      } else {
        balCell.style.color = 'red';
      }

      // Actions cell
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = `
        <svg width="20" height="20" fill="#007bff" aria-label="Edit entry">
          <use xlink:href="#edit-icon"></use>
        </svg>
      `;
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'runningBudget';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);
    });
  }

  // =======================
  // Lowest Balances
  // =======================
  function displayLowestBalancesByMonth(runningTotals) {
    const tbody = document
      .getElementById('lowest-balances-table')
      .getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    const monthlyTracker = {};
    runningTotals.forEach(rt => {
      const mKey = `${rt.date.getFullYear()}-${rt.date.getMonth() + 1}`;
      if (!monthlyTracker[mKey] || rt.balance < monthlyTracker[mKey].balance) {
        monthlyTracker[mKey] = {
          date: rt.date,
          balance: rt.balance
        };
      }
    });

    const sortedKeys = Object.keys(monthlyTracker).sort((a, b) => {
      return new Date(a + '-1') - new Date(b + '-1');
    });

    sortedKeys.forEach(key => {
      const row = tbody.insertRow();
      const entry = monthlyTracker[key];

      // e.g. "January 2025"
      const monthCell = row.insertCell(0);
      monthCell.textContent = entry.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      // e.g. "Tue 1-28-25"
      const dateCell = row.insertCell(1);
      dateCell.textContent = formatLowestBalanceDate(entry.date);

      // Balance cell
      const balCell = row.insertCell(2);
      balCell.textContent = `$${entry.balance.toFixed(2)}`;
      if (entry.balance > 100) {
        balCell.style.color = 'green';
      } else if (entry.balance > 0) {
        balCell.style.color = 'orange';
      } else {
        balCell.style.color = 'red';
      }
    });
  }

  // =======================
  // Table Renders
  // =======================
  function renderBillsTable() {
    const tbody = document.getElementById('bills-list-table').querySelector('tbody');
    tbody.innerHTML = '';

    bills.forEach((bill, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = bill.name;
      row.insertCell(1).textContent = bill.date;
      row.insertCell(2).textContent = `$${bill.amount.toFixed(2)}`;
      row.insertCell(3).textContent = bill.category;

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = `
        <svg width="20" height="20" fill="#007bff" aria-label="Edit bill">
          <use xlink:href="#edit-icon"></use>
        </svg>
      `;
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'bill';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = `
        <svg width="20" height="20" fill="#0056b3" aria-label="Delete bill">
          <use xlink:href="#delete-icon"></use>
        </svg>
      `;
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'bill';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  function renderAdhocExpensesTable() {
    const tbody = document.getElementById('adhoc-expenses-list-table').querySelector('tbody');
    tbody.innerHTML = '';

    adhocExpenses.forEach((exp, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = exp.name;
      row.insertCell(1).textContent = formatRunningBudgetDate(parseDateInput(exp.date)).replace('\n', ' ');
      row.insertCell(2).textContent = `$${exp.amount.toFixed(2)}`;
      row.insertCell(3).textContent = exp.category;

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = `
        <svg width="20" height="20" fill="#007bff" aria-label="Edit adhoc expense">
          <use xlink:href="#edit-icon"></use>
        </svg>
      `;
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'adhocExpense';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = `
        <svg width="20" height="20" fill="#0056b3" aria-label="Delete adhoc expense">
          <use xlink:href="#delete-icon"></use>
        </svg>
      `;
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'adhocExpense';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  function renderIncomeTable() {
    const tbody = document.getElementById('income-list-table').querySelector('tbody');
    tbody.innerHTML = '';

    incomeEntries.forEach((inc, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = inc.name;
      row.insertCell(1).textContent = `$${inc.amount.toFixed(2)}`;
      row.insertCell(2).textContent = inc.frequency;
      row.insertCell(3).textContent = formatRunningBudgetDate(parseDateInput(inc.startDate)).replace('\n', ' ');

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = `
        <svg width="20" height="20" fill="#007bff" aria-label="Edit income entry">
          <use xlink:href="#edit-icon"></use>
        </svg>
      `;
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'income';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = `
        <svg width="20" height="20" fill="#0056b3" aria-label="Delete income entry">
          <use xlink:href="#delete-icon"></use>
        </svg>
      `;
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'income';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Charting
  // =======================
  function renderExpensesCharts(expenseTotals) {
    const sorted = Object.entries(expenseTotals).sort((a,b) => b[1] - a[1]);
    const labels = sorted.map(x => x[0]);
    const data = sorted.map(x => x[1]);
    renderExpensesChart(labels, data);
  }

  function renderCategoryCharts(categoryTotals) {
    const sorted = Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]);
    const labels = sorted.map(x => x[0]);
    const data = sorted.map(x => x[1]);
    renderCategoryExpensesChart(labels, data);
  }

  function calculateTotalExpenses() {
    let totals = {};
    bills.forEach(b => {
      const months = projectionLength;
      totals[b.name] = (totals[b.name] || 0) + b.amount * months;
    });
    adhocExpenses.forEach(a => {
      totals[a.name] = (totals[a.name] || 0) + a.amount;
    });
    return totals;
  }

  function calculateExpensesByCategory() {
    let catTotals = {};
    bills.forEach(b => {
      const cat = b.category || 'Misc/Other';
      const months = projectionLength;
      catTotals[cat] = (catTotals[cat] || 0) + b.amount * months;
    });
    adhocExpenses.forEach(a => {
      const cat = a.category || 'Misc/Other';
      catTotals[cat] = (catTotals[cat] || 0) + a.amount;
    });
    return catTotals;
  }

  function renderExpensesChart(labels, data) {
    const canvas = document.getElementById('expenses-chart');
    if (!canvas) return;
    if (expensesChart) expensesChart.destroy();
    if (!data.length) return;

    const ctx = canvas.getContext('2d');
    const maxV = Math.max(...data);
    const minV = Math.min(...data);
    const colors = data.map(value => {
      const ratio = (value - minV) / (maxV - minV || 1);
      const green = Math.floor(255 * (1 - ratio));
      return `rgb(255, ${green}, 0)`;
    });

    expensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Expense Over Projection Period',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            type: 'logarithmic',
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderCategoryExpensesChart(labels, data) {
    const canvas = document.getElementById('category-expenses-chart');
    if (!canvas) return;
    if (categoryExpensesChart) categoryExpensesChart.destroy();
    if (!data.length) return;

    const ctx = canvas.getContext('2d');
    const colors = labels.map((_, idx) => `hsl(${(idx * 360) / labels.length}, 70%, 50%)`);

    categoryExpensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Expenses by Category',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // =======================
  // Edit Modal
  // =======================
  function openEditModal(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-modal-title');

    editForm.innerHTML = '';

    if (type === 'bill') {
      const b = bills[index];
      editTitle.textContent = 'Edit Bill/Expense';
      editForm.innerHTML = getEditBillForm(b);
      editForm.onsubmit = evt => {
        evt.preventDefault();
        updateBillEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-bill-category-btn').addEventListener('click', addCategory);

    } else if (type === 'adhocExpense') {
      const a = adhocExpenses[index];
      editTitle.textContent = 'Edit Adhoc Expense';
      editForm.innerHTML = getEditAdhocForm(a);
      editForm.onsubmit = evt => {
        evt.preventDefault();
        updateAdhocExpenseEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-adhoc-category-btn').addEventListener('click', addCategory);

    } else if (type === 'income') {
      const i = incomeEntries[index];
      editTitle.textContent = 'Edit Income';
      editForm.innerHTML = getEditIncomeForm(i);
      editForm.onsubmit = evt => {
        evt.preventDefault();
        updateIncomeEntry(index);
        editModal.style.display = 'none';
      };

    } else if (type === 'runningBudget') {
      const runTotals = calculateRunningTotals();
      const entry = runTotals[index];
      editTitle.textContent = 'Edit Running Budget Entry';
      editForm.innerHTML = getEditRunningBudgetForm(entry);
      editForm.onsubmit = evt => {
        evt.preventDefault();
        const oldDate = entry.date.toISOString().split('T')[0];
        updateRunningBudgetEntry(oldDate);
        editModal.style.display = 'none';
      };
    }

    editModal.style.display = 'block';
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
      editModal.style.display = 'none';
    });
  }

  function getEditBillForm(b) {
    return `
      <label for="edit-bill-name">Bill Name:</label>
      <input type="text" id="edit-bill-name" required value="${b.name}" />

      <label for="edit-bill-date">Day of Month (1-31):</label>
      <input type="number" id="edit-bill-date" min="1" max="31" required value="${b.date}" />

      <label for="edit-bill-amount">Amount (USD):</label>
      <input type="text" id="edit-bill-amount" required value="${b.amount}" />

      <label for="edit-bill-category">Category:</label>
      <div class="category-container">
        <select id="edit-bill-category">
          ${categories.map(cat => `<option value="${cat}" ${cat===b.category?'selected':''}>${cat}</option>`).join('')}
        </select>
        <button type="button" id="add-edit-bill-category-btn">Add Category</button>
      </div>

      <button type="submit">Update Bill</button>
      <button type="button" id="cancel-edit-btn">Cancel</button>
    `;
  }

  function getEditAdhocForm(a) {
    return `
      <label for="edit-adhoc-expense-name">Expense Name:</label>
      <input type="text" id="edit-adhoc-expense-name" required value="${a.name}" />

      <label for="edit-adhoc-expense-date">Date:</label>
      <input type="date" id="edit-adhoc-expense-date" required value="${a.date}" />

      <label for="edit-adhoc-expense-amount">Amount (USD):</label>
      <input type="text" id="edit-adhoc-expense-amount" required value="${a.amount}" />

      <label for="edit-adhoc-expense-category">Category:</label>
      <div class="category-container">
        <select id="edit-adhoc-expense-category">
          ${categories.map(cat => `<option value="${cat}" ${cat===a.category?'selected':''}>${cat}</option>`).join('')}
        </select>
        <button type="button" id="add-edit-adhoc-category-btn">Add Category</button>
      </div>

      <button type="submit">Update Expense</button>
      <button type="button" id="cancel-edit-btn">Cancel</button>
    `;
  }

  function getEditIncomeForm(i) {
    return `
      <label for="edit-income-name">Income Name:</label>
      <input type="text" id="edit-income-name" required value="${i.name}" />

      <label for="edit-income-amount">Amount per Paycheck:</label>
      <input type="text" id="edit-income-amount" required value="${i.amount}" />

      <label for="edit-income-frequency">Frequency:</label>
      <select id="edit-income-frequency">
        <option value="Weekly" ${i.frequency==='Weekly'?'selected':''}>Weekly</option>
        <option value="Bi-weekly" ${i.frequency==='Bi-weekly'?'selected':''}>Bi-weekly</option>
        <option value="Monthly" ${i.frequency==='Monthly'?'selected':''}>Monthly</option>
        <option value="One-time" ${i.frequency==='One-time'?'selected':''}>One-time</option>
      </select>

      <label for="edit-income-start-date">Start Date:</label>
      <input type="date" id="edit-income-start-date" required value="${i.startDate}" />

      <button type="submit">Update Income</button>
      <button type="button" id="cancel-edit-btn">Cancel</button>
    `;
  }

  function getEditRunningBudgetForm(e) {
    const iso = e.date.toISOString().split('T')[0];
    return `
      <label for="edit-running-budget-date">Date:</label>
      <input type="date" id="edit-running-budget-date" required value="${iso}" />

      <label for="edit-running-budget-amount">Debit/Credit Amount:</label>
      <input type="text" id="edit-running-budget-amount" required value="${e.dailyNet}" />

      <label for="edit-running-budget-event">Event/Bill:</label>
      <input type="text" id="edit-running-budget-event" value="${e.event}" />

      <button type="submit">Update Entry</button>
      <button type="button" id="cancel-edit-btn">Cancel</button>
    `;
  }

  // =======================
  // Update / Delete
  // =======================
  function updateBillEntry(index) {
    const name = document.getElementById('edit-bill-name').value.trim();
    const dateVal = parseInt(document.getElementById('edit-bill-date').value, 10);
    const amt = parseMathExpression(document.getElementById('edit-bill-amount').value);
    const cat = document.getElementById('edit-bill-category').value;
    if (dateVal < 1 || dateVal > 31) {
      alert('Invalid day (1-31).');
      return;
    }
    bills[index] = { name, date: dateVal, amount: amt, category: cat };
    saveData();
    updateDisplay();
  }

  function updateAdhocExpenseEntry(index) {
    const name = document.getElementById('edit-adhoc-expense-name').value.trim();
    const date = document.getElementById('edit-adhoc-expense-date').value;
    const amt = parseMathExpression(document.getElementById('edit-adhoc-expense-amount').value);
    const cat = document.getElementById('edit-adhoc-expense-category').value;
    adhocExpenses[index] = { name, date, amount: amt, category: cat };
    saveData();
    updateDisplay();
  }

  function updateIncomeEntry(index) {
    const name = document.getElementById('edit-income-name').value.trim();
    const amt = parseMathExpression(document.getElementById('edit-income-amount').value);
    const freq = document.getElementById('edit-income-frequency').value;
    const sDate = document.getElementById('edit-income-start-date').value;
    incomeEntries[index] = { name, amount: amt, frequency: freq, startDate: sDate };
    saveData();
    updateDisplay();
  }

  function updateRunningBudgetEntry(oldDate) {
    const newDate = document.getElementById('edit-running-budget-date').value;
    const amt = parseMathExpression(document.getElementById('edit-running-budget-amount').value);
    const ev = document.getElementById('edit-running-budget-event').value;

    const idx = runningBudgetAdjustments.findIndex(ad => ad.date === oldDate);
    const adjObj = { date: newDate, amount: amt, event: ev };
    if (idx >= 0) {
      runningBudgetAdjustments[idx] = adjObj;
    } else {
      runningBudgetAdjustments.push(adjObj);
    }
    saveData();
    updateDisplay();
  }

  function deleteEntry(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;

    if (type === 'bill') {
      bills.splice(index, 1);
    } else if (type === 'adhocExpense') {
      adhocExpenses.splice(index, 1);
    } else if (type === 'income') {
      incomeEntries.splice(index, 1);
    }
    saveData();
    updateDisplay();
  }

  // Close Edit Modal
  const closeEditModal = document.getElementById('close-edit-modal');
  closeEditModal.addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
  });

  // =======================
  // Form Submissions
  // =======================
  // Bills
  document.getElementById('bill-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const dateVal = parseInt(document.getElementById('bill-date').value, 10);
    const amt = parseMathExpression(document.getElementById('bill-amount').value);
    const cat = document.getElementById('bill-category').value;

    if (dateVal < 1 || dateVal > 31) {
      alert('Invalid day of month (1-31).');
      return;
    }
    bills.push({ name, date: dateVal, amount: amt, category: cat });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  // Adhoc
  document.getElementById('adhoc-expense-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('adhoc-expense-name').value.trim();
    const dateStr = document.getElementById('adhoc-expense-date').value;
    const amt = parseMathExpression(document.getElementById('adhoc-expense-amount').value);
    const cat = document.getElementById('adhoc-expense-category').value;

    adhocExpenses.push({ name, date: dateStr, amount: amt, category: cat });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  // Income
  document.getElementById('income-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('income-name').value.trim();
    const amt = parseMathExpression(document.getElementById('income-amount').value);
    const freq = document.getElementById('income-frequency').value;
    const sDate = document.getElementById('income-start-date').value;

    incomeEntries.push({ name, amount: amt, frequency: freq, startDate: sDate });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  // Checking
  document.getElementById('balance-form').addEventListener('submit', e => {
    e.preventDefault();
    accountName = document.getElementById('account-name').value.trim();
    const bal = parseMathExpression(document.getElementById('account-balance').value);
    if (isNaN(bal)) {
      alert('Invalid balance.');
      return;
    }
    accountBalance = bal;
    saveData();
    e.target.reset();
    updateDisplay();
  });

  // Start date
  document.getElementById('start-date-form').addEventListener('submit', e => {
    e.preventDefault();
    const sDate = document.getElementById('start-date-input').value;
    const projVal = parseInt(document.getElementById('projection-length').value, 10);
    if (!sDate) {
      alert('Invalid start date.');
      return;
    }
    startDate = parseDateInput(sDate);
    projectionLength = projVal;
    saveData();
    updateDisplay();
  });

  // =======================
  // Import/Export/Reset
  // =======================
  const exportBtn = document.getElementById('export-btn');
  exportBtn.addEventListener('click', e => {
    e.preventDefault();
    const data = {
      bills,
      incomeEntries,
      adhocExpenses,
      accountBalance,
      accountName,
      startDate: startDate ? startDate.toISOString() : '',
      projectionLength,
      categories,
      runningBudgetAdjustments
    };
    const str = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', str);
    link.setAttribute('download', `budget_data_${getCurrentDateTimeString()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  const exportCsvBtn = document.getElementById('export-csv-btn');
  exportCsvBtn.addEventListener('click', e => {
    e.preventDefault();
    const data = {
      bills,
      incomeEntries,
      adhocExpenses,
      accountBalance,
      accountName,
      startDate: startDate ? startDate.toISOString() : '',
      projectionLength,
      categories,
      runningBudgetAdjustments
    };
    const csvStr = convertDataToCsv(data);
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr);
    const a = document.createElement('a');
    a.setAttribute('href', csvData);
    a.setAttribute('download', `budget_data_${getCurrentDateTimeString()}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  function convertDataToCsv(d) {
    let out = 'Bills\nName,Date,Amount,Category\n';
    d.bills.forEach(b => {
      out += `${b.name},${b.date},${b.amount},${b.category}\n`;
    });
    out += '\nAdhoc Expenses\nName,Date,Amount,Category\n';
    d.adhocExpenses.forEach(a => {
      out += `${a.name},${a.date},${a.amount},${a.category}\n`;
    });
    out += '\nIncome Entries\nName,Amount,Frequency,Start Date\n';
    d.incomeEntries.forEach(i => {
      out += `${i.name},${i.amount},${i.frequency},${i.startDate}\n`;
    });
    out += '\nChecking Account\nAccount Name,Balance\n';
    out += `${d.accountName},${d.accountBalance}\n`;
    out += '\nStart Date and Projection Length\nStart Date,Projection Length\n';
    out += `${d.startDate},${d.projectionLength}\n`;
    return out;
  }

  const importFileInput = document.getElementById('import-file');
  const importBtn = document.getElementById('import-btn');
  importBtn.addEventListener('click', e => {
    e.preventDefault();
    importFileInput.click();
  });

  importFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        bills = data.bills || [];
        incomeEntries = data.incomeEntries || [];
        adhocExpenses = data.adhocExpenses || [];
        accountBalance = data.accountBalance || 0;
        accountName = data.accountName || '';
        startDate = data.startDate ? new Date(data.startDate) : null;
        projectionLength = data.projectionLength || 1;
        categories = data.categories || getDefaultCategories();
        runningBudgetAdjustments = data.runningBudgetAdjustments || [];
        saveData();
        populateCategories();
        initializeStartDate();
        updateDisplay();
        alert('Data imported successfully.');
      } catch {
        alert('Error importing data: Invalid file format.');
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });

  const resetBtn = document.getElementById('reset-btn');
  resetBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!confirm('Are you sure you want to reset all data?')) return;

    localStorage.removeItem('budgetAppData');
    bills = [];
    incomeEntries = [];
    adhocExpenses = [];
    accountBalance = 0;
    accountName = '';
    startDate = null;
    projectionLength = 1;
    categories = getDefaultCategories();
    runningBudgetAdjustments = [];

    document.getElementById('bill-form').reset();
    document.getElementById('adhoc-expense-form').reset();
    document.getElementById('income-form').reset();
    document.getElementById('balance-form').reset();
    document.getElementById('start-date-form').reset();
    document.getElementById('edit-modal').style.display = 'none';

    saveData();
    populateCategories();
    initializeStartDate();
    updateDisplay();
    alert('All data has been reset.');
  });

  // =======================
  // Instructions Modal
  // =======================
  const instructionsBtn = document.getElementById('instructions-btn');
  const instructionsModal = document.getElementById('instructions-modal');
  const closeModal = document.getElementById('close-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  instructionsBtn.addEventListener('click', e => {
    e.preventDefault();
    instructionsModal.style.display = 'block';
  });
  closeModal.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
  });
  closeModalBtn.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
  });
  window.addEventListener('click', evt => {
    if (evt.target === instructionsModal) {
      instructionsModal.style.display = 'none';
    }
  });
  window.addEventListener('load', () => {
    instructionsModal.style.display = 'block';
  });

  // =======================
  // Collapsible Cards
  // =======================
  function setupCollapsibleCards() {
    const collapsibleCards = document.querySelectorAll('.collapsible-card');
    collapsibleCards.forEach(card => {
      const header = card.querySelector('.card-header');
      const body = card.querySelector('.card-body');
      const toggleIcon = header.querySelector('.card-toggle');
      if (!header || !body) return;

      if (!card.classList.contains('expanded')) {
        body.classList.add('collapsed');
        toggleIcon.style.transform = 'none';
      } else {
        toggleIcon.style.transform = 'rotate(90deg)';
      }

      header.addEventListener('click', () => {
        if (body.classList.contains('collapsed')) {
          body.classList.remove('collapsed');
          card.classList.add('expanded');
          toggleIcon.style.transform = 'rotate(90deg)';
        } else {
          body.classList.add('collapsed');
          card.classList.remove('expanded');
          toggleIcon.style.transform = 'none';
        }
      });
    });

    document.getElementById('expand-cards-btn').addEventListener('click', e => {
      e.preventDefault();
      collapsibleCards.forEach(c => {
        c.classList.add('expanded');
        c.querySelector('.card-body').classList.remove('collapsed');
        c.querySelector('.card-toggle').style.transform = 'rotate(90deg)';
      });
    });

    document.getElementById('collapse-cards-btn').addEventListener('click', e => {
      e.preventDefault();
      collapsibleCards.forEach(c => {
        c.classList.remove('expanded');
        c.querySelector('.card-body').classList.add('collapsed');
        c.querySelector('.card-toggle').style.transform = 'none';
      });
    });
  }

  // =======================
  // Categories
  // =======================
  function populateCategories() {
    const adhocSelect = document.getElementById('adhoc-expense-category');
    const billSelect = document.getElementById('bill-category');
    const selects = [adhocSelect, billSelect];

    selects.forEach(sel => {
      if (sel) {
        sel.innerHTML = '';
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat;
          option.textContent = cat;
          sel.appendChild(option);
        });
      }
    });
  }

  // =======================
  // Initialize Start Date
  // =======================
  function initializeStartDate() {
    const sInput = document.getElementById('start-date-input');
    const projInput = document.getElementById('projection-length');
    if (startDate && sInput) {
      sInput.value = startDate.toISOString().split('T')[0];
    }
    if (projectionLength && projInput) {
      projInput.value = projectionLength;
    }
  }
});

/* 
 Inline SVG symbols for Edit/Delete icons
 Typically placed in index.html or served from a sprite
 We dynamically write them here for demonstration 
*/
document.write(`
<svg style="display:none">
  <symbol id="edit-icon" viewBox="0 0 512 512">
    <path d="M373.1 60.6c-4.7-4.7-11-7.6-17.7-7.6s-13 2.9-17.7 7.6L110.5 288.3c-2.6 2.6-4.5 5.7-5.5 9.2l-26.1 89.8c-2.2 7.4 4.8 14.4 12.2 12.2l89.8-26.1c3.5-1.1 6.6-2.9 9.2-5.5L451.4 155c4.7-4.7 7.6-11 7.6-17.7s-2.9-13-7.6-17.7L390.7 60.6z"/>
  </symbol>
  <symbol id="delete-icon" viewBox="0 0 448 512">
    <path d="M160 400C160 408.8 152.8 416 144 416C135.2 416 128 408.8 128 400V192C128 183.2 135.2 176 144 176C152.8 176 160 183.2 160 192V400zM256 192C256 183.2 263.2 176 272 176C280.8 176 288 183.2 288 192V400C288 408.8 280.8 416 272 416C263.2 416 256 408.8 256 400V192zM32 96C32 60.65 60.65 32 96 32H128 320 352C387.3 32 416 60.65 416 96V128C416 136.8 408.8 144 400 144C391.2 144 384 136.8 384 128V96C384 87.16 376.8 80 368 80H320 128 80C71.16 80 64 87.16 64 96V128C64 136.8 56.84 144 48 144C39.16 144 32 136.8 32 128V96zM53.21 467C50.05 489.9 68.63 512 91.84 512H356.2C379.4 512 398 489.9 394.8 467L368 160H80L53.21 467z"/>
  </symbol>
</svg>
`);
