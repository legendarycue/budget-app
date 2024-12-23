# Budget App

**Version 1.6 .0**

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
-   [License](#license)
-   [Changelog](#changelog)
-   [Contact](#contact)
-   [Acknowledgments](#acknowledgments)
-   [FAQ](#faq)

## Description

Budget App is a comprehensive web application designed to help users manage their finances effectively. Whether you're tracking your daily expenses, managing recurring bills, planning your income, or contributing to savings goals, Budget App provides an intuitive interface to keep your finances organized and under control. With features like dynamic charts, data export/import, and responsive design, Budget App caters to both personal and professional budgeting needs.

## Features

-   **Set Budget Projection**  
    Define the start date and projection length (up to 12 months) for your budget.

-   **Account Balance Management**  
    Input and update your checking account balance with custom account names.

-   **Add Recurring Bills/Expenses**  
    Manage monthly recurring expenses with customizable categories.

-   **Add Adhoc Expenses**  
    Record one-time expenses and create custom categories for flexibility.

-   **Add Income Sources**  
    Track various income streams with different frequencies (Weekly, Bi-weekly, Monthly, or One-time).

-   **Running Budget**  
    View a daily breakdown of your finances with events, debits/credits, and balances.

-   **Running Budget Row Editing**  
    Edit individual entries in the Running Budget table directly from the interface, including date, amount, and event description.

-   **Savings Accounts & Contributions**  
    - Create one or more savings accounts with optional savings goals.  
    - Schedule recurring or one-time contributions from Checking to Savings.  
    - Collapse/expand a day-by-day savings balance table to track goal progress.

-   **Visual Analytics**  
    - **Expenses Breakdown Bar Chart**: Visualize total expenses over the projection period.  
    - **Expenses by Category Bar Chart**: Analyze spending habits by category.

-   **Lowest Balances by Month**  
    Identify potential cash flow issues with monthly lowest balance reports.

-   **Data Export/Import**  
    Save your financial data as a JSON or CSV file and load it back when needed.

-   **Reset Data**  
    Clear all data to start fresh, ensuring data privacy and control.

-   **Responsive Design**  
    Accessible on desktop, tablet, and mobile devices for on-the-go budgeting.

-   **User-Friendly Interface**  
    Intuitive forms and tables for easy data entry and management.

-   **Custom Category Management**  
    Add, edit, and delete categories for both recurring and adhoc expenses.

## Technologies Used

-   **HTML5** – Structure and layout of the application.
-   **CSS3** – Styling and responsive design.
-   **JavaScript (ES6)** – Functionality and interactivity.
-   **Chart.js** – Data visualization through dynamic charts.
-   **LocalStorage** – Data persistence in the browser.
-   **OpenAI ChatGPT** – Assistance in developing and enhancing the application.

## Installation

1. **Clone the Repository**  
   ~~~bash
   git clone https://github.com/yourusername/budget-app.git
   ~~~

2. **Navigate to Project Directory**  
   ~~~bash
   cd budget-app
   ~~~

3. **Open the Application**  
   - **Option 1:** Double-click the `index.html` file.
   - **Option 2:** Use the terminal:
     
     - **macOS:** `open index.html`  
     - **Windows:** `start index.html`  
     - **Linux:** `xdg-open index.html`

## Usage

1. **Set Budget Projection**  
   - **Locate "Set Budget Projection":**  
     In the left column, find the "Start Date and Projection Length" form.  
   - **Select Start Date:**  
     Use the date picker to choose your budget’s start date.  
   - **Enter Projection Length (Months):**  
     Input how many months (up to 12) you want to project.  
   - **Save Settings:**  
     Click "Set Start Date" to confirm.

2. **Manage Account Balance**  
   - **Locate "Checking Account Balance":**  
     Below the projection form, find the account balance form.  
   - **Enter Account Details:**  
     - **Account Name** (e.g., "Bills Checking").  
     - **Current Balance** in USD.  
   - **Update Balance:**  
     Click "Update Checking" to store your current balance.

3. **Add Recurring Bills/Expenses**  
   - **Add Bill/Expense Form:**  
     - **Bill Name**: Name of the recurring bill/expense (e.g., "Mortgage").  
     - **Day of Month** (1–31).  
     - **Amount (USD)** and **Category**.  
   - **Save Bill:**  
     Click "Add Bill" to record a monthly recurring expense.

4. **Add Adhoc Expenses**  
   - **Add Adhoc Expense Form:**  
     - **Expense Name**, **Date**, **Amount (USD)**, and **Category**.  
   - **Add Category (Optional):**  
     Click "Add Category" to create a custom category if needed.  
   - **Save Expense:**  
     Click "Add Adhoc Expense" to record the one-time expense.

5. **Add Income Sources**  
   - **Add Income Form:**  
     - **Income Name** (e.g., "Payroll").  
     - **Amount per Paycheck**.  
     - **Frequency** (Weekly, Bi-weekly, Monthly, or One-time).  
     - **Start Date**.  
   - **Save Income:**  
     Click "Add Income" to store the new income entry.

6. **View and Manage Entries**  
   - **Review Bills, Adhoc Expenses, and Income:**  
     Check the respective tables in the left column to see recorded data.  
   - **Edit or Delete:**  
     Click "Edit" or "Delete" beside any entry to modify or remove it.

7. **Running Budget Row Editing**  
   - **Locate "Running Budget" Table:**  
     In the right column, find the daily breakdown of your budget.  
   - **Edit Running Budget Entries:**  
     - Click the "Edit" button to open a modal where you can update the date, amount (Debit/Credit), and event description.  
     - Confirm changes with "Update Entry."

8. **Savings Accounts & Contributions**  
   - **Add Savings Account:**  
     - Enter a name, balance, and optional goal amount.  
     - Click "Add Savings Account."  
   - **Add Savings Contributions:**  
     - Choose a savings account, specify an amount and frequency.  
     - Save to schedule one-time or recurring contributions from Checking to Savings.  
   - **Collapsible Day-by-Day Balances:**  
     - Expand or collapse the savings balances table to see daily changes and goal progress.

9. **Visual Analytics**  
   - **Expenses Breakdown Bar Chart:**  
     Shows the total expenses over your chosen projection period.  
   - **Expenses by Category Bar Chart:**  
     Presents spending distribution across different categories.

10. **Lowest Balances by Month**  
    - **Locate the "Lowest Balances by Month" Table:**  
      Quickly spot months with potentially low or negative balances.

11. **Data Export/Import**  
    - **Export (JSON or CSV):**  
      Click the respective export option in the menu to download your financial data.  
    - **Import Data:**  
      Choose "Import Data" from the menu to load a previously exported JSON file.

12. **Reset Data**  
    - **Clear All Data:**  
      Select "Reset Data" from the menu to erase all stored information and start fresh.

## Contributing

Contributions are welcome! Please follow these steps to contribute to the project:

1. **Fork the Repository**  
2. **Create a Feature Branch**  
   ~~~bash
   git checkout -b feature/YourFeatureName
   ~~~
3. **Commit Your Changes**  
   ~~~bash
   git commit -m "Add Your Feature"
   ~~~
4. **Push to the Branch**  
   ~~~bash
   git push origin feature/YourFeatureName
   ~~~
5. **Open a Pull Request**

Please ensure your code adheres to the project's coding standards and includes appropriate documentation.

## License

This project is licensed under the [MIT License](https://github.com/legendarycue/budget-app/blob/main/LICENSE.md).

## Changelog

See the [Changelog](#changelog) for all updates and changes.

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
A: Your data is stored locally in your browser’s `localStorage` and is not transmitted to any external servers.

If you have any other questions, feel free to contact me through the [Contact](#contact) section.
