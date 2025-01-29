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

  // Savings
  let savingsAccounts = [];
  let savingsContributions = [];

  // Chart variables
  let expensesChart;
  let categoryExpensesChart;

  // =======================
  // Utility Functions
  // =======================
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

    // Savings
    localStorage.setItem('savingsAccounts', JSON.stringify(savingsAccounts));
    localStorage.setItem('savingsContributions', JSON.stringify(savingsContributions));
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

    // Savings
    const savingsAccountsData = localStorage.getItem('savingsAccounts');
    const savingsContributionsData = localStorage.getItem('savingsContributions');

    if (billsData) bills = JSON.parse(billsData);
    if (incomeData) incomeEntries = JSON.parse(incomeData);
    if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
    if (balanceData) accountBalance = parseFloat(balanceData);
    if (accountNameData) accountName = accountNameData;
    if (startDateData) startDate = new Date(startDateData);
    if (projectionLengthData) projectionLength = parseInt(projectionLengthData);
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
    if (adjustmentsData) runningBudgetAdjustments = JSON.parse(adjustmentsData);

    if (savingsAccountsData) savingsAccounts = JSON.parse(savingsAccountsData);
    if (savingsContributionsData) savingsContributions = JSON.parse(savingsContributionsData);
  }

  // =======================
  // Initialization
  // =======================
  loadData();
  initializeStartDate();
  populateCategories();
  updateDisplay();
  setupCollapsible(); // For the collapsible savings table

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

    // 8. Render Savings Accounts Table
    renderSavingsAccountsTable();

    // 9. Populate contributions dropdown
    populateSavingsContributionsDropdown();

    // 10. Calculate total expenses for charts
    const expenseTotals = calculateTotalExpenses(); 
    renderExpensesCharts(expenseTotals);

    // 11. Calculate category expenses for charts
    const categoryTotals = calculateExpensesByCategory();
    renderCategoryCharts(categoryTotals);

    // 12. Calculate & Render Running Savings Balances
    renderRunningSavingsTable();
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

      // 3. Daily net (before savings contributions)
      let dailyNet = dailyIncome - dailyExpenses;

      // 4. Add scheduled savings contributions
      let dailySavingsOutflow = 0;
      savingsContributions.forEach((sc) => {
        if (isContributionOnDate(sc, currentDate)) {
          dailySavingsOutflow += sc.amount;
        }
      });

      dailyNet -= dailySavingsOutflow;
      currentBalance += dailyNet;

      // 5. Check for manual adjustments
      const adjustment = runningBudgetAdjustments.find(adj => {
        const adjDate = parseDateInput(adj.date);
        return adjDate.toDateString() === currentDate.toDateString();
      });

      // Build the base event description from actual items
      let eventDescription = getEventsForDate(currentDate);
      if (dailySavingsOutflow > 0) {
        eventDescription += (eventDescription ? ' + ' : '') + 'Savings Contributions';
      }

      // If we have an adjustment
      if (adjustment) {
        // Overwrite dailyNet/balance if there's an adjustment
        if (adjustment.amount !== undefined) {
          dailyNet = adjustment.amount;
          currentBalance =
            (runningTotals.length > 0 ? runningTotals[runningTotals.length - 1].balance : accountBalance) + dailyNet;
        }

        // Overwrite the event description if present
        if (adjustment.event) {
          eventDescription = adjustment.event;
        }
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
    const tableBody = document.getElementById('running-budget-table').getElementsByTagName('tbody')[0];
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
  // Render Savings Accounts Running Balances
  // =======================
  function renderRunningSavingsTable() {
    if (!startDate) return;
    const tableBody = document.getElementById('running-savings-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + projectionLength);

    const dailySavingsBalances = {};
    savingsAccounts.forEach(sa => {
      dailySavingsBalances[sa.name] = [];
    });

    const currentBalances = {};
    savingsAccounts.forEach(sa => {
      currentBalances[sa.name] = sa.balance;
    });

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Add any contributions that occur today
      savingsContributions.forEach(sc => {
        if (isContributionOnDate(sc, currentDate)) {
          currentBalances[sc.accountName] = (currentBalances[sc.accountName] || 0) + sc.amount;
        }
      });

      // Record daily info for each account
      savingsAccounts.forEach(sa => {
        let dailyContribution = 0;
        if (isContributionOnDateForAccount(sa.name, currentDate)) {
          const contribs = savingsContributions.filter(
            c => c.accountName === sa.name && isContributionOnDate(c, currentDate)
          );
          dailyContribution = contribs.reduce((acc, c) => acc + c.amount, 0);
        }

        dailySavingsBalances[sa.name].push({
          date: new Date(currentDate),
          contribution: dailyContribution,
          balance: currentBalances[sa.name]
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Flatten into table rows
    Object.keys(dailySavingsBalances).forEach(accountName => {
      dailySavingsBalances[accountName].forEach(record => {
        const row = tableBody.insertRow();
        const dateCell = row.insertCell(0);
        const accountCell = row.insertCell(1);
        const contributionCell = row.insertCell(2);
        const balanceCell = row.insertCell(3);
        const progressCell = row.insertCell(4);

        dateCell.textContent = formatRunningBudgetDate(record.date);
        accountCell.textContent = accountName;
        contributionCell.textContent = record.contribution > 0
          ? `+$${record.contribution.toFixed(2)}`
          : '$0.00';
        balanceCell.textContent = `$${record.balance.toFixed(2)}`;

        // Goal progress if set
        const sa = savingsAccounts.find(s => s.name === accountName);
        if (sa && sa.goal && sa.goal > 0) {
          const pct = (record.balance / sa.goal) * 100;
          const remain = sa.goal - record.balance;
          if (record.balance >= sa.goal) {
            progressCell.textContent = `100% (Goal Reached!)`;
          } else {
            progressCell.textContent = `${pct.toFixed(1)}% ($${remain.toFixed(2)} left)`;
          }
        } else {
          progressCell.textContent = '--';
        }

        // Conditional styling
        if (record.contribution > 0) {
          contributionCell.classList.add('positive-amount');
        } else {
          contributionCell.classList.add('neutral-amount');
        }

        if (record.balance > 100) {
          balanceCell.style.color = 'green';
        } else if (record.balance > 0) {
          balanceCell.style.color = 'orange';
        } else {
          balanceCell.style.color = 'red';
        }
      });
    });
  }

  // =======================
  // Collapsible Section
  // =======================
  function setupCollapsible() {
    const toggleHeader = document.getElementById('savings-balances-toggle');
    const caret = document.getElementById('savings-balances-caret');
    const content = document.getElementById('savings-balances-content');

    toggleHeader.addEventListener('click', function() {
      if (!content) return;
      if (content.style.display === 'block') {
        content.style.display = 'none';
        caret.classList.remove('down');
      } else {
        content.style.display = 'block';
        caret.classList.add('down');
      }
    });
  }

  // =======================
  // Helpers
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
        // NOTE: Matches day-of-month exactly
        return incomeStartDate.getDate() === date.getDate();
      case 'One-time':
        return incomeStartDate.toDateString() === date.toDateString();
      default:
        return false;
    }
  }

  function isBillOnDate(bill, date) {
    // NOTE: If bill.date=31 and month doesn't have 31, it will never match that month
    return bill.date === date.getDate();
  }

  function isAdhocExpenseOnDate(expense, date) {
    const expenseDate = parseDateInput(expense.date);
    return expenseDate.toDateString() === date.toDateString();
  }

  function isContributionOnDate(contribution, date) {
    const contribStartDate = parseDateInput(contribution.startDate);
    if (contribStartDate > date) return false;
    const diffTime = date - contribStartDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    switch (contribution.frequency) {
      case 'Weekly':
        return diffDays % 7 === 0;
      case 'Bi-weekly':
        return diffDays % 14 === 0;
      case 'Monthly':
        // NOTE: Matches day-of-month exactly
        return contribStartDate.getDate() === date.getDate();
      case 'One-time':
        return contribStartDate.toDateString() === date.toDateString();
      default:
        return false;
    }
  }

  function isContributionOnDateForAccount(accountName, date) {
    return savingsContributions.some(sc => {
      if (sc.accountName !== accountName) return false;
      return isContributionOnDate(sc, date);
    });
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
    const tableBody = document.getElementById('lowest-balances-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    const monthlyBalances = {};
    runningTotals.forEach((item) => {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      if (!monthlyBalances[monthKey] || item.balance < monthlyBalances[monthKey].balance) {
        monthlyBalances[monthKey] = {
          date: new Date(item.date),
          balance: item.balance,
        };
      }
    });

    // Sort by year-month
    const sortedMonths = Object.keys(monthlyBalances).sort((a, b) => new Date(a + '-1') - new Date(b + '-1'));
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
    const billsTableBody = document.getElementById('bills-list-table').getElementsByTagName('tbody')[0];
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
    const adhocExpensesTableBody = document.getElementById('adhoc-expenses-list-table').getElementsByTagName('tbody')[0];
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
    const incomeTableBody = document.getElementById('income-list-table').getElementsByTagName('tbody')[0];
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
  // Render Savings Accounts Table
  // =======================
  function renderSavingsAccountsTable() {
    const tableBody = document.getElementById('savings-accounts-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    savingsAccounts.forEach((sa, index) => {
      const row = tableBody.insertRow();
      row.insertCell(0).textContent = sa.name;
      row.insertCell(1).textContent = `$${sa.balance.toFixed(2)}`;

      const actionsCell = row.insertCell(2);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'savingsAccount';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'savingsAccount';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  function populateSavingsContributionsDropdown() {
    const savingsContributionSelect = document.getElementById('savings-contribution-account');
    savingsContributionSelect.innerHTML = '';
    savingsAccounts.forEach(sa => {
      const option = document.createElement('option');
      option.value = sa.name;
      option.textContent = sa.name;
      savingsContributionSelect.appendChild(option);
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
    const categoryLabels = Object.keys(categoryTotals);
    const categoryData = Object.values(categoryTotals);
    renderCategoryExpensesChart(categoryLabels, categoryData);
  }

  function calculateTotalExpenses() {
    let expenseTotals = {};
    bills.forEach((bill) => {
      const key = bill.name;
      const months = projectionLength;
      // Bill is repeated for each month
      const totalAmount = (expenseTotals[key] || 0) + bill.amount * months;
      expenseTotals[key] = totalAmount;
    });
    adhocExpenses.forEach((expense) => {
      const key = expense.name;
      // Adhoc expense is only once
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
            beginAtZero: true,
          },
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
            beginAtZero: true,
          },
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
        <input type="number" id="edit-bill-amount" step="0.01" required value="${bill.amount}" />

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
        <input type="number" id="edit-adhoc-expense-amount" step="0.01" required value="${expense.amount}" />

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
        <input type="number" id="edit-income-amount" step="0.01" required value="${income.amount}" />

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
        <input type="number" id="edit-running-budget-amount" step="0.01" required value="${entry.dailyNet}" />

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

    } else if (type === 'savingsAccount') {
      const sa = savingsAccounts[index];
      editModalTitle.textContent = 'Edit Savings Account';
      editForm.innerHTML = `
        <label for="edit-savings-account-name">Name:</label>
        <input type="text" id="edit-savings-account-name" required value="${sa.name}" />

        <label for="edit-savings-account-balance">Balance:</label>
        <input type="number" id="edit-savings-account-balance" step="0.01" required value="${sa.balance}" />

        <label for="edit-savings-account-goal">Goal (USD):</label>
        <input type="number" id="edit-savings-account-goal" step="0.01" placeholder="optional" value="${sa.goal || ''}" />

        <button type="submit">Update Savings Account</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function(e) {
        e.preventDefault();
        updateSavingsAccountEntry(index);
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
    const date = parseInt(document.getElementById('edit-bill-date').value);
    const amount = parseFloat(document.getElementById('edit-bill-amount').value);
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
    const amount = parseFloat(document.getElementById('edit-adhoc-expense-amount').value);
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
    const amount = parseFloat(document.getElementById('edit-income-amount').value);
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
    const amount = parseFloat(document.getElementById('edit-running-budget-amount').value);
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

  function updateSavingsAccountEntry(index) {
    const name = document.getElementById('edit-savings-account-name').value.trim();
    const balance = parseFloat(document.getElementById('edit-savings-account-balance').value);
    const goalVal = document.getElementById('edit-savings-account-goal').value;
    const goal = parseFloat(goalVal) || 0;

    if (isNaN(balance)) {
      alert('Please enter a valid balance.');
      return;
    }
    savingsAccounts[index].name = name;
    savingsAccounts[index].balance = balance;
    savingsAccounts[index].goal = goal > 0 ? goal : 0;
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
    } else if (type === 'savingsAccount') {
      const saName = savingsAccounts[index].name;
      savingsAccounts.splice(index, 1);
      // Remove contributions associated with this account
      savingsContributions = savingsContributions.filter(sc => sc.accountName !== saName);
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
    const date = parseInt(document.getElementById('bill-date').value);
    const amount = parseFloat(document.getElementById('bill-amount').value);
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
    const amount = parseFloat(document.getElementById('adhoc-expense-amount').value);
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
    const amount = parseFloat(document.getElementById('income-amount').value);
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
    const balance = parseFloat(document.getElementById('account-balance').value);
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
    projectionLength = parseInt(projectionLengthInput);
    saveData();
    updateDisplay();
  });

  // Savings Account Form
  const savingsAccountForm = document.getElementById('savings-account-form');
  savingsAccountForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('savings-account-name').value.trim();
    const balance = parseFloat(document.getElementById('savings-account-balance').value);
    const goalVal = document.getElementById('savings-account-goal').value;
    const goal = parseFloat(goalVal) || 0;

    if (isNaN(balance)) {
      alert('Please enter a valid initial balance.');
      return;
    }
    const newSA = { name, balance, goal: (goal > 0 ? goal : 0) };
    savingsAccounts.push(newSA);
    saveData();
    savingsAccountForm.reset();
    updateDisplay();
  });

  // Savings Contribution Form
  const savingsContributionForm = document.getElementById('savings-contribution-form');
  savingsContributionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const accountName = document.getElementById('savings-contribution-account').value;
    const amount = parseFloat(document.getElementById('savings-contribution-amount').value);
    const frequency = document.getElementById('savings-contribution-frequency').value;
    const dateStr = document.getElementById('savings-contribution-date').value;
    if (!dateStr || isNaN(amount)) {
      alert('Please enter valid inputs.');
      return;
    }
    const sc = { accountName, amount, frequency, startDate: dateStr };
    savingsContributions.push(sc);
    saveData();
    savingsContributionForm.reset();
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
      runningBudgetAdjustments,
      savingsAccounts,
      savingsContributions
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'budget_data.json');
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
      runningBudgetAdjustments,
      savingsAccounts,
      savingsContributions
    };
    const csvData = convertDataToCsv(data);
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'budget_data.csv');
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

    csvContent += '\nSavings Accounts\n';
    csvContent += 'Name,Balance,Goal\n';
    data.savingsAccounts.forEach(sa => {
      csvContent += `${sa.name},${sa.balance},${sa.goal || ''}\n`;
    });

    csvContent += '\nSavings Contributions\n';
    csvContent += 'AccountName,Amount,Frequency,StartDate\n';
    data.savingsContributions.forEach(sc => {
      csvContent += `${sc.accountName},${sc.amount},${sc.frequency},${sc.startDate}\n`;
    });

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
        savingsAccounts = data.savingsAccounts || [];
        savingsContributions = data.savingsContributions || [];

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
      savingsAccounts = [];
      savingsContributions = [];

      document.getElementById('bill-form').reset();
      document.getElementById('adhoc-expense-form').reset();
      document.getElementById('income-form').reset();
      document.getElementById('balance-form').reset();
      document.getElementById('start-date-form').reset();
      document.getElementById('edit-modal').style.display = 'none';

      if (document.getElementById('savings-account-form')) {
        document.getElementById('savings-account-form').reset();
      }
      if (document.getElementById('savings-contribution-form')) {
        document.getElementById('savings-contribution-form').reset();
      }

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
  // NOTE: This will automatically show instructions on page load:
  window.addEventListener('load', function () {
    instructionsModal.style.display = 'block';
  });

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
