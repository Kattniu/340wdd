/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts") // Importar express-ejs-layouts
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");

/* ***********************
// View Engine and Templates
*************************/
app.set("view engine", "ejs") // Configurar EJS como el motor de vistas
app.use(expressLayouts) // Activar layouts en EJS
app.set("layout", "./layouts/layout") // Definir el archivo base para los layouts

/* ***********************
*Routes
*************************/
// Servir archivos estáticos (CSS, imágenes, JS)
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
//inventory route
//Esto significa que cualquier ruta de inventario, como /inventory/detail/:inv_id, ahora será manejada por el controlador adecuado.
app.use("/inv", inventoryRoute)

/* ******************************************
// File Not Found Route - must be last route in list
// ****************************************** */
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})
/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})