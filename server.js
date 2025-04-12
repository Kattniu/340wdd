/* ******************************************
 * server.js - Archivo principal de la aplicación.
 * Controla toda la configuración del servidor.
 *******************************************/

/* ===============================
 * 1. REQUERIMIENTOS (DEPENDENCIAS)
 * =============================== */
require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Base de datos y utilidades personalizadas
const pool = require("./database/");
const static = require("./routes/static");
const catchErrorsRoute = require("./routes/errorRoute.js");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/index.js");

// Mostrar en consola que se cargó la URL de la BD
console.log("DATABASE_URL:", process.env.DATABASE_URL);

/* ===============================
 * 2. CONFIGURACIÓN DE LA APP
 * =============================== */
const app = express();

/* ===============================
 * 3. MIDDLEWARES GENERALES
 * =============================== */

// Configuración de sesiones con PostgreSQL
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Middleware de mensajes flash (para notificaciones)
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Parseo del cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mostrar en consola cada request que llega
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Habilita el uso de cookies
app.use(cookieParser());

// Verifica si el usuario tiene token JWT válido
app.use(utilities.checkJWTToken);

/* ===============================
 * 4. CONFIGURACIÓN DE VISTAS
 * =============================== */
// Motor de plantillas EJS + uso de layouts
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Ruta del layout principal

/* ===============================
 * 5. DEFINICIÓN DE RUTAS
 * =============================== */

// Rutas de archivos estáticos
app.use(static);

// Ruta principal (Home)
app.get("/", utilities.handleErrors(baseController.buildHome));

// Rutas del inventario
app.use("/inv", require("./routes/inventoryRoute.js"));

// Rutas relacionadas a usuarios / cuentas
app.use("/account", require("./routes/accountRoute.js"));

/* ===============================
 * 6. MANEJO DE ERRORES (FINAL)
 * =============================== */

// Middleware para errores generales (debe ir al final siempre)
app.use(catchErrorsRoute);

/* ===============================
 * 7. CONFIGURACIÓN DEL SERVIDOR
 * =============================== */

// Valores desde .env
const port = process.env.PORT;
const host = process.env.HOST;

// Iniciar el servidor
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}🚀`);
});
