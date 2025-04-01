//pg is a PostgreSQL client for Node.js
// This module exports a connection pool to a PostgreSQL database
const { Pool } = require("pg")  // Importa la clase Pool de la librería 'pg'
require("dotenv").config() // Carga las variables de entorno desde el archivo .env

 

// Create a new Pool instance to manage database connections
// The connection string is retrieved from the environment variables
let pool
if (process.env.NODE_ENV == "development") { //esta linea (process.env.NODE_ENV == "development") es para verificar si el entorno de desarrollo es igual a "development"
// si es así, se crea una nueva instancia de Pool con la cadena de conexión de la base de datos y la opción ssl
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, //toma la URL de la base de datos desde el archivo .env
    ssl: {
      rejectUnauthorized: false, // This option is used to disable SSL certificate validation
      // Esto evita errores cuando se conecta a una base de datos que usa SSL pero no tiene un certificado válido
    },
})



//DEPURACION DE CONSULTAS EN DESARROLLO
//Que hace esto? reemplaza pool.query() con una version personalisada que imprime la consulta en la consola antes de ejecutarla
// Esto es útil para depurar problemas de consultas durante el desarrollo
// Added for troubleshooting queries during development
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text }) // Muestra la consulta en consola
      return res
    } catch (error) {
      console.error("error in query", { text }) // Muestra el error en consola
      throw error
    }
  },
}




//Que hace esto? Si NO estamos en desarrollo, simplemente exporta el pool sin la version personalizada de query
// Esto es útil para producción, donde no necesitamos ver las consultas en la consola
} else { //exporta pool directamente sin la version personalizada de query
  // This is the production environment, so we just export the pool directly
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
}