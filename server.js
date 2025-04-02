/* *******************************************
 *🍕 Require Statements (Importación de módulos)
 *********************************************/
const express = require("express"); // Importar Express
const expressLayouts = require("express-ejs-layouts"); // Manejo de layouts con EJS
const env = require("dotenv").config(); // Cargar variables de entorno desde .env
const session = require("express-session"); // Manejo de sesiones
const bodyParser = require("body-parser"); // Middleware para analizar cuerpos de solicitudes

// Importar rutas, controladores y utilidades
const static = require("./routes/static"); // Rutas para archivos estáticos
const baseController = require("./controllers/baseController"); // Controlador principal
const inventoryRoute = require("./routes/inventoryRoute"); // Rutas de inventario
const accountRoute = require("./routes/accountRoute"); // Rutas de cuenta
const utilities = require("./utilities/"); // Funciones de utilidad
const pool = require("./database"); // Conexión a la base de datos

// Crear instancia de la aplicación Express
const app = express();




/* **********************************************************
 *🍕 Middleware (Gestión de sesiones)
 ***********************************************************/
app.use(
  session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true, // Crear la tabla de sesiones si no existe
    pool, // Grupo de conexiones a la base de datos
  }),
  secret: process.env.SESSION_SECRET, // Clave secreta para firmar la sesión
  resave: true, // Guardar sesión en DB si se modifica
  saveUninitialized: true,
  name: 'sessionId', // Nombre de la cookie de sesión
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
/* *********************************************************************************************
 * 🍕 Configuración del Motor de Vistas y Templates
 *********************************************************************************************/
app.set("view engine", "ejs"); // Configurar EJS como motor de vistas
app.use(expressLayouts); // Activar layouts en EJS
app.set("layout", "./layouts/layout"); // Especificar el archivo base para los layouts




/* ***************************************************************************************
 * 🍕 Routes: Definición de rutas 
 ***************************************************************************************/
app.use(static); // Servir archivos estáticos (CSS, imágenes, JS)
                 // Carga rutas de archivos estáticos
// Ruta principal(Homa page)
app.get("/", utilities.handleErrors(baseController.buildHome));

// Ruta de inventario
app.use("/inv", inventoryRoute);// Cualquier ruta que comience con "/inv" será manejada por inventoryRoute

// Ruta de cuenta
app.use("/account", accountRoute); // Cualquier ruta que comience con "/account" será manejada por accountRoute
/* ******************************************************************************************
 * 🍕 Middleware- Process Registration Activity 
 ******************************************************************************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // Middleware para analizar cuerpos de solicitudes

 

/* ******************************************************************************************
 * 🍕 Middleware de Manejo de Errores (404 y 500)
 ******************************************************************************************/
// Esta ruta se activa si ninguna otra coincide, generando un error 404
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav(); // Obtener la navegación
  console.error(`Error en: "${req.originalUrl}": ${err.message}`);
  let title, message;
  if (err.status == 404) {
    title = "404 - Page Not Found";
    message = err.message;
    res.render("errors/404", { title, message, nav });
  } 
//Error 500 - Server Error (error de servidor)  
  else {
    title = "500 - Error del Servidor";
    message = "El servidor no pudo procesar tu solicitud en este momento. Intenta de nuevo más tarde.";
    res.status(500).render("errors/500", { title, message, nav });
  }
});



/* *************************************************
 * 🍕 Configuración del Servidor (Host y Puerto)
 *************************************************/
const port = process.env.PORT;
const host = process.env.HOST;



/* **********************************************************
 * 🍕 Iniciar el Servidor
 ***********************************************************/
// Valores extraídos del archivo .env
app.listen(port, () => {
  console.log(`✅ App escuchando en: ${host}:${port} 🚀`);
});
