document.addEventListener('DOMContentLoaded', function () {
    // Variables to store data
    let bills = [];
    let incomeEntries = [];
    let adhocExpenses = [];
    let accountBalance = 0;
    let accountName = '';
    let startDate = null;
    let projectionLength = 1; // Default to 1 month
    let categories = [];
    let runningBudgetAdjustments = [];

    // Chart variables declared at the correct scope
    let expensesChart;
    let categoryExpensesChart;
    let categoryExpensesPieChart;

    // Function to parse date input correctly
    function parseDateInput(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    // Function to format date as "Wed. Dec 20, 2024"
    function formatRunningBudgetDate(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('runningBudgetAdjustments', JSON.stringify(runningBudgetAdjustments));
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
        const categoriesData = localStorage.getItem('categories');
        const adjustmentsData = localStorage.getItem('runningBudgetAdjustments');

        if (billsData) bills = JSON.parse(billsData);
        if (incomeData) incomeEntries = JSON.parse(incomeData);
        if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
        if (balanceData) accountBalance = parseFloat(balanceData);
        if (accountNameData) accountName = accountNameData;
        if (startDateData) startDate = new Date(startDateData);
        if (projectionLengthData) projectionLength = parseInt(projectionLengthData);
        if (categoriesData) categories = JSON.parse(categoriesData);
        else {
            // Initialize with default categories
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
    }

    // Load data when the app starts
    loadData();
    initializeStartDate();
    populateCategories();
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

    // Function to populate Categories
    function populateCategories() {
        const adhocCategorySelect = document.getElementById('adhoc-expense-category');
        const billCategorySelect = document.getElementById('bill-category');

        const selects = [adhocCategorySelect, billCategorySelect];

        selects.forEach(select => {
            if (select) {
                select.innerHTML = ''; // Clear existing options
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
            }
        });
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

        runningTotals.forEach((item, index) => {
            const row = tableBody.insertRow();

            const dateCell = row.insertCell(0);
            const eventCell = row.insertCell(1);
            const debitCreditCell = row.insertCell(2);
            const balanceCell = row.insertCell(3);
            const actionsCell = row.insertCell(4);

            // Format the date to short form
            dateCell.textContent = formatRunningBudgetDate(item.date);

            // Display the net amount in debit/credit cell
            debitCreditCell.textContent = `$${item.dailyNet.toFixed(2)}`;

            eventCell.textContent = item.event || '---';
            balanceCell.textContent = `$${item.balance.toFixed(2)}`;

            // Apply conditional formatting to Debit/Credit cell
            if (item.dailyNet > 0) {
                debitCreditCell.classList.add('positive-amount');
            } else if (item.dailyNet === 0) {
                debitCreditCell.classList.add('neutral-amount');
            } else {
                debitCreditCell.classList.add('negative-amount');
            }

            // Apply conditional formatting based on balance
            if (item.balance > 100) {
                balanceCell.style.color = 'green';
            } else if (item.balance > 0) {
                balanceCell.style.color = 'orange';
            } else {
                balanceCell.style.color = 'red';
            }

            // Add Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.dataset.index = index;
            editBtn.dataset.type = 'runningBudget';
            editBtn.addEventListener('click', openEditModal);
            actionsCell.appendChild(editBtn);
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
            editBtn.dataset.type = 'bill';
            editBtn.addEventListener('click', openEditModal);
            actionsCell.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.dataset.type = 'bill';
            deleteBtn.addEventListener('click', deleteEntry);
            actionsCell.appendChild(deleteBtn);
        });

        // Populate the adhoc expenses list table
        const adhocExpensesTableBody = document.getElementById('adhoc-expenses-list-table').getElementsByTagName('tbody')[0];
        adhocExpensesTableBody.innerHTML = ''; // Clear existing rows

        adhocExpenses.forEach((expense, index) => {
            const row = adhocExpensesTableBody.insertRow();
            row.insertCell(0).textContent = expense.name;
            row.insertCell(1).textContent = formatRunningBudgetDate(parseDateInput(expense.date));
            row.insertCell(2).textContent = `$${expense.amount.toFixed(2)}`;
            row.insertCell(3).textContent = expense.category;

            // Actions cell
            const actionsCell = row.insertCell(4);
            actionsCell.classList.add('actions-cell');
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.dataset.index = index;
            editBtn.dataset.type = 'adhocExpense';
            editBtn.addEventListener('click', openEditModal);
            actionsCell.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.dataset.type = 'adhocExpense';
            deleteBtn.addEventListener('click', deleteEntry);
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
            row.insertCell(3).textContent = formatRunningBudgetDate(parseDateInput(income.startDate));

            // Actions cell
            const actionsCell = row.insertCell(4);
            actionsCell.classList.add('actions-cell');
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.dataset.index = index;
            editBtn.dataset.type = 'income';
            editBtn.addEventListener('click', openEditModal);
            actionsCell.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.dataset.type = 'income';
            deleteBtn.addEventListener('click', deleteEntry);
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

        // Render the expenses by category bar chart
        renderCategoryExpensesChart(categoryLabels, categoryData);

        // Render the expenses by category pie chart
        renderCategoryExpensesPieChart(categoryLabels, categoryData);
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
        let runningTotals = [];
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

            // Get events for the date
            let eventDescription = getEventsForDate(currentDate);

            // Check for adjustments on this date
            const adjustment = runningBudgetAdjustments.find(adj => {
                const adjDate = parseDateInput(adj.date);
                return adjDate.toDateString() === currentDate.toDateString();
            });
            if (adjustment) {
                if (adjustment.amount !== undefined) {
                    // Adjust the dailyNet
                    dailyNet = adjustment.amount;
                    // Recalculate the current balance
                    currentBalance = (runningTotals.length > 0 ? runningTotals[runningTotals.length - 1].balance : accountBalance) + dailyNet;
                }
                if (adjustment.event) {
                    // Override the event description
                    eventDescription = adjustment.event;
                }
            }

            // Add to running totals
            runningTotals.push({
                date: new Date(currentDate), // Store a copy of the date
                event: eventDescription,
                dailyNet: dailyNet,
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
            case 'One-time':
                return incomeStartDate.toDateString() === date.toDateString();
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
        if (expensesChart) {
            expensesChart.destroy();
        }

        // Check if data is available
        if (data.length === 0) {
            console.warn('No data available for expenses chart.');
            return;
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

    // Function to render the expenses by category bar chart
    function renderCategoryExpensesChart(labels, data) {
        const canvasElement = document.getElementById('category-expenses-chart');
        if (!canvasElement) {
            console.error('Canvas element with id "category-expenses-chart" not found.');
            return;
        }
        const ctx = canvasElement.getContext('2d');

        // Destroy previous chart instance if it exists
        if (categoryExpensesChart) {
            categoryExpensesChart.destroy();
        }

        // Check if data is available
        if (data.length === 0) {
            console.warn('No data available for category expenses chart.');
            return;
        }

        // Generate colors for each bar
        const colors = labels.map((label, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);

        // Create a new chart
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

    // Function to render the expenses by category pie chart
    function renderCategoryExpensesPieChart(labels, data) {
        const canvasElement = document.getElementById('category-expenses-pie-chart');
        if (!canvasElement) {
            console.error('Canvas element with id "category-expenses-pie-chart" not found.');
            return;
        }
        const ctx = canvasElement.getContext('2d');

        // Destroy previous chart instance if it exists
        if (categoryExpensesPieChart) {
            categoryExpensesPieChart.destroy();
        }

        // Check if data is available
        if (data.length === 0) {
            console.warn('No data available for category expenses pie chart.');
            return;
        }

        // Generate colors for each slice
        const colors = labels.map((label, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);

        // Create a new chart
        categoryExpensesPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Expenses by Category',
                        data: data,
                        backgroundColor: colors,
                    },
                ],
            },
            options: {
                responsive: true,
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

    // Function to open Edit Modal
    function openEditModal(event) {
        const index = event.target.dataset.index;
        const type = event.target.dataset.type;
        const editModal = document.getElementById('edit-modal');
        const editForm = document.getElementById('edit-form');
        const editModalTitle = document.getElementById('edit-modal-title');

        // Clear previous form fields
        editForm.innerHTML = '';

        if (type === 'bill') {
            const bill = bills[index];
            editModalTitle.textContent = 'Edit Bill/Expense';

            // Create form fields
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

            // Add event listener for form submission
            editForm.onsubmit = function (e) {
                e.preventDefault();
                updateBillEntry(index);
                editModal.style.display = 'none';
            };

            // Add event listener for adding category
            document.getElementById('add-edit-bill-category-btn').addEventListener('click', addCategory);

        } else if (type === 'adhocExpense') {
            const expense = adhocExpenses[index];
            editModalTitle.textContent = 'Edit Adhoc Expense';

            // Create form fields
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

            // Add event listener for form submission
            editForm.onsubmit = function (e) {
                e.preventDefault();
                updateAdhocExpenseEntry(index);
                editModal.style.display = 'none';
            };

            // Add event listener for adding category
            document.getElementById('add-edit-adhoc-category-btn').addEventListener('click', addCategory);

        } else if (type === 'income') {
            const income = incomeEntries[index];
            editModalTitle.textContent = 'Edit Income';

            // Create form fields
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

            // Add event listener for form submission
            editForm.onsubmit = function (e) {
                e.preventDefault();
                updateIncomeEntry(index);
                editModal.style.display = 'none';
            };
        } else if (type === 'runningBudget') {
            const runningTotals = calculateRunningTotals();
            const entry = runningTotals[index];
            editModalTitle.textContent = 'Edit Running Budget Entry';

            // Create form fields
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

            // Add event listener for form submission
            editForm.onsubmit = function (e) {
                e.preventDefault();
                const oldDate = entry.date.toISOString().split('T')[0];
                updateRunningBudgetEntry(oldDate);
                editModal.style.display = 'none';
            };
        }

        // Show the modal
        editModal.style.display = 'block';

        // Add event listener for cancel button
        document.getElementById('cancel-edit-btn').addEventListener('click', function () {
            editModal.style.display = 'none';
        });
    }

    // Function to update a bill entry
    function updateBillEntry(index) {
        const name = document.getElementById('edit-bill-name').value.trim();
        const date = parseInt(document.getElementById('edit-bill-date').value);
        const amount = parseFloat(document.getElementById('edit-bill-amount').value);
        const category = document.getElementById('edit-bill-category').value;

        // Validate day of month
        if (date < 1 || date > 31) {
            alert('Please enter a valid day of the month (1-31).');
            return;
        }

        // Update bill
        bills[index] = {
            name,
            date,
            amount,
            category,
        };

        // Save data
        saveData();

        // Update display
        updateDisplay();
    }

    // Function to update an adhoc expense entry
    function updateAdhocExpenseEntry(index) {
        const name = document.getElementById('edit-adhoc-expense-name').value.trim();
        const date = document.getElementById('edit-adhoc-expense-date').value;
        const amount = parseFloat(document.getElementById('edit-adhoc-expense-amount').value);
        const category = document.getElementById('edit-adhoc-expense-category').value;

        // Validate date
        if (!date) {
            alert('Please enter a valid date.');
            return;
        }

        // Update expense
        adhocExpenses[index] = {
            name,
            date,
            amount,
            category,
        };

        // Save data
        saveData();

        // Update display
        updateDisplay();
    }

    // Function to update an income entry
    function updateIncomeEntry(index) {
        const name = document.getElementById('edit-income-name').value.trim();
        const amount = parseFloat(document.getElementById('edit-income-amount').value);
        const frequency = document.getElementById('edit-income-frequency').value;
        const startDate = document.getElementById('edit-income-start-date').value;

        // Validate date
        if (!startDate) {
            alert('Please enter a valid start date.');
            return;
        }

        // Update income
        incomeEntries[index] = {
            name,
            amount,
            frequency,
            startDate,
        };

        // Save data
        saveData();

        // Update display
        updateDisplay();
    }

    // Function to update a running budget entry
    function updateRunningBudgetEntry(oldDate) {
        const newDate = document.getElementById('edit-running-budget-date').value;
        const amount = parseFloat(document.getElementById('edit-running-budget-amount').value);
        const event = document.getElementById('edit-running-budget-event').value;

        // Find if an adjustment already exists
        const adjIndex = runningBudgetAdjustments.findIndex(adj => adj.date === oldDate);

        const adjustment = {
            date: newDate,
            amount,
            event,
        };

        if (adjIndex >= 0) {
            runningBudgetAdjustments[adjIndex] = adjustment;
        } else {
            runningBudgetAdjustments.push(adjustment);
        }

        // Save data
        saveData();

        // Update display
        updateDisplay();
    }

    // Function to delete an entry
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

        // Save data
        saveData();

        // Update display
        updateDisplay();
    }

    // Close Edit Modal when 'X' is clicked
    const closeEditModal = document.getElementById('close-edit-modal');
    closeEditModal.addEventListener('click', function () {
        document.getElementById('edit-modal').style.display = 'none';
    });

    // Handling Bills Form Submission
    const billForm = document.getElementById('bill-form');
    billForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('bill-name').value.trim();
        const date = parseInt(document.getElementById('bill-date').value);
        const amount = parseFloat(document.getElementById('bill-amount').value);
        const category = document.getElementById('bill-category').value;

        // Validate day of month
        if (date < 1 || date > 31) {
            alert('Please enter a valid day of the month (1-31).');
            return;
        }

        // Create bill object
        const bill = {
            name,
            date,
            amount,
            category,
        };

        // Add new bill
        bills.push(bill);

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
        const name = document.getElementById('adhoc-expense-name').value.trim();
        const dateInput = document.getElementById('adhoc-expense-date').value;
        const amount = parseFloat(document.getElementById('adhoc-expense-amount').value);
        const category = document.getElementById('adhoc-expense-category').value;

        // Validate date
        if (!dateInput) {
            alert('Please enter a valid date.');
            return;
        }

        // Create adhoc expense object
        const expense = {
            name,
            date: dateInput,
            amount,
            category,
        };

        // Add new adhoc expense
        adhocExpenses.push(expense);

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
        const name = document.getElementById('income-name').value.trim();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const frequency = document.getElementById('income-frequency').value;
        const startDateInput = document.getElementById('income-start-date').value;

        // Validate date
        if (!startDateInput) {
            alert('Please enter a valid start date.');
            return;
        }

        // Create income object
        const income = {
            name,
            amount,
            frequency,
            startDate: startDateInput,
        };

        // Add new income
        incomeEntries.push(income);

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
        accountName = document.getElementById('account-name').value.trim();
        const balance = parseFloat(document.getElementById('account-balance').value);

        // Validate balance
        if (isNaN(balance)) {
            alert('Please enter a valid balance.');
            return;
        }

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

        if (!startDateInput) {
            alert('Please enter a valid start date.');
            return;
        }

        startDate = parseDateInput(startDateInput);
        projectionLength = parseInt(projectionLengthInput);

        // Save data
        saveData();

        // Update display
        updateDisplay();
    });

    // Handling Data Export (JSON)
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const data = {
            bills: bills,
            incomeEntries: incomeEntries,
            adhocExpenses: adhocExpenses,
            accountBalance: accountBalance,
            accountName: accountName,
            startDate: startDate ? startDate.toISOString() : null,
            projectionLength: projectionLength,
            categories: categories,
            runningBudgetAdjustments: runningBudgetAdjustments,
        };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'budget_data.json');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // Handling Data Export (CSV)
    const exportCsvBtn = document.getElementById('export-csv-btn');
    exportCsvBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const data = {
            bills: bills,
            incomeEntries: incomeEntries,
            adhocExpenses: adhocExpenses,
            accountBalance: accountBalance,
            accountName: accountName,
            startDate: startDate ? startDate.toISOString() : '',
            projectionLength: projectionLength,
            categories: categories,
            runningBudgetAdjustments: runningBudgetAdjustments,
        };

        // Convert data to CSV
        const csvData = convertDataToCsv(data);
        const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'budget_data.csv');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // Function to convert data to CSV format
    function convertDataToCsv(data) {
        let csvContent = '';
        // Convert each data section to CSV
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
        csvContent += '\nAccount Balance\n';
        csvContent += `Account Name,Balance\n`;
        csvContent += `${data.accountName},${data.accountBalance}\n`;
        csvContent += '\nStart Date and Projection Length\n';
        csvContent += `Start Date,Projection Length\n`;
        csvContent += `${data.startDate},${data.projectionLength}\n`;
        return csvContent;
    }

    // Handling Data Import
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

        // Reset selected file
        importFileInput.value = '';
    });

    // Handling Reset Button Click
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
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

            // Reset forms
            document.getElementById('bill-form').reset();
            document.getElementById('adhoc-expense-form').reset();
            document.getElementById('income-form').reset();
            document.getElementById('balance-form').reset();
            document.getElementById('start-date-form').reset();

            // Reset modal
            document.getElementById('edit-modal').style.display = 'none';

            // Save data
            saveData();

            // Populate categories
            populateCategories();

            // Initialize start date
            initializeStartDate();

            // Update display
            updateDisplay();

            alert('All data has been reset.');
        }
    });

    // Handling Instructions Modal
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModal = document.getElementById('close-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Open the modal when the Instructions button is clicked
    instructionsBtn.addEventListener('click', function (e) {
        e.preventDefault();
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

    // Handling Add Category Buttons
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
});
