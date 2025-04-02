/*******************************
*******ACCOUNT ROUTES***********
********************************/
//first: The file will need access to the following external resources:

// Importamos el paquete de express
const express = require('express');
// Usamos Router para definir nuestras rutas
const router = new express.Router();
// Importamos el archivo de utilities que tiene funciones útiles
const utilities = require('../utilities');
// Voy a crear el controller de cuentas más adelante (por ahora lo importamos)
const accountController = require('../controllers/accountController');


/*******************************
*******Deliver Login View***********
********************************/
//CREAR LA RUTA GET PARA "My Account"
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.post(
    "/login",
    utilities.handleErrors(accountController.accountLogin)
  );
  

/****************************
 * Process Registration******
*****************************/

router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);


module.exports = router;