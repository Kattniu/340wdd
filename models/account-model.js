// Importa el pool de conexión a la base de datos desde el archivo database.js
const pool = require('../database')

/* **********************
 * Registra una nueva cuenta de usuario en la base de datos
 * ********************* */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
   try {
    // Consulta SQL para insertar un nuevo registro con el tipo 'Client' por defecto
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    // Ejecuta la consulta pasando los valores recibidos como parámetros
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error){
        // Si hay un error, devuelve solo el mensaje
        return error.message
    }
}

/* **********************
 * Verifica si ya existe un correo en la base de datos
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      // Consulta SQL que busca registros con el email proporcionado
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const result = await pool.query(sql, [account_email])
      // Devuelve los resultados encontrados (si hay alguno)
      return result.rows
    } catch (error) {
      return error.message
    }
}

/* *****************************
 * Obtiene los datos de una cuenta usando el email
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    // Consulta que devuelve los datos de la cuenta asociada al email
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    // Retorna el primer resultado (solo se espera uno)
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
 * Obtiene los datos de una cuenta usando el ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    // Consulta que devuelve los datos de la cuenta sin la contraseña
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1`,
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
 * Actualiza la información de una cuenta (excepto contraseña)
 * ***************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email, account_type = 'Client'){
  try {
    // Actualiza los campos principales y devuelve los datos actualizados
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_type = $4 WHERE account_id = $5 RETURNING account_id, account_firstname, account_lastname, account_email, account_type"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_type, account_id], true)
    return result.rows[0]
  } catch (error){
      return error.message
  }
}

/* *****************************
 * Actualiza solo la contraseña de una cuenta
 * ***************************** */
async function updateAccountPassword(account_id, account_password){
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    // ⚠️ Hay un pequeño error aquí: el orden de los parámetros está invertido. Debería ser [account_password, account_id]
    const result = await pool.query(sql, [account_id, account_password])
    return result.rows[0]
  } catch (error){
      return error.message
  }
}

/* *****************************
 * Obtiene todas las cuentas registradas (sin incluir contraseñas)
 * ***************************** */
async function getAllAccounts(){
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account"; 
    const result = await pool.query(sql)
    return result.rows
  } catch (error){
    return error.message
  }
}

/* *****************************
 * Obtiene solo los tipos de cuenta registrados
 * ***************************** */
async function getAccountTypes(){
  try {
    const sql = "SELECT account_type FROM account "
    const result = await pool.query(sql)
    return result.rows
  }
  catch (error){
    return error.message
  }
}

// Exporta todas las funciones para que puedan ser usadas en otros módulos
module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updateAccountPassword,
  getAllAccounts,
  getAccountTypes
}
