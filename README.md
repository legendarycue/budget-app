
# Budget App

**Version 1.5.0**

**Screenshots**

<a href="https://ibb.co/9bNwvPn"><img src="https://i.ibb.co/m9GvBpJ/Screenshot-2024-12-03-at-8-26-22-PM.png" alt="Screenshot-2024-12-03-at-8-26-22-PM" border="0"></a>
<a href="https://ibb.co/B3M2zg4"><img src="https://i.ibb.co/Khvx09N/Screenshot-2024-12-03-at-8-26-36-PM.png" alt="Screenshot-2024-12-03-at-8-26-36-PM" border="0"></a>
<a href="https://ibb.co/6wWhSph"><img src="https://i.ibb.co/bmKhVyh/Screenshot-2024-12-03-at-8-26-46-PM.png" alt="Screenshot-2024-12-03-at-8-26-46-PM" border="0"></a>

## Table of Contents

-   [Description](#description)
-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Contributing](#contributing)
-   [License](https://github.com/legendarycue/budget-app/blob/main/LICENSE.md)
-   [Changelog](https://github.com/legendarycue/budget-app/blob/main/CHANGELOG.md)
-   [Contact](#contact)
-   [Acknowledgments](#acknowledgments)
-   [FAQ](#faq)

## Description

Budget App is a comprehensive web application designed to help users manage their finances effectively. Whether you're tracking your daily expenses, managing recurring bills, or planning your income, Budget App provides an intuitive interface to keep your finances organized and under control. With features like dynamic charts, data export/import, and responsive design, Budget App caters to both personal and professional budgeting needs.

## Features

-   **Set Budget Projection**: Define the start date and projection length (up to 12 months) for your budget.
-   **Account Balance Management**: Input and update your account balance with custom account names.
-   **Add Recurring Bills/Expenses**: Manage monthly recurring expenses with customizable categories.
-   **Add Adhoc Expenses**: Record one-time expenses and create custom categories for flexibility.
-   **Add Income Sources**: Track various income streams with different frequencies (Weekly, Bi-weekly, Monthly).
-   **Running Budget**: View a daily breakdown of your finances with events, debits/credits, and balances.
-   **Running Budget Row Editing**: Edit individual entries in the Running Budget table directly from the interface.
-   **Visual Analytics**: Utilize interactive charts to visualize expenses breakdown and expenses by category.
-   **Lowest Balances by Month**: Identify potential cash flow issues with monthly lowest balance reports.
-   **Data Export/Import**: Save your financial data as a JSON or CSV file and load it back when needed.
-   **Reset Data**: Clear all data to start fresh, ensuring data privacy and control.
-   **Responsive Design**: Accessible on desktop, tablet, and mobile devices for on-the-go budgeting.
-   **User-Friendly Interface**: Intuitive forms and tables for easy data entry and management.
-   **Custom Category Management**: Add, edit, and delete categories for both recurring and adhoc expenses.

## Technologies Used

-   **HTML5**: Structure and layout of the application.
-   **CSS3**: Styling and responsive design.
-   **JavaScript (ES6)**: Functionality and interactivity.
-   **Chart.js**: Data visualization through dynamic charts.
-   **LocalStorage**: Data persistence in the browser.
-   **OpenAI ChatGPT**: Assistance in developing and enhancing the application.

## Installation

1.  **Clone the Repository**
    
    `git clone https://github.com/yourusername/budget-app.git`
    
2.  **Navigate to Project Directory**
    
    `cd budget-app`
    
3.  **Open the Application**
    
    Open the `index.html` file in your preferred web browser.
    
    -   **Option 1:** Double-click the `index.html` file.
        
    -   **Option 2:** Use the terminal:
        
        -   **macOS:** `open index.html`
        -   **Windows:** `start index.html`
        -   **Linux:** `xdg-open index.html`

## Usage

1.  **Set Budget Projection**
    
    -   **Navigate to "Set Budget Projection":**
        -   Locate the "Set Budget Projection" section on the left column of the app.
    -   **Select Start Date:**
        -   Click on the date picker labeled "Start Date" and choose your desired start date for the budget.
    -   **Enter Projection Length:**
        -   Input the number of months (up to 12) for which you want to project your budget in the "Projection Length (Months)" field.
    -   **Save Settings:**
        -   Click the "Set Budget Projection" button to save your budget projection settings.
2.  **Manage Account Balance**
    
    -   **Navigate to "Account Balance":**
        -   Find the "Account Balance" section below the budget projection form.
    -   **Enter Account Details:**
        -   **Account Name:** Provide a name for your account (e.g., "Checking Account").
        -   **Current Balance:** Input your current account balance in USD.
    -   **Update Balance:**
        -   Click the "Update Balance" button to save your account information.
3.  **Add Recurring Bills/Expenses**
    
    -   **Navigate to "Add Bill/Expense":**
        -   Scroll to the "Add Bill/Expense" section.
    -   **Fill Out the Form:**
        -   **Bill Name:** Enter the name of the bill or expense.
        -   **Day of Month:** Specify the day (1-31) when the bill is due each month.
        -   **Amount (USD):** Input the amount for the bill.
        -   **Category:** Select an appropriate category from the dropdown menu.
    -   **Save Bill:**
        -   Click the "Add Bill" button to save the recurring expense.
4.  **Add Adhoc Expenses**
    
    -   **Navigate to "Add Adhoc Expense":**
        -   Locate the "Add Adhoc Expense" section.
    -   **Fill Out the Form:**
        -   **Expense Name:** Enter the name of the expense.
        -   **Date:** Select the specific date the expense will occur.
        -   **Amount (USD):** Input the amount for the expense.
        -   **Category:** Choose a category from the dropdown or click "Add Category" to create a new one.
    -   **Save Expense:**
        -   Click the "Add Adhoc Expense" button to record the expense.
5.  **Add Income Sources**
    
    -   **Navigate to "Add Income":**
        -   Find the "Add Income" section.
    -   **Fill Out the Form:**
        -   **Income Name:** Enter the name of the income source (e.g., "Salary").
        -   **Amount per Paycheck:** Input the amount you receive each paycheck.
        -   **Frequency:** Select the income frequency (Weekly, Bi-weekly, Monthly).
        -   **Start Date:** Choose the start date for this income source.
    -   **Save Income Entry:**
        -   Click the "Add Income" button to save the income entry.
6.  **View and Manage Entries**
    
    -   **Review Entries:**
        -   Check the "Bills and Expenses," "Adhoc Expenses," and "Income Entries" tables to see all your recorded data.
    -   **Edit Entries:**
        -   Click the "Edit" button next to any entry to modify its details. The form will pre-fill with the entry's information, allowing you to update the necessary fields.
7.  **Running Budget Row Editing**
    
    -   **Navigate to "Running Budget":**
        -   Locate the "Running Budget" table in the right column of the app.
    -   **Edit Running Budget Entries:**
        -   Click the "Edit" button corresponding to any entry in the Running Budget table.
        -   An edit modal will appear, allowing you to adjust the date, amount, and description of the entry.
        -   After making the necessary changes, click "Update Entry" to save your modifications.
8.  **Visual Analytics**
    
    -   **Expenses Breakdown Bar Chart:**
        -   View the bar chart displaying total expenses over the projection period, categorized by expense type.
    -   **Expenses by Category Bar Chart:**
        -   Analyze your spending habits with a bar chart representing expenses across different categories.
    -   **Expenses by Category Pie Chart:**
        -   Gain insights into your spending distribution with a pie chart showcasing the proportion of expenses per category.
9.  **Lowest Balances by Month**
    
    -   **Review Lowest Balances:**
        -   Check the "Lowest Balances by Month" table to identify months where your balance was the lowest, helping you spot potential cash flow issues.
10.  **Data Export/Import**
    
    -   **Export Data:**
        -   Click on "Export Data (JSON)" or "Export Data (CSV)" from the menu to download your financial data.
    -   **Import Data:**
        -   Click on "Import Data" from the menu and select a previously exported JSON file to load your data into the application.
11.  **Reset Data**
    
    -   **Clear All Data:**
        -   Click on "Reset Data" from the menu to clear all stored information and start fresh. **Note:** This action is irreversible.

## Contributing

Contributions are welcome! Please follow these steps to contribute to the project:

1.  **Fork the Repository**
    
2.  **Create a Feature Branch**
    
    `git checkout -b feature/YourFeatureName`
    
3.  **Commit Your Changes**
    
    `git commit -m "Add Your Feature"`
    
4.  **Push to the Branch**
    
    `git push origin feature/YourFeatureName`
    
5.  **Open a Pull Request**
    

Please ensure your code adheres to the project's coding standards and includes appropriate documentation.

## License

This project is licensed under the [MIT License](https://github.com/legendarycue/budget-app/blob/main/LICENSE.md).

## Changelog

See the [Changelog](https://github.com/legendarycue/budget-app/blob/main/CHANGELOG.md) for all updates and changes.

## Contact

-   **Your Name**
-   **Email:** jshjgriffith@gmail.com
-   **GitHub:** [legendarycue](https://github.com/legendarycue)

## Acknowledgments

-   Thanks to all contributors and users who help improve the Budget App.
-   Inspired by the need for effective personal finance management tools.

## FAQ

**Q: How do I reset all my data?**

A: Click on "Reset Data" in the menu. Please note that this will clear all your stored information and cannot be undone.

**Q: Can I export my data to use in other applications?**

A: Yes, you can export your data in JSON or CSV formats using the export options in the menu.

**Q: How do I add a new expense category?**

A: Use the "Add Category" button in either the Bills or Adhoc Expenses forms to create a new custom category.

**Q: Is my data secure?**

A: Your data is stored locally in your browser's `localStorage` and is not transmitted to any external servers.

If you have any other questions, feel free to contact me through the [Contact](#contact) section.