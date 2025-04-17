// Import the Express framework / Importa el framework Express
const express = require("express");

// Create a new Express Router instance / Crea una nueva instancia del enrutador de Express
const router = new express.Router();
const invController = require("../controllers/invController");

// Import utility functions (e.g., checkLogin, handleErrors) / Importa funciones de utilidad
const utilities = require("../utilities/index.js");

// Import the account controller that contains the logic for user accounts / Importa el controlador de cuentas
const accountController = require("../controllers/accountController");

// Import validation rules and checks for registration and login / Importa las validaciones para login y registro
const regValidate = require("../utilities/account-validation");

// Console log to confirm the router file is being loaded / Confirmación en consola
console.log("in accountRoute.js");

// =========================
// 📌Routes for user accounts / Rutas para cuentas de usuario
// =========================

router.post("/comments", utilities.checkLogin, invController.addComment);


// Account home page (only accessible if logged in) / Página principal de la cuenta (solo si estás logueado)
router.get(
  "/",
  utilities.checkLogin, // Middleware to check if user is logged in / Verifica que el usuario esté logueado
  utilities.handleErrors(accountController.buildAccount) // Builds account view / Muestra la vista de cuenta
);

// Show the login page / Muestra la página de inicio de sesión
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login form / Procesa el formulario de login
router.post(
  "/login",
  regValidate.loginRules(), // Validation rules for login / Reglas de validación para login
  regValidate.checkLoginData, // Check for validation errors / Verifica si hay errores
  utilities.handleErrors(accountController.accountLogin) // Perform login logic / Lógica para iniciar sesión
);

// Log the user out / Cierra la sesión del usuario
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Show the registration form / Muestra el formulario de registro
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Process the registration form / Procesa el registro del nuevo usuario
router.post(
  "/register",
  regValidate.registationRules(), // Validation rules for registration / Reglas para validar el registro
  regValidate.checkRegData, // Check for validation errors / Revisa si hay errores
  utilities.handleErrors(accountController.registerAccount) // Executes the registration / Ejecuta el registro
);

// Admin panel (only for authorized users) / Panel de administrador (solo usuarios con permisos)
router.get(
  "/admin",
  utilities.checkLogin, // Verify login / Verifica que esté logueado
  utilities.checkOwnership, // Check admin privileges / Verifica si es administrador
  utilities.handleErrors(accountController.buildAdminPanel) // Build the admin panel / Muestra el panel admin
);

// Process bulk update from the admin panel / Procesa una actualización masiva desde el panel admin
router.post(
  "/admin",
  utilities.checkLogin, // Must be logged in / Debe estar logueado
  utilities.checkOwnership, // Must be an admin / Debe ser administrador
  (req, res, next) => {
    console.log("Processing bulk update", req.body); // Log the form data / Muestra datos del formulario
    next(); // Continue to the next middleware / Pasa al siguiente middleware
  },
  regValidate.adminUpdateRules(), // Validation rules for admin updates / Reglas de validación para admin
  regValidate.checkadminUpdate, // Check for errors / Revisa errores
  utilities.handleErrors(accountController.processAdminBulkUpdate) // Apply the update / Aplica los cambios
);

// Show the edit account view for a specific account / Muestra la vista para editar una cuenta específica
router.get(
  "/edit/:accountId",
  utilities.checkLogin, // Must be logged in / Debe estar logueado
  utilities.handleErrors(accountController.buildEditAccount) // Build edit view / Crea la vista de edición
);

// Process the edit account form / Procesa los cambios a los datos del usuario
router.post(
  "/update",
  utilities.checkLogin, // Must be logged in / Debe estar logueado
  regValidate.editAccountRules(), // Validation rules for edit / Reglas de validación para editar
  regValidate.checkAccountData, // Check for errors / Revisa errores
  utilities.handleErrors(accountController.updateAccountInfo) // Apply changes / Aplica los cambios
);

// Process password update / Procesa la actualización de la contraseña
router.post(
  "/update/password",
  utilities.checkLogin, // Must be logged in / Debe estar logueado
  regValidate.accountPasswordRules(), // Password validation rules / Reglas para contraseña
  regValidate.checkAccountPassword, // Check for errors / Verifica errores
  utilities.handleErrors(accountController.updateAccountPassword) // Change password / Cambia la contraseña
);

// Export the router so it can be used in the main app / Exporta el enrutador
module.exports = router;
