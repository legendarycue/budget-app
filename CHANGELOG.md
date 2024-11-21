# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2024-11-20

### Added

- **Expense Categories:**
  - Updated the expense categories in the Bills and Adhoc Expenses forms to include:
    - Charity/Donations
    - Childcare
    - Debt Payments
    - Dining Out/Takeout
    - Education
    - Entertainment
    - Healthcare
    - Hobbies/Recreation
    - Housing
    - Insurance
    - Personal Care
    - Pets
    - Savings/Investments
    - Subscriptions/Memberships
    - Transportation
    - Travel
    - Utilities
    - Misc/Other

- **Custom Category Management:**
  - Added an "Add Category" button in the Adhoc Expenses form to allow users to create custom categories.
  - Implemented data persistence for custom categories using `localStorage`.

- **Running Budget Table Enhancements:**
  - Highlighted income entries with a light pastel green background.
  - Displayed income amounts and net amounts in the Debit/Credit cell.
  - Correctly formatted dates to display in a user-friendly format.

- **Contact Section:**
  - Added a Contact section in the README with name, email, and GitHub links.

- **.gitignore File:**
  - Added a `.gitignore` file to exclude unnecessary files from the repository.

### Changed

- **Date Parsing:**
  - Fixed date parsing issues to ensure accurate date handling without time zone shifts.

- **README Documentation:**
  - Rewrote the Usage section for clarity and better formatting.
  - Rewrote the Contributing section to include detailed guidelines.
  - Added License, Contact, Acknowledgments, and FAQ sections.
  - Incorporated version information ("Version 1.3") at the top of the README.

### Fixed

- **Git Commit Issue:**
  - Resolved the Git commit error: `fatal: cannot update the ref 'HEAD': unable to append to '.git/logs/HEAD': Operation timed out` by troubleshooting disk space, file permissions, and potential repository corruption.

## [Unreleased]

- Initial project setup and previous versions.

