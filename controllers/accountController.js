// Importando las librerías necesarias
const bcrypt = require("bcryptjs");  // Librería para encriptar contraseñas
const jwt = require("jsonwebtoken");  // Librería para crear tokens JWT
require("dotenv").config();  // Cargar variables de entorno desde un archivo .env

// Importando utilidades y modelos de cuenta
utilities = require("../utilities/index.js");  // Utilidades comunes
accountModel = require("../models/account-model.js");  // Modelo de cuentas de usuario

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  // Renderiza la vista de login
  let nav = await utilities.getNav();  // Obtiene la navegación
  res.render("./account/login.ejs", {
    title: "Login",  // Título de la página
    nav: nav,  // Navegación a pasar a la vista
    errors: null,  // No hay errores al principio
  });
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  // Elimina el JWT de la cookie y borra el estado de sesión
  res.clearCookie("jwt");
  res.locals.loggedin = 0;  // Establece el estado de sesión como no iniciado
  res.locals.user = "";  // Borra la información del usuario
  req.flash("notice", "You are now logged out.");  // Mensaje flash de logout
  res.redirect("/account/login");  // Redirige a la vista de login
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  // Renderiza la vista de registro de cuenta
  let nav = await utilities.getNav();
  res.render("account/register.ejs", {
    title: "Register",  // Título de la página
    nav: nav,  // Navegación a pasar a la vista
    errors: null,  // No hay errores al principio
  });
}

/* ****************************************
 *  Deliver account view
 * *************************************** */
async function buildAccount(req, res, next) {
  // Renderiza la vista para gestionar la cuenta de usuario
  let nav = await utilities.getNav();
  res.render("account/account.ejs", {
    title: "Account Management",  // Título de la página
    nav: nav,  // Navegación a pasar a la vista
    errors: null,  // No hay errores al principio
    user: res.locals.user,  // Información del usuario (generalmente de la sesión)
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  // Registra una nueva cuenta de usuario
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  
  // Encripta la contraseña antes de almacenarla en la base de datos
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);  // Hashing con 10 saltos
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;  // Devuelve aquí para evitar que el código continúe
  }

  // Intenta registrar la cuenta en la base de datos
  const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

  if (regResult) {
    req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login.ejs", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register.ejs", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res, next) {
  // Procesa la solicitud de login
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  // Busca el usuario por email
  const user = await accountModel.getAccountByEmail(account_email);
  
  if (!user) {
    req.flash("notice", "Please check your credentials and try again...");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;  // Si no encuentra al usuario, redirige de vuelta al login
  }

  // Compara la contraseña ingresada con la almacenada
  try {
    if (await bcrypt.compare(account_password, user.account_password)) {
      delete user.account_password;  // Elimina la contraseña del objeto user antes de enviarlo
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,  // Expira en una hora
      });

      // Configura la cookie para almacenar el JWT
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }

      return res.redirect("/account/");  // Redirige a la página de la cuenta
    } else {
      req.flash("message notice", "Please check your credentials and try again....");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Access Forbidden:" + error);
    return next(error);  // Si hay un error, pasa al siguiente middleware de error
  }
}

/* ****************************************
 *  Render edit account view
 * *************************************** */
async function buildEditAccount(req, res, next) {
  // Renderiza la vista para editar la cuenta del usuario
  let nav = await utilities.getNav();
  const userId = req.params.accountId;
  const data = await accountModel.getAccountById(userId);
  
  res.render("account/edit.ejs", {
    title: "Edit Account Details",
    nav: nav,
    errors: null,
    user: data,  // Pasa la información del usuario para prellenar el formulario
  });
}

/* ****************************************
 *  Update account information
 * *************************************** */
async function updateAccountInfo(req, res, next) {
  // Actualiza la información básica de la cuenta
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let nav = await utilities.getNav();
  const result = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

  if (result) {
    req.flash("notice", "Your account information has been updated.");
    res.render("account/account.ejs", {
      title: "Account Management",
      nav: nav,
      errors: null,
      user: res.locals.user,  // Pasa los datos actualizados
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/edit.ejs", {
      title: "Edit Account Details",
      nav: nav,
      errors: result.message,  // Muestra el mensaje de error
      user: res.locals.user,
    });
  }
}

/* ****************************************
 *  Update account password
 * *************************************** */
async function updateAccountPassword(req, res, next) {
  // Actualiza la contraseña de la cuenta
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();
  let hashedPassword;
  
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);  // Encripta la nueva contraseña
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.");
    res.status(500).render("account/edit.ejs", {
      title: "Edit Account Details",
      nav,
      errors: null,
      user: res.locals.user,
    });
  }

  const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id);

  if (updateResult) {
    req.flash("notice", `You\'re account password was successfully updated.`);
    res.status(201).render("account/account.ejs", {
      title: "Account Management",
      nav,
      errors: null,
      user: res.locals.user,
    });
  } else {
    req.flash("notice", `Sorry, the password update failed.`);
    res.status(501).render("account/edit.ejs", {
      title: "Edit Account Details",
      nav,
      errors: null,
      user: res.locals.user,
    });
  }
}

/* ****************************************
 *  Render admin panel view
 * *************************************** */
async function buildAdminPanel(req, res, next) {
  // Renderiza la vista del panel de administrador
  let nav = await utilities.getNav();
  const allUsers = await utilities.sortUsersById(await accountModel.getAllAccounts());
  const options = await accountModel.getAccountTypes();
  res.render("account/admin.ejs", {
    title: "Admin Panel",
    nav: nav,
    errors: null,
    user: res.locals.user,
    tableData: allUsers,  // Pasa los datos de todos los usuarios
    options: options,  // Tipos de cuenta para el admin
  });
  next();
}

/* ****************************************
 *  Process admin bulk update
 * *************************************** */
async function processAdminBulkUpdate(req, res, next) {
  // Procesa la actualización masiva de cuentas por parte del admin
  let nav = await utilities.getNav();
  let accounts = await utilities.sortUsersById(req.body.accounts);
  const options = await accountModel.getAccountTypes();
  
  const results = await Promise.all(
    accounts.map(async (account) => {
      let originalAccount = await accountModel.getAccountById(account.account_id);

      let thisResult = await accountModel.updateAccountInfo(account.account_id, account.account_firstname, account.account_lastname, account.account_email, account.account_type);

      if (account.account_firstname !== originalAccount.account_firstname || account.account_lastname !== originalAccount.account_lastname || account.account_email !== originalAccount.account_email || account.account_type !== originalAccount.account_type) {
        req.flash("notice", `Account ${account.account_id + " " + account.account_email} was updated.`);
      }

      if (!thisResult) {
        req.flash("notice", `An error occurred for user ${account.account_id + " " + account.account_email} failed to update.`);
      }
      return thisResult;
    })
  );

  const sortedResults = await utilities.sortUsersById(results);
  res.render("account/admin.ejs", {
    title: "Admin Panel",
    nav: nav,
    errors: null,
    user: res.locals.user,
    tableData: sortedResults,
    options: options,
  });
}

module.exports = {
  buildRegister,
  registerAccount,
  buildLogin,
  accountLogin,
  accountLogout,
  buildAccount,
  buildEditAccount,
  updateAccountInfo,
  updateAccountPassword,
  buildAdminPanel,
  processAdminBulkUpdate,
};
