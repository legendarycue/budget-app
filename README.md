# Budget App

**Version 1.3**

**Screenshots**

<img width="1433" alt="Screenshot 2024-11-20 at 11 18 05 PM" src="https://github.com/user-attachments/assets/24fb0064-c097-4ab2-b83a-8f50f92958f8">

<img width="1433" alt="Screenshot 2024-11-20 at 11 18 13 PM" src="https://github.com/user-attachments/assets/9c198b03-70e7-47c2-88b8-2d150e24ec9b">

<img width="708" alt="Screenshot 2024-11-20 at 11 18 27 PM" src="https://github.com/user-attachments/assets/74e76565-9277-4ea3-b685-21bf2f35ebae">

<img width="689" alt="Screenshot 2024-11-20 at 11 18 51 PM" src="https://github.com/user-attachments/assets/468648e6-194c-4f47-8e92-32a79093742d">

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](https://github.com/legendarycue/budget-app/blob/main/LICENSE.md)
- [Changelog](https://github.com/legendarycue/budget-app/blob/main/CHANGELOG.md)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)
- [FAQ](#faq)

## Description

Budget App is a comprehensive web application designed to help users manage their finances effectively. Whether you're tracking your daily expenses, managing recurring bills, or planning your income, Budget App provides an intuitive interface to keep your finances organized and under control. With features like dynamic charts, data export/import, and responsive design, Budget App caters to both personal and professional budgeting needs.

## Features

- **Set Budget Projection**: Define the start date and projection length (up to 12 months) for your budget.
- **Account Balance Management**: Input and update your account balance with custom account names.
- **Add Recurring Bills/Expenses**: Manage monthly recurring expenses with customizable categories.
- **Add Adhoc Expenses**: Record one-time expenses and create custom categories for flexibility.
- **Add Income Sources**: Track various income streams with different frequencies (Weekly, Bi-weekly, Monthly).
- **Running Budget**: View a daily breakdown of your finances with events, debits/credits, and balances.
- **Visual Analytics**: Utilize interactive charts to visualize expenses breakdown and expenses by category.
- **Lowest Balances by Month**: Identify potential cash flow issues with monthly lowest balance reports.
- **Data Export/Import**: Save your financial data as a JSON file and load it back when needed.
- **Reset Data**: Clear all data to start fresh, ensuring data privacy and control.
- **Responsive Design**: Accessible on desktop, tablet, and mobile devices for on-the-go budgeting.
- **User-Friendly Interface**: Intuitive forms and tables for easy data entry and management.
- **Custom Category Management**: Add, edit, and delete categories for both recurring and adhoc expenses.

## Technologies Used

- **HTML5**: Structure and layout of the application.
- **CSS3**: Styling and responsive design.
- **JavaScript (ES6)**: Functionality and interactivity.
- **Chart.js**: Data visualization through dynamic charts.
- **LocalStorage**: Data persistence in the browser.
- **OpenAI ChatGPT**: Assistance in developing and enhancing the application.

## Installation

1. **Clone the Repository**

   `git clone https://github.com/yourusername/budget-app.git`

2. **Navigate to Project Directory**

    `cd budget-app`

3. **Open the Application**
Open the index.html file in your preferred web browser.

- Option 1: Double-click the index.html file.

- Option 2: Use the terminal: `open index.html`

Note: The command above works for macOS. For Windows, use start index.html. For Linux, use xdg-open index.html.

## Usage

1. **Set Budget Projection**
   
   - **Navigate to "Set Budget Projection"**:
     - Locate the "Set Budget Projection" section on the left column of the app.
   
   - **Select Start Date**:
     - Click on the date picker labeled "Start Date" and choose your desired start date for the budget.
   
   - **Enter Projection Length**:
     - Input the number of months (up to 12) for which you want to project your budget in the "Projection Length (Months)" field.
   
   - **Save Settings**:
     - Click the "Set Budget Projection" button to save your budget projection settings.

2. **Manage Account Balance**
   
   - **Navigate to "Account Balance"**:
     - Find the "Account Balance" section below the budget projection form.
   
   - **Enter Account Details**:
     - **Account Name**: Provide a name for your account (e.g., "Checking Account").
     - **Current Balance**: Input your current account balance in USD.
   
   - **Update Balance**:
     - Click the "Update Balance" button to save your account information.

3. **Add Recurring Bills/Expenses**
   
   - **Navigate to "Add Bill/Expense"**:
     - Scroll to the "Add Bill/Expense" section.
   
   - **Fill Out the Form**:
     - **Bill Name**: Enter the name of the bill or expense.
     - **Day of Month**: Specify the day (1-31) when the bill is due each month.
     - **Amount (USD)**: Input the amount for the bill.
     - **Category**: Select an appropriate category from the dropdown menu.
   
   - **Save Bill**:
     - Click the "Add Bill" button to save the recurring expense.

4. **Add Adhoc Expenses**
   
   - **Navigate to "Add Adhoc Expense"**:
     - Locate the "Add Adhoc Expense" section.
   
   - **Fill Out the Form**:
     - **Expense Name**: Enter the name of the expense.
     - **Date**: Select the specific date the expense will occur.
     - **Amount (USD)**: Input the amount for the expense.
     - **Category**: Choose a category from the dropdown or click "Add Category" to create a new one.
   
   - **Save Expense**:
     - Click the "Add Adhoc Expense" button to record the expense.

5. **Add Income Sources**
   
   - **Navigate to "Add Income"**:
     - Find the "Add Income" section.
   
   - **Fill Out the Form**:
     - **Income Name**: Enter the name of the income source (e.g., "Salary").
     - **Amount per Paycheck**: Input the amount you receive each paycheck.
     - **Frequency**: Select the income frequency (Weekly, Bi-weekly, Monthly).
     - **Start Date**: Choose the start date for this income source.
   
   - **Save Income Entry**:
     - Click the "Add Income" button to save the income entry.

6. **View and Manage Entries**
   
   - **Review Entries**:
     - Check the "Bills and Expenses," "Adhoc Expenses," and "Income Entries" tables to see all your recorded data.
   
   - **Edit Entries**:
     - Click the "Edit" button next to any entry to modify its details. The form will pre-fill with the