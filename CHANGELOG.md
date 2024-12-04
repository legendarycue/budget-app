# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.5.0] - 2024-12-03

### Added
* **Running Budget Row Editing:**
  * Users can now edit individual entries in the Running Budget table directly from the interface.
  * Implemented an edit modal that allows users to adjust the date, amount, and description of running budget entries.
* **Data Import/Export Enhancements:**
  * Updated the data export functionality to include both JSON and CSV formats without savings account data.
  * Improved data import functionality to handle datasets without savings-related fields gracefully.

### Removed
* **Savings Features:**
  * Removed all savings-related features, including:
    * Ability to add savings accounts.
    * Scheduling and managing savings transfers.
    * Savings Account Summary section.
    * Savings-related data persistence and calculations.
  * Simplified the application to focus on income, bills, and expenses.

### Changed
* **User Interface Adjustments:**
  * Updated forms and tables to remove savings-related fields and sections.
  * Adjusted navigation and instructions to reflect the removal of savings features.
* **Codebase Cleanup:**
  * Refactored code to remove unused variables and functions related to savings.
  * Improved code structure for better maintainability and readability.

### Fixed
* **Data Consistency:**
  * Ensured that data import/export functions correctly without savings data.
  * Resolved any potential errors arising from the absence of savings features.

## [1.4.0] - 2024-11-30

### Added
* **Savings Goal Tracking System:**
  * Users can now add savings accounts with a name and current balance.
  * Implemented a section where users can allocate excess funds from the running budget to their savings accounts.
  * Added a Savings Account Summary section to display savings account balances and allow allocations.
* **Export to CSV Option:**
  * Added an option in the menu to export data as a CSV file in addition to the JSON export.
* **Expenses by Category Pie Chart:**
  * Added a pie chart to provide a visual representation of expenses by category.

### Changed
* **Table Formatting:**
  * Restored the 1px border and light grey cell background to the tables for better readability and visual appeal.

### Fixed
* **General Enhancements:**
  * Improved code structure and comments for better maintainability.

## [1.3.0] - 2024-11-20

### Added
* **Expense Categories:**
  * Updated the expense categories in the Bills and Adhoc Expenses forms to include:
    * Charity/Donations
    * Childcare
    * Debt Payments
    * Dining Out/Takeout
    * Education
    * Entertainment
    * Healthcare
    * Hobbies/Recreation
    * Housing
    * Insurance
    * Personal Care
    * Pets
    * Savings/Investments
    * Subscriptions/Memberships
    * Transportation
    * Travel
    * Utilities
    * Misc/Other
* **Custom Category Management:**
  * Added an "Add Category" button in the Adhoc Expenses form to allow users to create custom categories.
  * Implemented data persistence for custom categories using localStorage.
* **Running Budget Table Enhancements:**
  * Highlighted income entries with a light pastel green background.
  * Displayed income amounts and net amounts in the Debit/Credit cell.
  * Correctly formatted dates to display in a user-friendly format.
* **Contact Section:**
  * Added a Contact section in the README with name, email, and GitHub links.
* **.gitignore File:**
  * Added a .gitignore file to exclude unnecessary files from the repository.

### Changed
* **Date Parsing:**
  * Fixed date parsing issues to ensure accurate date handling without time zone shifts.
* **README Documentation:**
  * Rewrote the Usage section for clarity and better formatting.
  * Rewrote the Contributing section to include detailed guidelines.
  * Added License, Contact, Acknowledgments, and FAQ sections.
  * Incorporated version information ("Version 1.3") at the top of the README.

### Fixed
* **Git Commit Issue:**
  * Resolved the Git commit error: fatal: cannot update the ref 'HEAD': unable to append to '.git/logs/HEAD': Operation timed out by troubleshooting disk space, file permissions, and potential repository corruption.

## [Unreleased]
Initial project setup and previous versions.