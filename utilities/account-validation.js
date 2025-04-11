const accountModel = require("../models/account-model"); // Import the model for database queries
const utilities = require("."); // Utility functions, like getNav for navigation menu
const { body, validationResult } = require("express-validator"); // Import validation middleware
const validate = {}; // Create a validation object to store middleware functions

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // First name is required
    body("account_firstname")
      .trim() // Removes whitespace
      .escape() // Prevents XSS
      .notEmpty() // Must not be empty
      .isLength({ min: 1 }) // At least 1 character
      .withMessage("Please provide a first name."),

    // Last name is required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 }) // At least 2 characters
      .withMessage("Please provide a last name."),

    // Email must be valid and unique
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // Clean up email format
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)[0];
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // Strong password is required
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

// Login validation rules
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please check your credentials and try again.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)[0];
        if (emailExists) {
          throw new Error("Please check your credentials and try again..");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("A valid email or password is required. (Password)"),
  ];
};

/* ******************************
 * Check if registration data has errors
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req); // Collect validation errors
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Load navigation
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return; // Stop middleware chain
  }
  next(); // Continue if no errors
};

// Check login form validation result
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let error = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email,
    });
  }
  next();
};

// Rules for editing account (basic info, no password)
validate.editAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ];
};

// Validate edit account form
validate.checkAccountData = async (req, res, next) => {
  const user = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/edit", {
      errors,
      title: "Edit Account Details",
      nav,
      user: res.locals.user,
    });
    return;
  }
  next();
};

// Rules for updating password only
validate.accountPasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

// Validate password form
validate.checkAccountPassword = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/edit.ejs", {
      errors,
      title: "Edit Account Details",
      nav,
      user: res.locals.user,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Validation for Admin Bulk Update
 * ********************************* */
validate.adminUpdateRules = () => {
  return [
    // Check if 'accounts' is an array
    body("accounts")
      .isArray()
      .withMessage("This form cannot be processed. Please contact support.")
      .notEmpty()
      .withMessage("The data form is empty."),

    // Each account must have an ID that's an integer
    body("accounts.*.account_id")
      .trim()
      .notEmpty()
      .withMessage("Account ids cannot be modified.")
      .isInt()
      .withMessage("Account ids must be integers.")
      .escape(),

    // First name required for each account
    body("accounts.*.account_firstname")
      .notEmpty()
      .withMessage("First names cannot be left blank.")
      .isString()
      .withMessage("First names must be strings.")
      .trim()
      .escape(),

    // Last name validation with email uniqueness per account
    body("accounts.*.account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name.")
      .escape()
      .custom(async (account_email, { req, path }) => {
        const indexMatch = path.match(/\d+/); // Extract index from path like accounts.0.account_email
        const index = indexMatch ? parseInt(indexMatch[0], 10) : -1;

        if (!Array.isArray(req.body.accounts)) {
          throw new Error("Invalid request format: 'accounts' is missing or not an array.");
        }

        if (index < 0 || index >= req.body.accounts.length) {
          throw new Error(`Invalid account index: ${index}.`);
        }

        const currentAccount = req.body.accounts[index];

        if (!currentAccount || typeof currentAccount !== "object") {
          throw new Error(`Missing account data at index ${index}.`);
        }

        if (!currentAccount.account_id) {
          throw new Error(`Missing account_id for account at index ${index}.`);
        }

        const emailExists = await accountModel.checkExistingEmail(account_email);

        if (
          emailExists.length > 0 &&
          emailExists[0].account_id !== parseInt(currentAccount.account_id)
        ) {
          throw new Error(
            `An email for ${currentAccount.account_id} already exists elsewhere. Please use a different email.`
          );
        }
      }),

    // Validate allowed account types
    body("accounts.*.account_type")
      .notEmpty()
      .withMessage("Account type cannot be left blank.")
      .isIn(["Client", "Admin", "Employee", "Owner"])
      .withMessage("Account type must be Client, Admin, Employee, or Owner."),
  ];
};

/* ******************************
 * Validate Admin Bulk Update Submission
 * ***************************** */
validate.checkadminUpdate = async (req, res, next) => {
  const tableData = await accountModel.getAllAccounts(); // Get all accounts for rendering
  const options = await accountModel.getAccountTypes(); // Get role options
  let errors = [];
  errors = validationResult(req);
  console.log("errors:", errors); // Debug
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/admin", {
      errors,
      title: "Admin Panel",
      nav,
      user: res.locals.user,
      tableData: tableData,
      options: options,
    });
    return;
  }
  next();
};

module.exports = validate; // Export all validation middleware
