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
- [License](#license)
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
     - Click the "Edit" button next to any entry to modify its details. The form will pre-fill with the existing data for easy editing.
   
   - **Delete Entries**:
     - Click the "Delete" button next to any entry to remove it from your records.

7. **Analyze Your Budget**
   
   - **Running Budget Table**:
     - View the "Running Budget" table to see a daily breakdown of your finances, including events, debits/credits, and account balances.
     - **Income Highlighting**: Rows with income entries are highlighted in a light pastel green background for easy identification.
   
   - **Expenses Breakdown Chart**:
     - Refer to the "Expenses Breakdown" bar chart to visualize your total expenses over the projection period.
   
   - **Expenses by Category Chart**:
     - Check the "Expenses by Category" bar chart to see how your expenses are distributed across different categories.
   
   - **Lowest Balances by Month Table**:
     - Use the "Lowest Balances by Month" table to identify months where your account balance was at its lowest, helping you manage potential cash flow issues.

8. **Export and Import Data**
   
   - **Export Data**:
     - Click the "Export Data" button in the footer to download your current financial data as a JSON file. This allows you to back up your data or transfer it to another device.
   
   - **Import Data**:
     - To load previously saved data, click the "Import Data" button, select your JSON file using the file input, and click "Import Data" again to load the data into the app.

9. **Reset Data**
   
   - **Clear All Data**:
     - If you wish to start fresh, click the "Reset Data" button in the footer.
     - **Confirmation**: A prompt will appear to confirm this action. **Note**: This will permanently delete all your data and cannot be undone.

10. **Additional Tips**
    
    - **Adding Custom Categories**:
      - In the "Add Adhoc Expense" form, use the "Add Category" button to create new categories tailored to your specific needs.
    
    - **Responsive Access**:
      - Budget App is designed to be responsive. You can access and manage your budget seamlessly on desktops, tablets, and mobile devices.
    
    - **Data Persistence**:
      - All your data is saved in your browser's local storage, ensuring your information remains intact even if you close the browser. However, exporting your data is recommended for backups.

By following these steps, you can effectively manage and analyze your finances using the Budget App. If you encounter any issues or have suggestions for improvements, feel free to reach out or contribute to the project!

## Contributing

We welcome contributions from everyone! Whether you're fixing bugs, improving documentation, or adding new features, your help is greatly appreciated. Follow the guidelines below to contribute to the Budget App.

### **How to Contribute**

1. **Fork the Repository**
   
   Click the **"Fork"** button at the top right corner of this repository to create a personal copy of the project on your GitHub account.

2. **Clone Your Fork**
   
   Clone the forked repository to your local machine using the following command:

   `git clone https://github.com/yourusername/budget-app.git`

3. **Navigate to the Project Directory**

    `cd budget-app`

4. **Create a New Branch**

It's best practice to create a new branch for each feature or bug fix you work on. Replace `feature-name` with a descriptive name for your branch.

 `git checkout -b feature-name`

5. **Make Your Changes**

Implement your feature, fix bugs, or make any improvements. Ensure that your code follows the project's coding standards and guidelines.

6. **Commit Your Changes**

After making changes, commit them with a clear and descriptive commit message.

`git add .`
`git commit -m "Add feature-name: brief description of the feature"`

7. **Push to Your Fork**

Push your changes to your forked repository on GitHub.

`git push origin feature-name`

8. **Open a Pull Request**

Navigate to the original repository on GitHub.
Click on the **"Compare & pull request"** button.
Provide a clear description of your changes and submit the pull request.

## Guidelines

### **Code Quality**

- **Write clean, readable, and maintainable code.**
  - Ensure your code is easy to understand and follow.
  
- **Follow the existing code style and conventions used in the project.**
  - Adhere to the project's formatting and naming standards to maintain consistency.
  
- **Include comments and documentation where necessary.**
  - Provide explanations for complex logic and document functions or classes to aid future maintenance.

### **Testing**

- **If applicable, add tests for your changes to ensure they work as expected.**
  - Implement unit tests or integration tests to validate your contributions.
  
- **Ensure that all existing tests pass after your modifications.**
  - Run the test suite to confirm that your changes do not break existing functionality.

### **Documentation**

- **Update the README or other documentation if your contribution affects usage or setup.**
  - Reflect any changes in the project's documentation to keep it accurate and helpful.
  
- **Provide clear instructions for any new features or changes.**
  - Explain how to use new functionalities or modifications to assist users and contributors.

### **Issue Tracking**

- **Before starting work on a new feature or bug fix, check the Issues page to see if it's already been reported or addressed.**
  - Avoid duplicate efforts by reviewing existing issues before contributing.
  
- **If you find a bug or have a feature request, feel free to open a new issue with detailed information.**
  - Provide comprehensive details to help maintainers understand and address the issue effectively.

### **Reporting Bugs**

- **If you encounter any bugs or issues, please report them by opening an issue. Provide as much detail as possible to help us understand and resolve the problem.**
  - Include steps to reproduce, expected behavior, and any relevant screenshots or logs when reporting bugs.

### **Suggesting Enhancements**

- **Have an idea for a new feature or an improvement? Open an issue to discuss it with the maintainers and the community.**
  - Share your ideas to foster collaboration and gather feedback before implementation.

### **Code of Conduct**

- **By contributing to this project, you agree to abide by our Code of Conduct. Please ensure that all interactions are respectful and constructive.**
  - Maintain a positive and inclusive environment for all contributors.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact **Your Name**.

## Acknowledgments

- **Chart.js** - For providing the charting library used in the app.
- **OpenAI ChatGPT** - For assistance in developing the application.
- **Font Awesome** - For icons used in the application.
- **Stack Overflow** - For invaluable coding support and solutions.

## FAQ

### Q: How do I reset all my data?

**A:** Click the **"Reset Data"** button in the footer. Note that this action cannot be undone.

### Q: Can I use this app on my mobile device?

**A:** Yes, Budget App is designed with a responsive layout compatible with mobile devices and tablets.

### Q: How do I add a new category for adhoc expenses?

**A:** In the **"Add Adhoc Expense"** form, click the **"Add Category"** button next to the category dropdown. Enter the new category name in the prompt, and it will be added to the list.

### Q: Why are my dates showing incorrectly?

**A:** The app has been updated to handle date parsing correctly. Ensure that your browser is up to date. If issues persist, please contact support.

### Q: How can I export my budget data?

**A:** Click the **"Export Data"** button in the footer to download your current budget data as a JSON file.

### Q: How do I import previously saved data?

**A:** Click the **"Import Data"** button, select your JSON file, and click **"Import Data"** again to load your data.
