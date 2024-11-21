document.addEventListener('DOMContentLoaded', function () {
    // Variables to store data
    let bills = [];
    let incomeEntries = [];
    let adhocExpenses = [];
    let accountBalance = 0;
    let accountName = '';
    let startDate = null;
    let projectionLength = 1; // Default to 1 month
    let selectedImportFile = null;
  
    // Function to parse date input and create a Date object without time zone shift
    function parseDateInput(dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
  
    // Function to save data to local storage
    function saveData() {
      localStorage.setItem('bills', JSON.stringify(bills));
      localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
      localStorage.setItem('adhocExpenses', JSON.stringify(adhocExpenses));
      localStorage.setItem('accountBalance', accountBalance);
      localStorage.setItem('accountName', accountName);
      localStorage.setItem('startDate', startDate ? startDate.toISOString() : null);
      localStorage.setItem('projectionLength', projectionLength);
    }
  
    // Function to load data from local storage
    function loadData() {
      const billsData = localStorage.getItem('bills');
      const incomeData = localStorage.getItem('incomeEntries');
      const adhocExpensesData = localStorage.getItem('adhocExpenses');
      const balanceData = localStorage.getItem('accountBalance');
      const accountNameData = localStorage.getItem('accountName');
      const startDateData = localStorage.getItem('startDate');
      const projectionLengthData = localStorage.getItem('projectionLength');
  
      if (billsData) bills = JSON.parse(billsData);
      if (incomeData) incomeEntries = JSON.parse(incomeData);
      if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
      if (balanceData) accountBalance = parseFloat(balanceData);
      if (accountNameData) accountName = accountNameData;
      if (startDateData) startDate = new Date(startDateData);
      if (projectionLengthData) projectionLength = parseInt(projectionLengthData);
    }
  
    // Load data when the app starts
    loadData();
    initializeStartDate();
    updateDisplay();
  
    // Function to initialize start date and projection length inputs
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
  
    // Function to update display
    function updateDisplay() {
      // Display Account Balance with Account Name
      const balanceDisplay = document.getElementById('balance-display');
      const balanceText = accountName
        ? `${accountName} Balance: $${accountBalance.toFixed(2)}`
        : `Current Balance: $${accountBalance.toFixed(2)}`;
      if (balanceDisplay) {
        balanceDisplay.textContent = balanceText;
      } else {
        // Create balance display element
        const balanceElement = document.createElement('h3');
        balanceElement.id = 'balance-display';
        balanceElement.textContent = balanceText;
        document.getElementById('display-area').prepend(balanceElement);
      }
  
      // Apply conditional formatting to account balance display
      const balanceDisplayElement = document.getElementById('balance-display');
      if (accountBalance > 100) {
        balanceDisplayElement.style.color = 'green';
      } else if (accountBalance > 0) {
        balanceDisplayElement.style.color = 'orange';
      } else {
        balanceDisplayElement.style.color = 'red';
      }
  
      // Calculate running totals
      const runningTotals = calculateRunningTotals();
  
      // Display the lowest balances by month
      displayLowestBalancesByMonth(runningTotals);
  
      // Display running totals (populate the table)
      const tableBody = document.getElementById('running-budget-table').getElementsByTagName('tbody')[0];
      tableBody.innerHTML = ''; // Clear existing rows
  
      runningTotals.forEach((item) => {
        const row = tableBody.insertRow();
        const dateCell = row.insertCell(0);
        const eventCell = row.insertCell(1);
        const debitCreditCell = row.insertCell(2);
        const balanceCell = row.insertCell(3);
  
        // Format the date
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        dateCell.textContent = item.date.toLocaleDateString('en-US', options);
  
        // Set row background color if income exists
        if (item.dailyIncome > 0) {
          row.style.backgroundColor = '#e6ffe6'; // Light pastel green
        }
  
        if (item.event) {
          eventCell.textContent = item.event;
        } else {
          eventCell.textContent = '---';
        }
  
        // Debit/Credit Cell
        debitCreditCell.textContent = `$${item.dailyNet.toFixed(2)}`;
  
        // Apply conditional formatting to Debit/Credit cell
        if (item.dailyNet > 0) {
          debitCreditCell.style.color = 'green';
        } else if (item.dailyNet === 0) {
          debitCreditCell.style.color = 'black';
        } else {
          debitCreditCell.style.color = 'red';
        }
  
        balanceCell.textContent = `$${item.balance.toFixed(2)}`;
  
        // Apply conditional formatting based on balance
        if (item.balance > 100) {
          balanceCell.style.color = 'green';
        } else if (item.balance > 0) {
          balanceCell.style.color = 'orange';
        } else {
          balanceCell.style.color = 'red';
        }
      });
  
      // Populate the bills list table
      const billsTableBody = document.getElementById('bills-list-table').getElementsByTagName('tbody')[0];
      billsTableBody.innerHTML = ''; // Clear existing rows
  
      bills.forEach((bill, index) => {
        const row = billsTableBody.insertRow();
        row.insertCell(0).textContent = bill.name;
        row.insertCell(1).textContent = bill.date;
        row.insertCell(2).textContent = `$${bill.amount.toFixed(2)}`;
        row.insertCell(3).textContent = bill.category;
  
        // Actions cell
        const actionsCell = row.insertCell(4);
        actionsCell.classList.add('actions-cell');
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.dataset.index = index;
        editBtn.addEventListener('click', editBillEntry);
        actionsCell.appendChild(editBtn);
  
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', deleteBillEntry);
        actionsCell.appendChild(deleteBtn);
      });
  
      // Populate the adhoc expenses list table
      const adhocExpensesTableBody = document.getElementById('adhoc-expenses-list-table').getElementsByTagName('tbody')[0];
      adhocExpensesTableBody.innerHTML = ''; // Clear existing rows
  
      adhocExpenses.forEach((expense, index) => {
        const row = adhocExpensesTableBody.insertRow();
        row.insertCell(0).textContent = expense.name;
        row.insertCell(1).textContent = new Date(expense.date).toLocaleDateString('en-US');
        row.insertCell(2).textContent = `$${expense.amount.toFixed(2)}`;
        row.insertCell(3).textContent = expense.category;
  
        // Actions cell
        const actionsCell = row.insertCell(4);
        actionsCell.classList.add('actions-cell');
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.dataset.index = index;
        editBtn.addEventListener('click', editAdhocExpense);
        actionsCell.appendChild(editBtn);
  
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', deleteAdhocExpense);
        actionsCell.appendChild(deleteBtn);
      });
  
      // Populate the income entries list table
      const incomeTableBody = document.getElementById('income-list-table').getElementsByTagName('tbody')[0];
      incomeTableBody.innerHTML = ''; // Clear existing rows
  
      incomeEntries.forEach((income, index) => {
        const row = incomeTableBody.insertRow();
        row.insertCell(0).textContent = income.name;
        row.insertCell(1).textContent = `$${income.amount.toFixed(2)}`;
        row.insertCell(2).textContent = income.frequency;
        row.insertCell(3).textContent = new Date(income.startDate).toLocaleDateString('en-US');
  
        // Actions cell
        const actionsCell = row.insertCell(4);
        actionsCell.classList.add('actions-cell');
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.dataset.index = index;
        editBtn.addEventListener('click', editIncomeEntry);
        actionsCell.appendChild(editBtn);
  
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', deleteIncomeEntry);
        actionsCell.appendChild(deleteBtn);
      });
  
      // Calculate and prepare data for the expenses chart
      const expenseTotals = calculateTotalExpenses();
  
      // Convert the expense totals object to an array and sort it
      const sortedExpenses = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1]);
  
      const expenseLabels = sortedExpenses.map((item) => item[0]);
      const expenseData = sortedExpenses.map((item) => item[1]);
  
      // Render the expenses bar chart
      renderExpensesChart(expenseLabels, expenseData);
  
      // Prepare data for expenses by category chart
      const categoryTotals = calculateExpensesByCategory();
  
      const categoryLabels = Object.keys(categoryTotals);
      const categoryData = Object.values(categoryTotals);
  
      // Render the expenses by category chart
      renderCategoryExpensesChart(categoryLabels, categoryData);
    }
  
    // Function to calculate running totals
    function calculateRunningTotals() {
      // Ensure startDate is set
      if (!startDate) {
        console.error('Start date is not set.');
        return [];
      }
  
      // Create a copy of the start date to avoid modifying the original
      let currentDate = new Date(startDate);
  
      // Initialize the running total array
      let runningTotals = [];
  
      // Initialize current balance
      let currentBalance = accountBalance;
  
      // Define the end date based on projection length
      let endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + projectionLength);
  
      // Loop through each day from start date to end date
      while (currentDate <= endDate) {
        // Calculate daily income
        let dailyIncome = 0;
        incomeEntries.forEach((income) => {
          if (isIncomeOnDate(income, currentDate)) {
            dailyIncome += income.amount;
          }
        });
  
        // Calculate daily expenses
        let dailyExpenses = 0;
  
        bills.forEach((bill) => {
          if (isBillOnDate(bill, currentDate)) {
            dailyExpenses += bill.amount;
          }
        });
  
        // Calculate adhoc expenses
        adhocExpenses.forEach((expense) => {
          if (isAdhocExpenseOnDate(expense, currentDate)) {
            dailyExpenses += expense.amount;
          }
        });
  
        // Adjust current balance
        currentBalance += dailyIncome - dailyExpenses;
  
        // Calculate daily net
        let dailyNet = dailyIncome - dailyExpenses;
  
        // Add to running totals
        runningTotals.push({
          date: new Date(currentDate), // Store a copy of the date
          event: getEventsForDate(currentDate),
          dailyNet: dailyNet,
          dailyIncome: dailyIncome,
          dailyExpenses: dailyExpenses,
          balance: currentBalance,
        });
  
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      return runningTotals;
    }
  
    // Helper function to determine if income occurs on a specific date
    function isIncomeOnDate(income, date) {
      const incomeStartDate = parseDateInput(income.startDate);
  
      // If income starts after the current date, return false
      if (incomeStartDate > date) {
        return false;
      }
  
      // Calculate the difference in days
      const diffTime = date - incomeStartDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      // Determine frequency
      switch (income.frequency) {
        case 'Weekly':
          return diffDays % 7 === 0;
        case 'Bi-weekly':
          return diffDays % 14 === 0;
        case 'Monthly':
          return incomeStartDate.getDate() === date.getDate();
        default:
          return false;
      }
    }
  
    // Helper function to determine if a bill occurs on a specific date
    function isBillOnDate(bill, date) {
      // Assuming bills recur monthly on the specified day
      return bill.date === date.getDate();
    }
  
    // Helper function to determine if an adhoc expense occurs on a specific date
    function isAdhocExpenseOnDate(expense, date) {
      // Compare the date of the expense to the current date
      const expenseDate = parseDateInput(expense.date);
      return expenseDate.toDateString() === date.toDateString();
    }
  
    // Helper function to get events for a specific date
    function getEventsForDate(date) {
      let events = [];
  
      // Check for bills on this date
      bills.forEach((bill) => {
        if (isBillOnDate(bill, date)) {
          events.push(bill.name);
        }
      });
  
      // Check for income on this date
      incomeEntries.forEach((income) => {
        if (isIncomeOnDate(income, date)) {
          events.push(income.name);
        }
      });
  
      // Check for adhoc expenses on this date
      adhocExpenses.forEach((expense) => {
        if (isAdhocExpenseOnDate(expense, date)) {
          events.push(expense.name);
        }
      });
  
      return events.join(' + ');
    }
  
    // Function to calculate total expenses over the projection period
    function calculateTotalExpenses() {
      let expenseTotals = {};
  
      bills.forEach((bill) => {
        const key = bill.name;
        const months = projectionLength;
  
        const totalAmount = (expenseTotals[key] || 0) + bill.amount * months;
        expenseTotals[key] = totalAmount;
      });
  
      // Include adhoc expenses
      adhocExpenses.forEach((expense) => {
        const key = expense.name;
        const totalAmount = (expenseTotals[key] || 0) + expense.amount;
        expenseTotals[key] = totalAmount;
      });
  
      return expenseTotals;
    }
  
    // Function to calculate expenses by category
    function calculateExpensesByCategory() {
      let categoryTotals = {};
  
      bills.forEach((bill) => {
        const category = bill.category || 'Misc/Other';
        const months = projectionLength;
        const totalAmount = (categoryTotals[category] || 0) + bill.amount * months;
        categoryTotals[category] = totalAmount;
      });
  
      // Include adhoc expenses with their categories
      adhocExpenses.forEach((expense) => {
        const category = expense.category || 'Misc/Other';
        const totalAmount = (categoryTotals[category] || 0) + expense.amount;
        categoryTotals[category] = totalAmount;
      });
  
      return categoryTotals;
    }
  
    // Function to render the expenses bar chart
    function renderExpensesChart(labels, data) {
      const canvasElement = document.getElementById('expenses-chart');
      if (!canvasElement) {
        console.error('Canvas element with id "expenses-chart" not found.');
        return;
      }
      const ctx = canvasElement.getContext('2d');
  
      // Destroy previous chart instance if it exists
      if (window.expensesChart) {
        window.expensesChart.destroy();
      }
  
      // Generate gradient colors for each bar
      const maxExpense = Math.max(...data);
      const minExpense = Math.min(...data);
      const colors = data.map((value) => {
        const ratio = (value - minExpense) / (maxExpense - minExpense || 1);
        const green = Math.floor(255 * (1 - ratio));
        return `rgb(255, ${green}, 0)`; // From red to yellow
      });
  
      // Create a new chart
      window.expensesChart = new Chart(ctx, {
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
  
    // Function to render the expenses by category chart
    function renderCategoryExpensesChart(labels, data) {
      const canvasElement = document.getElementById('category-expenses-chart');
      if (!canvasElement) {
        console.error('Canvas element with id "category-expenses-chart" not found.');
        return;
      }
      const ctx = canvasElement.getContext('2d');
  
      // Destroy previous chart instance if it exists
      if (window.categoryExpensesChart) {
        window.categoryExpensesChart.destroy();
      }
  
      // Generate colors for each bar
      const colors = labels.map((label, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);
  
      // Create a new chart
      window.categoryExpensesChart = new Chart(ctx, {
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
  
    // Function to display the lowest balances by month
    function displayLowestBalancesByMonth(runningTotals) {
      const tableBody = document.getElementById('lowest-balances-table').getElementsByTagName('tbody')[0];
      tableBody.innerHTML = ''; // Clear existing rows
  
      const monthlyBalances = {};
  
      runningTotals.forEach((item) => {
        const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`; // Format: YYYY-M
        if (!monthlyBalances[monthKey] || item.balance < monthlyBalances[monthKey].balance) {
          monthlyBalances[monthKey] = {
            date: new Date(item.date),
            balance: item.balance,
          };
        }
      });
  
      // Sort the months chronologically
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
  
        // Apply conditional formatting to balance
        if (entry.balance > 100) {
          balanceCell.style.color = 'green';
        } else if (entry.balance > 0) {
          balanceCell.style.color = 'orange';
        } else {
          balanceCell.style.color = 'red';
        }
      });
    }
  
    // Function to edit a bill entry
    function editBillEntry(event) {
      const index = event.target.dataset.index;
      const bill = bills[index];
  
      // Pre-fill the bill form with the existing data
      document.getElementById('bill-name').value = bill.name;
      document.getElementById('bill-date').value = bill.date;
      document.getElementById('bill-amount').value = bill.amount;
      document.getElementById('bill-category').value = bill.category;
      document.getElementById('bill-index').value = index; // Set the index
  
      // Optionally, change the submit button text to "Update Bill"
      document.querySelector('#bill-form button[type="submit"]').textContent = 'Update Bill';
    }
  
    // Function to delete a bill entry
    function deleteBillEntry(event) {
      const index = event.target.dataset.index;
  
      // Remove the bill entry
      bills.splice(index, 1);
  
      // Save data and update display
      saveData();
      updateDisplay();
    }
  
    // Function to edit an adhoc expense entry
    function editAdhocExpense(event) {
      const index = event.target.dataset.index;
      const expense = adhocExpenses[index];
  
      // Pre-fill the adhoc expense form with the existing data
      document.getElementById('adhoc-expense-name').value = expense.name;
      document.getElementById('adhoc-expense-date').value = expense.date;
      document.getElementById('adhoc-expense-amount').value = expense.amount;
      document.getElementById('adhoc-expense-category').value = expense.category;
      document.getElementById('adhoc-expense-index').value = index; // Set the index
  
      // Optionally, change the submit button text to "Update Adhoc Expense"
      document.querySelector('#adhoc-expense-form button[type="submit"]').textContent = 'Update Adhoc Expense';
    }
  
    // Function to delete an adhoc expense entry
    function deleteAdhocExpense(event) {
      const index = event.target.dataset.index;
  
      // Remove the adhoc expense entry
      adhocExpenses.splice(index, 1);
  
      // Save data and update display
      saveData();
      updateDisplay();
    }
  
    // Function to edit an income entry
    function editIncomeEntry(event) {
      const index = event.target.dataset.index;
      const income = incomeEntries[index];
  
      // Pre-fill the income form with the existing data
      document.getElementById('income-name').value = income.name;
      document.getElementById('income-amount').value = income.amount;
      document.getElementById('income-frequency').value = income.frequency;
      document.getElementById('income-start-date').value = income.startDate;
      document.getElementById('income-index').value = index; // Set the index
  
      // Optionally, change the submit button text to "Update Income"
      document.querySelector('#income-form button[type="submit"]').textContent = 'Update Income';
    }
  
    // Function to delete an income entry
    function deleteIncomeEntry(event) {
      const index = event.target.dataset.index;
  
      // Remove the income entry
      incomeEntries.splice(index, 1);
  
      // Save data and update display
      saveData();
      updateDisplay();
    }
  
    // Handling Bills Form Submission
    const billForm = document.getElementById('bill-form');
    billForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Get form values
      const name = document.getElementById('bill-name').value;
      const date = parseInt(document.getElementById('bill-date').value);
      const amount = parseFloat(document.getElementById('bill-amount').value);
      const category = document.getElementById('bill-category').value;
      const index = document.getElementById('bill-index').value;
  
      // Create bill object
      const bill = {
        name,
        date,
        amount,
        category,
      };
  
      if (index === '') {
        // Add new bill
        bills.push(bill);
      } else {
        // Update existing bill
        bills[parseInt(index)] = bill;
  
        // Reset the index and submit button text
        document.getElementById('bill-index').value = '';
        document.querySelector('#bill-form button[type="submit"]').textContent = 'Add Bill';
      }
  
      // Save data
      saveData();
  
      // Reset form
      billForm.reset();
  
      // Update display
      updateDisplay();
    });
  
    // Handling Adhoc Expense Form Submission
    const adhocExpenseForm = document.getElementById('adhoc-expense-form');
    adhocExpenseForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Get form values
      const name = document.getElementById('adhoc-expense-name').value;
      const dateInput = document.getElementById('adhoc-expense-date').value;
      const amount = parseFloat(document.getElementById('adhoc-expense-amount').value);
      const category = document.getElementById('adhoc-expense-category').value;
      const index = document.getElementById('adhoc-expense-index').value;
  
      // Create adhoc expense object
      const expense = {
        name,
        date: dateInput,
        amount,
        category,
      };
  
      if (index === '') {
        // Add new adhoc expense
        adhocExpenses.push(expense);
      } else {
        // Update existing adhoc expense
        adhocExpenses[parseInt(index)] = expense;
  
        // Reset the index and submit button text
        document.getElementById('adhoc-expense-index').value = '';
        document.querySelector('#adhoc-expense-form button[type="submit"]').textContent = 'Add Adhoc Expense';
      }
  
      // Save data
      saveData();
  
      // Reset form
      adhocExpenseForm.reset();
  
      // Update display
      updateDisplay();
    });
  
    // Handling Income Form Submission
    const incomeForm = document.getElementById('income-form');
    incomeForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Get form values
      const name = document.getElementById('income-name').value;
      const amount = parseFloat(document.getElementById('income-amount').value);
      const frequency = document.getElementById('income-frequency').value;
      const startDateInput = document.getElementById('income-start-date').value;
      const index = document.getElementById('income-index').value;
  
      // Create income object
      const income = {
        name,
        amount,
        frequency,
        startDate: startDateInput,
      };
  
      if (index === '') {
        // Add new income
        incomeEntries.push(income);
      } else {
        // Update existing income
        incomeEntries[parseInt(index)] = income;
  
        // Reset the index and submit button text
        document.getElementById('income-index').value = '';
        document.querySelector('#income-form button[type="submit"]').textContent = 'Add Income';
      }
  
      // Save data
      saveData();
  
      // Reset form
      incomeForm.reset();
  
      // Update display
      updateDisplay();
    });
  
    // Handling Balance Form Submission
    const balanceForm = document.getElementById('balance-form');
    balanceForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Get form values
      accountName = document.getElementById('account-name').value;
      const balance = parseFloat(document.getElementById('account-balance').value);
  
      // Store the account name and balance
      accountBalance = balance;
  
      // Save data
      saveData();
  
      // Reset form
      balanceForm.reset();
  
      // Update display
      updateDisplay();
    });
  
    // Handling Start Date Form Submission
    const startDateForm = document.getElementById('start-date-form');
    startDateForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Get the selected start date and projection length
      const startDateInput = document.getElementById('start-date-input').value;
      const projectionLengthInput = document.getElementById('projection-length').value;
  
      startDate = parseDateInput(startDateInput);
      projectionLength = parseInt(projectionLengthInput);
  
      // Save data
      saveData();
  
      // Update display
      updateDisplay();
    });
  
    // Handling Data Export
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', function () {
      const data = {
        bills: bills,
        incomeEntries: incomeEntries,
        adhocExpenses: adhocExpenses,
        accountBalance: accountBalance,
        accountName: accountName,
        startDate: startDate ? startDate.toISOString() : null,
        projectionLength: projectionLength,
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', 'budget_data.json');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  
    // Handling Data Import
    const importFileInput = document.getElementById('import-file');
    const importBtn = document.getElementById('import-btn');
  
    // Store the selected file
    importFileInput.addEventListener('change', function (event) {
      selectedImportFile = event.target.files[0];
    });
  
    // Handle Import Button Click
    importBtn.addEventListener('click', function () {
      if (!selectedImportFile) {
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
          saveData();
          initializeStartDate();
          updateDisplay();
          alert('Data imported successfully.');
        } catch (error) {
          alert('Error importing data: Invalid file format.');
        }
      };
      reader.readAsText(selectedImportFile);
  
      // Reset selected file
      selectedImportFile = null;
      importFileInput.value = '';
    });
  
    // Handling Reset Button Click
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', function () {
      // Confirm before resetting
      if (confirm('Are you sure you want to reset all data?')) {
        // Clear local storage
        localStorage.clear();
  
        // Reset variables
        bills = [];
        incomeEntries = [];
        adhocExpenses = [];
        accountBalance = 0;
        accountName = '';
        startDate = null;
        projectionLength = 1;
        selectedImportFile = null;
        importFileInput.value = '';
  
        // Reset forms
        document.getElementById('bill-form').reset();
        document.getElementById('income-form').reset();
        document.getElementById('balance-form').reset();
        document.getElementById('start-date-form').reset();
        document.getElementById('adhoc-expense-form').reset();
        document.getElementById('bill-index').value = '';
        document.getElementById('income-index').value = '';
        document.getElementById('adhoc-expense-index').value = '';
  
        // Reset button texts
        document.querySelector('#bill-form button[type="submit"]').textContent = 'Add Bill';
        document.querySelector('#income-form button[type="submit"]').textContent = 'Add Income';
        document.querySelector('#adhoc-expense-form button[type="submit"]').textContent = 'Add Adhoc Expense';
  
        // Update display
        initializeStartDate();
        updateDisplay();
      }
    });
  
    // Handling Instructions Modal
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModal = document.getElementById('close-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
  
    // Open the modal when the Instructions button is clicked
    instructionsBtn.addEventListener('click', function () {
      instructionsModal.style.display = 'block';
    });
  
    // Close the modal when the 'X' is clicked
    closeModal.addEventListener('click', function () {
      instructionsModal.style.display = 'none';
    });
  
    // Close the modal when the Continue button is clicked
    closeModalBtn.addEventListener('click', function () {
      instructionsModal.style.display = 'none';
    });
  
    // Close the modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
      if (event.target === instructionsModal) {
        instructionsModal.style.display = 'none';
      }
    });
  
    // Show the modal on initial load
    window.addEventListener('load', function () {
      instructionsModal.style.display = 'block';
    });
  });
  