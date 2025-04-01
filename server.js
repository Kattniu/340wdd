/* *******************************************
 *Require Statements (Importación de módulos)
 *********************************************/

// Importar Express y otros módulos necesarios
const express = require("express")
const expressLayouts = require("express-ejs-layouts") // Manejo de layouts con EJS
const env = require("dotenv").config() // Cargar variables de entorno desde .env

// Importar rutas, controladores y utilidades
const static = require("./routes/static") // Rutas para archivos estáticos
const baseController = require("./controllers/baseController") // Controlador principal
const inventoryRoute = require("./routes/inventoryRoute") // Rutas de inventario
const utilities = require("./utilities/") // Funciones de utilidad
const pool = require("./database") // Conexión a la base de datos

// Crear instancia de la aplicación Express
const app = express()


/* *********************************************************************************************
 *Configuración del Motor de Vistas y Templates
 ************************************************/

// Configurar EJS como el motor de vistas
app.set("view engine", "ejs")

// Activar el uso de layouts en EJS
app.use(expressLayouts)

// Especificar el archivo base para los layouts
app.set("layout", "./layouts/layout")


/* ***************************************************************************************
*Routes: Definición de rutas 
*****************************/
// Servir archivos estáticos (CSS, imágenes, JS)
app.use(require("./routes/static"))

// Index route - Ruta principal (home page)
app.get("/", utilities.handleErrors(baseController.buildHome))

//inventory route - Rutas de inventario 
// Cualquier ruta que comience con "/inv" será manejada por inventoryRoute
app.use("/inv", require("./routes/inventoryRoute"))


/* ******************************************************************************************
 *Manejo de Rutas No Encontradas (404 - 505) 
 ****************************************** */
// Esta ruta se activa si ninguna otra coincide, generando un error 404
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let title, message;
  if (err.status == 404) {
    title = "404 - Page Not Found";
    message = err.message;
    res.render("errors/404", {
      title,
      message,
      nav,
    });
  } else {
    title = "500 - Server Error";
    message = "The server couldn't process your request at this moment. Please try again later.";
    res.status(500).render("errors/500", {
      title,
      message,
      nav,
    });
  }
});

/* ***********************************************************************************
* Middleware de Manejo de Errores
* Place after all other middleware !!
***************************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
})

/* *************************************************
 * Configuración del Servidor (Host y Puerto)
 *************************/
// Valores extraídos del archivo .env
const port = process.env.PORT
const host = process.env.HOST

/* **********************************************************
 * Iniciar el Servidor
 *************************/

app.listen(port, () => {
  console.log(`✅ App listening on: ${host}:${port}`)
})