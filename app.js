document.addEventListener('DOMContentLoaded', function () {
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

  // Helper to get current date/time as YYYYMMDD_HHMMSS
  function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    // e.g. 20250128_153045
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  // =======================
  // Utility Functions
  // =======================
  // Allows simple math expressions (with or without $) for amounts
  function parseMathExpression(rawValue) {
    // Remove $ symbols
    let cleaned = rawValue.replace(/\$/g, '');
    // Remove non-valid characters (digits/operators/decimal points/etc.)
    cleaned = cleaned.replace(/[^0-9+\-*\\/().]/g, '');
    if (!cleaned) {
      return 0;
    }
    try {
      const result = new Function(`return (${cleaned});`)();
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Invalid expression');
      }
      return result;
    } catch (err) {
      console.warn('Failed to parse math expression:', rawValue);
      return parseFloat(rawValue) || 0;
    }
  }

  function parseDateInput(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatRunningBudgetDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function saveData() {
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
    localStorage.setItem('adhocExpenses', JSON.stringify(adhocExpenses));
    localStorage.setItem('accountBalance', accountBalance);
    localStorage.setItem('accountName', accountName);
    localStorage.setItem('startDate', startDate ? startDate.toISOString() : null);
    localStorage.setItem('projectionLength', projectionLength);
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('runningBudgetAdjustments', JSON.stringify(runningBudgetAdjustments));
  }

  function loadData() {
    const billsData = localStorage.getItem('bills');
    const incomeData = localStorage.getItem('incomeEntries');
    const adhocExpensesData = localStorage.getItem('adhocExpenses');
    const balanceData = localStorage.getItem('accountBalance');
    const accountNameData = localStorage.getItem('accountName');
    const startDateData = localStorage.getItem('startDate');
    const projectionLengthData = localStorage.getItem('projectionLength');
    const categoriesData = localStorage.getItem('categories');
    const adjustmentsData = localStorage.getItem('runningBudgetAdjustments');

    if (billsData) bills = JSON.parse(billsData);
    if (incomeData) incomeEntries = JSON.parse(incomeData);
    if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
    if (balanceData) accountBalance = parseFloat(balanceData);
    if (accountNameData) accountName = accountNameData;
    if (startDateData) startDate = new Date(startDateData);
    if (projectionLengthData) projectionLength = parseInt(projectionLengthData, 10);
    if (categoriesData) {
      categories = JSON.parse(categoriesData);
    } else {
      categories = [
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
      saveData();
    }
    if (adjustmentsData) {
      runningBudgetAdjustments = JSON.parse(adjustmentsData);
    }
  }

  // Initialize data from local storage
  loadData();
  initializeStartDate();
  populateCategories();
  setupCollapsibleCards(); 
  updateDisplay();

  // =======================
  // Main Display Update
  // =======================
  function updateDisplay() {
    // 1. Display Checking Account
    displayCheckingBalance();

    // 2. Calculate running totals (Checking)
    const runningTotals = calculateRunningTotals();

    // 3. Display lowest balances by month
    displayLowestBalancesByMonth(runningTotals);

    // 4. Render the Running Budget (Checking) table
    renderRunningBudgetTable(runningTotals);

    // 5. Render Bills Table
    renderBillsTable();

    // 6. Render Adhoc Expenses Table
    renderAdhocExpensesTable();

    // 7. Render Income Table
    renderIncomeTable();

    // 8. Calculate total expenses for charts
    const expenseTotals = calculateTotalExpenses();
    renderExpensesCharts(expenseTotals);

    // 9. Calculate category expenses for charts
    const categoryTotals = calculateExpensesByCategory();
    renderCategoryCharts(categoryTotals);
  }

  // =======================
  // Checking Account
  // =======================
  function displayCheckingBalance() {
    const balanceDisplay = document.getElementById('balance-display');
    const balanceText = accountName
      ? `${accountName} (Checking) Balance: $${accountBalance.toFixed(2)}`
      : `Current Checking Balance: $${accountBalance.toFixed(2)}`;

    if (balanceDisplay) {
      balanceDisplay.textContent = balanceText;
    } else {
      // Create balance display element if it doesn't exist
      const balanceElement = document.createElement('h3');
      balanceElement.id = 'balance-display';
      balanceElement.textContent = balanceText;
      document.getElementById('display-area').prepend(balanceElement);
    }

    // Conditional formatting for Checking balance
    const balanceDisplayElement = document.getElementById('balance-display');
    if (accountBalance > 100) {
      balanceDisplayElement.style.color = 'green';
    } else if (accountBalance > 0) {
      balanceDisplayElement.style.color = 'orange';
    } else {
      balanceDisplayElement.style.color = 'red';
    }
  }

  // =======================
  // Calculate Running Totals (Checking)
  // =======================
  function calculateRunningTotals() {
    if (!startDate) {
      console.error('Start date is not set.');
      return [];
    }

    let currentDate = new Date(startDate);
    let runningTotals = [];
    let currentBalance = accountBalance;

    // Define the end date
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + projectionLength);

    // Loop day by day
    while (currentDate <= endDate) {
      // 1. Daily income
      let dailyIncome = 0;
      incomeEntries.forEach((income) => {
        if (isIncomeOnDate(income, currentDate)) {
          dailyIncome += income.amount;
        }
      });

      // 2. Daily expenses (bills + adhoc)
      let dailyExpenses = 0;
      bills.forEach((bill) => {
        if (isBillOnDate(bill, currentDate)) {
          dailyExpenses += bill.amount;
        }
      });
      adhocExpenses.forEach((expense) => {
        if (isAdhocExpenseOnDate(expense, currentDate)) {
          dailyExpenses += expense.amount;
        }
      });

      // 3. Daily net
      let dailyNet = dailyIncome - dailyExpenses;

      // 4. Check for manual adjustments
      const adjustment = runningBudgetAdjustments.find(adj => {
        const adjDate = parseDateInput(adj.date);
        return adjDate.toDateString() === currentDate.toDateString();
      });

      // Build the base event description from actual items
      let eventDescription = getEventsForDate(currentDate);

      // If we have an adjustment, override the dailyNet/balance as needed
      if (adjustment) {
        if (adjustment.amount !== undefined) {
          dailyNet = adjustment.amount;
          currentBalance =
            (runningTotals.length > 0 ? runningTotals[runningTotals.length - 1].balance : accountBalance) + dailyNet;
        }
        if (adjustment.event) {
          eventDescription = adjustment.event;
        }
      } else {
        currentBalance += dailyNet;
      }

      runningTotals.push({
        date: new Date(currentDate),
        event: eventDescription,
        dailyNet: dailyNet,
        balance: currentBalance
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return runningTotals;
  }

  // =======================
  // Render Running Budget (Checking) Table
  // =======================
  function renderRunningBudgetTable(runningTotals) {
    const tableBody = document
      .getElementById('running-budget-table')
      .getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    runningTotals.forEach((item, index) => {
      const row = tableBody.insertRow();

      const dateCell = row.insertCell(0);
      const eventCell = row.insertCell(1);
      const debitCreditCell = row.insertCell(2);
      const balanceCell = row.insertCell(3);
      const actionsCell = row.insertCell(4);

      dateCell.textContent = formatRunningBudgetDate(item.date);
      eventCell.textContent = item.event || '---';
      debitCreditCell.textContent = `$${item.dailyNet.toFixed(2)}`;
      balanceCell.textContent = `$${item.balance.toFixed(2)}`;

      // Conditional formatting on dailyNet
      if (item.dailyNet > 0) {
        debitCreditCell.classList.add('positive-amount');
      } else if (item.dailyNet === 0) {
        debitCreditCell.classList.add('neutral-amount');
      } else {
        debitCreditCell.classList.add('negative-amount');
      }

      // Conditional formatting on balance
      if (item.balance > 100) {
        balanceCell.style.color = 'green';
      } else if (item.balance > 0) {
        balanceCell.style.color = 'orange';
      } else {
        balanceCell.style.color = 'red';
      }

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'runningBudget';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);
    });
  }

  // =======================
  // Helpers for Date Matching
  // =======================
  function isIncomeOnDate(income, date) {
    const incomeStartDate = parseDateInput(income.startDate);
    if (incomeStartDate > date) return false;
    const diffTime = date - incomeStartDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    switch (income.frequency) {
      case 'Weekly':
        return diffDays % 7 === 0;
      case 'Bi-weekly':
        return diffDays % 14 === 0;
      case 'Monthly':
        // Matches day-of-month exactly
        return incomeStartDate.getDate() === date.getDate();
      case 'One-time':
        return incomeStartDate.toDateString() === date.toDateString();
      default:
        return false;
    }
  }

  function isBillOnDate(bill, date) {
    return bill.date === date.getDate();
  }

  function isAdhocExpenseOnDate(expense, date) {
    const expenseDate = parseDateInput(expense.date);
    return expenseDate.toDateString() === date.toDateString();
  }

  function getEventsForDate(date) {
    let events = [];

    bills.forEach((bill) => {
      if (isBillOnDate(bill, date)) {
        events.push(bill.name);
      }
    });

    incomeEntries.forEach((income) => {
      if (isIncomeOnDate(income, date)) {
        events.push(income.name);
      }
    });

    adhocExpenses.forEach((expense) => {
      if (isAdhocExpenseOnDate(expense, date)) {
        events.push(expense.name);
      }
    });

    return events.join(' + ');
  }

  // =======================
  // Lowest Balances By Month
  // =======================
  function displayLowestBalancesByMonth(runningTotals) {
    const tableBody = document
      .getElementById('lowest-balances-table')
      .getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    const monthlyBalances = {};
    runningTotals.forEach((item) => {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      if (!monthlyBalances[monthKey] || item.balance < monthlyBalances[monthKey].balance) {
        monthlyBalances[monthKey] = {
          date: new Date(item.date),
          balance: item.balance
        };
      }
    });

    // Sort by year-month
    const sortedMonths = Object.keys(monthlyBalances).sort(
      (a, b) => new Date(a + '-1') - new Date(b + '-1')
    );
    sortedMonths.forEach((monthKey) => {
      const entry = monthlyBalances[monthKey];
      const row = tableBody.insertRow();

      const monthCell = row.insertCell(0);
      const dateCell = row.insertCell(1);
      const balanceCell = row.insertCell(2);

      const monthName = entry.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      monthCell.textContent = monthName;

      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateCell.textContent = entry.date.toLocaleDateString('en-US', dateOptions);

      balanceCell.textContent = `$${entry.balance.toFixed(2)}`;

      if (entry.balance > 100) {
        balanceCell.style.color = 'green';
      } else if (entry.balance > 0) {
        balanceCell.style.color = 'orange';
      } else {
        balanceCell.style.color = 'red';
      }
    });
  }

  // =======================
  // Render Bills Table
  // =======================
  function renderBillsTable() {
    const billsTableBody = document
      .getElementById('bills-list-table')
      .getElementsByTagName('tbody')[0];
    billsTableBody.innerHTML = '';

    bills.forEach((bill, index) => {
      const row = billsTableBody.insertRow();
      row.insertCell(0).textContent = bill.name;
      row.insertCell(1).textContent = bill.date;
      row.insertCell(2).textContent = `$${bill.amount.toFixed(2)}`;
      row.insertCell(3).textContent = bill.category;

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'bill';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'bill';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Render Adhoc Expenses Table
  // =======================
  function renderAdhocExpensesTable() {
    const adhocExpensesTableBody = document
      .getElementById('adhoc-expenses-list-table')
      .getElementsByTagName('tbody')[0];
    adhocExpensesTableBody.innerHTML = '';

    adhocExpenses.forEach((expense, index) => {
      const row = adhocExpensesTableBody.insertRow();
      row.insertCell(0).textContent = expense.name;
      row.insertCell(1).textContent = formatRunningBudgetDate(parseDateInput(expense.date));
      row.insertCell(2).textContent = `$${expense.amount.toFixed(2)}`;
      row.insertCell(3).textContent = expense.category;

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'adhocExpense';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'adhocExpense';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Render Income Table
  // =======================
  function renderIncomeTable() {
    const incomeTableBody = document
      .getElementById('income-list-table')
      .getElementsByTagName('tbody')[0];
    incomeTableBody.innerHTML = '';

    incomeEntries.forEach((income, index) => {
      const row = incomeTableBody.insertRow();
      row.insertCell(0).textContent = income.name;
      row.insertCell(1).textContent = `$${income.amount.toFixed(2)}`;
      row.insertCell(2).textContent = income.frequency;
      row.insertCell(3).textContent = formatRunningBudgetDate(parseDateInput(income.startDate));

      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'income';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'income';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Charts
  // =======================
  function renderExpensesCharts(expenseTotals) {
    const sortedExpenses = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1]);
    const expenseLabels = sortedExpenses.map((item) => item[0]);
    const expenseData = sortedExpenses.map((item) => item[1]);
    renderExpensesChart(expenseLabels, expenseData);
  }

  function renderCategoryCharts(categoryTotals) {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const categoryLabels = sorted.map(x => x[0]);
    const categoryData = sorted.map(x => x[1]);
    renderCategoryExpensesChart(categoryLabels, categoryData);
  }

  function calculateTotalExpenses() {
    let expenseTotals = {};
    bills.forEach((bill) => {
      const key = bill.name;
      const months = projectionLength;
      // Bill repeats each month
      const totalAmount = (expenseTotals[key] || 0) + bill.amount * months;
      expenseTotals[key] = totalAmount;
    });
    adhocExpenses.forEach((expense) => {
      const key = expense.name;
      const totalAmount = (expenseTotals[key] || 0) + expense.amount;
      expenseTotals[key] = totalAmount;
    });
    return expenseTotals;
  }

  function calculateExpensesByCategory() {
    let categoryTotals = {};
    bills.forEach((bill) => {
      const category = bill.category || 'Misc/Other';
      const months = projectionLength;
      const totalAmount = (categoryTotals[category] || 0) + bill.amount * months;
      categoryTotals[category] = totalAmount;
    });
    adhocExpenses.forEach((expense) => {
      const category = expense.category || 'Misc/Other';
      const totalAmount = (categoryTotals[category] || 0) + expense.amount;
      categoryTotals[category] = totalAmount;
    });
    return categoryTotals;
  }

  function renderExpensesChart(labels, data) {
    const canvasElement = document.getElementById('expenses-chart');
    if (!canvasElement) {
      console.error('Canvas element with id "expenses-chart" not found.');
      return;
    }
    const ctx = canvasElement.getContext('2d');
    if (expensesChart) expensesChart.destroy();
    if (data.length === 0) {
      console.warn('No data available for expenses chart.');
      return;
    }
    const maxExpense = Math.max(...data);
    const minExpense = Math.min(...data);
    const colors = data.map((value) => {
      const ratio = (value - minExpense) / (maxExpense - minExpense || 1);
      const green = Math.floor(255 * (1 - ratio));
      return `rgb(255, ${green}, 0)`;
    });
    expensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Expense Over Projection Period',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            type: 'logarithmic', // Use log scale
            beginAtZero: true
          }
        },
      },
    });
  }

  function renderCategoryExpensesChart(labels, data) {
    const canvasElement = document.getElementById('category-expenses-chart');
    if (!canvasElement) {
      console.error('Canvas element with id "category-expenses-chart" not found.');
      return;
    }
    const ctx = canvasElement.getContext('2d');
    if (categoryExpensesChart) categoryExpensesChart.destroy();
    if (data.length === 0) {
      console.warn('No data available for category expenses chart.');
      return;
    }
    const colors = labels.map((label, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);
    categoryExpensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Expenses by Category',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
      },
    });
  }

  // =======================
  // Edit Modal
  // =======================
  function openEditModal(event) {
    const index = event.target.dataset.index;
    const type = event.target.dataset.type;
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editModalTitle = document.getElementById('edit-modal-title');

    editForm.innerHTML = '';

    if (type === 'bill') {
      const bill = bills[index];
      editModalTitle.textContent = 'Edit Bill/Expense';
      editForm.innerHTML = `
        <label for="edit-bill-name">Bill Name:</label>
        <input type="text" id="edit-bill-name" required value="${bill.name}" />

        <label for="edit-bill-date">Day of Month (1-31):</label>
        <input type="number" id="edit-bill-date" min="1" max="31" required value="${bill.date}" />

        <label for="edit-bill-amount">Amount (USD):</label>
        <input type="text" id="edit-bill-amount" required value="${bill.amount}" />

        <label for="edit-bill-category">Category:</label>
        <div class="category-container">
          <select id="edit-bill-category">
            ${categories.map(cat => `<option value="${cat}" ${cat === bill.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          <button type="button" id="add-edit-bill-category-btn">Add Category</button>
        </div>

        <button type="submit">Update Bill</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateBillEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-bill-category-btn').addEventListener('click', addCategory);

    } else if (type === 'adhocExpense') {
      const expense = adhocExpenses[index];
      editModalTitle.textContent = 'Edit Adhoc Expense';
      editForm.innerHTML = `
        <label for="edit-adhoc-expense-name">Expense Name:</label>
        <input type="text" id="edit-adhoc-expense-name" required value="${expense.name}" />

        <label for="edit-adhoc-expense-date">Date:</label>
        <input type="date" id="edit-adhoc-expense-date" required value="${expense.date}" />

        <label for="edit-adhoc-expense-amount">Amount (USD):</label>
        <input type="text" id="edit-adhoc-expense-amount" required value="${expense.amount}" />

        <label for="edit-adhoc-expense-category">Category:</label>
        <div class="category-container">
          <select id="edit-adhoc-expense-category">
            ${categories.map(cat => `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          <button type="button" id="add-edit-adhoc-category-btn">Add Category</button>
        </div>

        <button type="submit">Update Expense</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateAdhocExpenseEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-adhoc-category-btn').addEventListener('click', addCategory);

    } else if (type === 'income') {
      const income = incomeEntries[index];
      editModalTitle.textContent = 'Edit Income';
      editForm.innerHTML = `
        <label for="edit-income-name">Income Name:</label>
        <input type="text" id="edit-income-name" required value="${income.name}" />

        <label for="edit-income-amount">Amount per Paycheck:</label>
        <input type="text" id="edit-income-amount" required value="${income.amount}" />

        <label for="edit-income-frequency">Frequency:</label>
        <select id="edit-income-frequency">
          <option value="Weekly" ${income.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
          <option value="Bi-weekly" ${income.frequency === 'Bi-weekly' ? 'selected' : ''}>Bi-weekly</option>
          <option value="Monthly" ${income.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
          <option value="One-time" ${income.frequency === 'One-time' ? 'selected' : ''}>One-time</option>
        </select>

        <label for="edit-income-start-date">Start Date:</label>
        <input type="date" id="edit-income-start-date" required value="${income.startDate}" />

        <button type="submit">Update Income</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateIncomeEntry(index);
        editModal.style.display = 'none';
      };

    } else if (type === 'runningBudget') {
      const runningTotals = calculateRunningTotals();
      const entry = runningTotals[index];
      editModalTitle.textContent = 'Edit Running Budget Entry';
      editForm.innerHTML = `
        <label for="edit-running-budget-date">Date:</label>
        <input type="date" id="edit-running-budget-date" required value="${entry.date.toISOString().split('T')[0]}" />

        <label for="edit-running-budget-amount">Debit/Credit Amount:</label>
        <input type="text" id="edit-running-budget-amount" required value="${entry.dailyNet}" />

        <label for="edit-running-budget-event">Event/Bill:</label>
        <input type="text" id="edit-running-budget-event" value="${entry.event}" />

        <button type="submit">Update Entry</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        const oldDate = entry.date.toISOString().split('T')[0];
        updateRunningBudgetEntry(oldDate);
        editModal.style.display = 'none';
      };
    }

    editModal.style.display = 'block';
    document.getElementById('cancel-edit-btn').addEventListener('click', function () {
      editModal.style.display = 'none';
    });
  }

  // =======================
  // Update / Delete Entry Functions
  // =======================
  function updateBillEntry(index) {
    const name = document.getElementById('edit-bill-name').value.trim();
    const date = parseInt(document.getElementById('edit-bill-date').value, 10);
    const amount = parseMathExpression(document.getElementById('edit-bill-amount').value);
    const category = document.getElementById('edit-bill-category').value;
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    bills[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }

  function updateAdhocExpenseEntry(index) {
    const name = document.getElementById('edit-adhoc-expense-name').value.trim();
    const date = document.getElementById('edit-adhoc-expense-date').value;
    const amount = parseMathExpression(document.getElementById('edit-adhoc-expense-amount').value);
    const category = document.getElementById('edit-adhoc-expense-category').value;
    if (!date) {
      alert('Please enter a valid date.');
      return;
    }
    adhocExpenses[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }

  function updateIncomeEntry(index) {
    const name = document.getElementById('edit-income-name').value.trim();
    const amount = parseMathExpression(document.getElementById('edit-income-amount').value);
    const frequency = document.getElementById('edit-income-frequency').value;
    const startDate = document.getElementById('edit-income-start-date').value;
    if (!startDate) {
      alert('Please enter a valid start date.');
      return;
    }
    incomeEntries[index] = { name, amount, frequency, startDate };
    saveData();
    updateDisplay();
  }

  function updateRunningBudgetEntry(oldDate) {
    const newDate = document.getElementById('edit-running-budget-date').value;
    const amount = parseMathExpression(document.getElementById('edit-running-budget-amount').value);
    const event = document.getElementById('edit-running-budget-event').value;

    const adjIndex = runningBudgetAdjustments.findIndex(adj => adj.date === oldDate);
    const adjustment = { date: newDate, amount, event };

    if (adjIndex >= 0) {
      runningBudgetAdjustments[adjIndex] = adjustment;
    } else {
      runningBudgetAdjustments.push(adjustment);
    }
    saveData();
    updateDisplay();
  }

  function deleteEntry(event) {
    const index = event.target.dataset.index;
    const type = event.target.dataset.type;

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
  closeEditModal.addEventListener('click', function () {
    document.getElementById('edit-modal').style.display = 'none';
  });

  // =======================
  // Form Submissions
  // =======================
  // Bills
  const billForm = document.getElementById('bill-form');
  billForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const date = parseInt(document.getElementById('bill-date').value, 10);
    const amount = parseMathExpression(document.getElementById('bill-amount').value);
    const category = document.getElementById('bill-category').value;
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    const bill = { name, date, amount, category };
    bills.push(bill);
    saveData();
    billForm.reset();
    updateDisplay();
  });

  // Adhoc Expense
  const adhocExpenseForm = document.getElementById('adhoc-expense-form');
  adhocExpenseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('adhoc-expense-name').value.trim();
    const dateInput = document.getElementById('adhoc-expense-date').value;
    const amount = parseMathExpression(document.getElementById('adhoc-expense-amount').value);
    const category = document.getElementById('adhoc-expense-category').value;
    if (!dateInput) {
      alert('Please enter a valid date.');
      return;
    }
    const expense = { name, date: dateInput, amount, category };
    adhocExpenses.push(expense);
    saveData();
    adhocExpenseForm.reset();
    updateDisplay();
  });

  // Income
  const incomeForm = document.getElementById('income-form');
  incomeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('income-name').value.trim();
    const amount = parseMathExpression(document.getElementById('income-amount').value);
    const frequency = document.getElementById('income-frequency').value;
    const startDateInput = document.getElementById('income-start-date').value;
    if (!startDateInput) {
      alert('Please enter a valid start date.');
      return;
    }
    const income = { name, amount, frequency, startDate: startDateInput };
    incomeEntries.push(income);
    saveData();
    incomeForm.reset();
    updateDisplay();
  });

  // Checking Account Balance
  const balanceForm = document.getElementById('balance-form');
  balanceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    accountName = document.getElementById('account-name').value.trim();
    const balance = parseMathExpression(document.getElementById('account-balance').value);
    if (isNaN(balance)) {
      alert('Please enter a valid balance.');
      return;
    }
    accountBalance = balance;
    saveData();
    balanceForm.reset();
    updateDisplay();
  });

  // Start Date & Projection
  const startDateForm = document.getElementById('start-date-form');
  startDateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const startDateInput = document.getElementById('start-date-input').value;
    const projectionLengthInput = document.getElementById('projection-length').value;
    if (!startDateInput) {
      alert('Please enter a valid start date.');
      return;
    }
    startDate = parseDateInput(startDateInput);
    projectionLength = parseInt(projectionLengthInput, 10);
    saveData();
    updateDisplay();
  });

  // =======================
  // Local Storage Import/Export/Reset
  // =======================
  const exportBtn = document.getElementById('export-btn');
  exportBtn.addEventListener('click', function (e) {
    e.preventDefault();
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
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    const fileName = `budget_data_${getCurrentDateTimeString()}.json`;
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  const exportCsvBtn = document.getElementById('export-csv-btn');
  exportCsvBtn.addEventListener('click', function (e) {
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
    const csvData = convertDataToCsv(data);
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
    const downloadAnchorNode = document.createElement('a');
    const fileName = `budget_data_${getCurrentDateTimeString()}.csv`;
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  function convertDataToCsv(data) {
    let csvContent = '';

    csvContent += 'Bills\n';
    csvContent += 'Name,Date,Amount,Category\n';
    data.bills.forEach(bill => {
      csvContent += `${bill.name},${bill.date},${bill.amount},${bill.category}\n`;
    });

    csvContent += '\nAdhoc Expenses\n';
    csvContent += 'Name,Date,Amount,Category\n';
    data.adhocExpenses.forEach(expense => {
      csvContent += `${expense.name},${expense.date},${expense.amount},${expense.category}\n`;
    });

    csvContent += '\nIncome Entries\n';
    csvContent += 'Name,Amount,Frequency,Start Date\n';
    data.incomeEntries.forEach(income => {
      csvContent += `${income.name},${income.amount},${income.frequency},${income.startDate}\n`;
    });

    csvContent += '\nChecking Account\n';
    csvContent += 'Account Name,Balance\n';
    csvContent += `${data.accountName},${data.accountBalance}\n`;

    csvContent += '\nStart Date and Projection Length\n';
    csvContent += `Start Date,Projection Length\n`;
    csvContent += `${data.startDate},${data.projectionLength}\n`;

    return csvContent;
  }

  const importFileInput = document.getElementById('import-file');
  const importBtn = document.getElementById('import-btn');
  importBtn.addEventListener('click', function (e) {
    e.preventDefault();
    importFileInput.click();
  });
  importFileInput.addEventListener('change', function (event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      alert('Please select a file to import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        bills = data.bills || [];
        incomeEntries = data.incomeEntries || [];
        adhocExpenses = data.adhocExpenses || [];
        accountBalance = data.accountBalance || 0;
        accountName = data.accountName || '';
        startDate = data.startDate ? new Date(data.startDate) : null;
        projectionLength = data.projectionLength || 1;
        categories = data.categories || [
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
        runningBudgetAdjustments = data.runningBudgetAdjustments || [];

        saveData();
        populateCategories();
        initializeStartDate();
        updateDisplay();
        alert('Data imported successfully.');
      } catch (error) {
        alert('Error importing data: Invalid file format.');
      }
    };
    reader.readAsText(selectedFile);
    importFileInput.value = '';
  });

  const resetBtn = document.getElementById('reset-btn');
  resetBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm('Are you sure you want to reset all data?')) {
      localStorage.clear();
      bills = [];
      incomeEntries = [];
      adhocExpenses = [];
      accountBalance = 0;
      accountName = '';
      startDate = null;
      projectionLength = 1;
      categories = [
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
    }
  });

  // =======================
  // Instructions Modal
  // =======================
  const instructionsBtn = document.getElementById('instructions-btn');
  const instructionsModal = document.getElementById('instructions-modal');
  const closeModal = document.getElementById('close-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  instructionsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    instructionsModal.style.display = 'block';
  });
  closeModal.addEventListener('click', function () {
    instructionsModal.style.display = 'none';
  });
  closeModalBtn.addEventListener('click', function () {
    instructionsModal.style.display = 'none';
  });
  window.addEventListener('click', function (event) {
    if (event.target === instructionsModal) {
      instructionsModal.style.display = 'none';
    }
  });
  // NOTE: Show instructions on page load:
  window.addEventListener('load', function () {
    instructionsModal.style.display = 'block';
  });

  // =======================
  // Collapsible Cards
  // =======================
  function setupCollapsibleCards() {
    const collapsibleCards = document.querySelectorAll('.collapsible-card');
    collapsibleCards.forEach(card => {
      const header = card.querySelector('.card-header');
      const cardBody = card.querySelector('.card-body');
      const toggleIcon = header.querySelector('.card-toggle');

      if (header && cardBody) {
        if (!card.classList.contains('expanded')) {
          cardBody.classList.add('collapsed');
          toggleIcon.style.transform = 'none';
        } else {
          toggleIcon.style.transform = 'rotate(90deg)';
        }

        header.addEventListener('click', () => {
          if (cardBody.classList.contains('collapsed')) {
            cardBody.classList.remove('collapsed');
            card.classList.add('expanded');
            toggleIcon.style.transform = 'rotate(90deg)';
          } else {
            cardBody.classList.add('collapsed');
            card.classList.remove('expanded');
            toggleIcon.style.transform = 'none';
          }
        });
      }
    });

    // For Expand Cards / Collapse Cards
    const expandCardsBtn = document.getElementById('expand-cards-btn');
    const collapseCardsBtn = document.getElementById('collapse-cards-btn');

    if (expandCardsBtn) {
      expandCardsBtn.addEventListener('click', e => {
        e.preventDefault();
        collapsibleCards.forEach(card => {
          card.classList.add('expanded');
          const body = card.querySelector('.card-body');
          const toggleIcon = card.querySelector('.card-toggle');
          if (body) {
            body.classList.remove('collapsed');
          }
          if (toggleIcon) {
            toggleIcon.style.transform = 'rotate(90deg)';
          }
        });
      });
    }

    if (collapseCardsBtn) {
      collapseCardsBtn.addEventListener('click', e => {
        e.preventDefault();
        collapsibleCards.forEach(card => {
          card.classList.remove('expanded');
          const body = card.querySelector('.card-body');
          const toggleIcon = card.querySelector('.card-toggle');
          if (body) {
            body.classList.add('collapsed');
          }
          if (toggleIcon) {
            toggleIcon.style.transform = 'none';
          }
        });
      });
    }
  }

  // =======================
  // Categories
  // =======================
  function populateCategories() {
    const adhocCategorySelect = document.getElementById('adhoc-expense-category');
    const billCategorySelect = document.getElementById('bill-category');
    const selects = [adhocCategorySelect, billCategorySelect];
    selects.forEach(select => {
      if (select) {
        select.innerHTML = '';
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          select.appendChild(option);
        });
      }
    });
  }

  const addAdhocCategoryBtn = document.getElementById('add-adhoc-category-btn');
  addAdhocCategoryBtn.addEventListener('click', addCategory);
  const addBillCategoryBtn = document.getElementById('add-bill-category-btn');
  addBillCategoryBtn.addEventListener('click', addCategory);

  function addCategory() {
    const newCategory = prompt('Enter new category:');
    if (newCategory && newCategory.trim()) {
      const trimmedCategory = newCategory.trim();
      if (!categories.includes(trimmedCategory)) {
        categories.push(trimmedCategory);
        populateCategories();
        saveData();
        alert(`Category "${trimmedCategory}" added successfully.`);
      } else {
        alert('This category already exists.');
      }
    } else {
      alert('Category name cannot be empty.');
    }
  }

  // =======================
  // Initialize Start Date
  // =======================
  function initializeStartDate() {
    const startDateInput = document.getElementById('start-date-input');
    const projectionLengthInput = document.getElementById('projection-length');
    if (startDate && startDateInput) {
      startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (projectionLength && projectionLengthInput) {
      projectionLengthInput.value = projectionLength;
    }
  }
});
