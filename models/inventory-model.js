const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = {getClassifications}
/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId};

//const pool = require("../database/index.js");

// /* ***************************
//  *  Get all classification data
//  * ************************** */
// async function getClassifications() {
//   return await pool.query(
//     "SELECT * FROM public.classification ORDER BY classification_name"
//   );
// }

// /* ***************************
//  *  Get all inventory items and classification_name by classification_id
//  * ************************** */
// async function getInventoryByClassificationId(classification_id) {
//   try {
//     const data = await pool.query(
//       `SELECT * FROM public.inventory AS i 
//       JOIN public.classification AS c 
//       ON i.classification_id = c.classification_id 
//       WHERE i.classification_id = $1`,
//       [classification_id]
//     );
//     return data.rows;
//   } catch (error) {
//     console.error("Error in getclassificationsbyid error " + error);
//     throw error; // Propagate the error to the caller
//     //Si occure un error al consultar la base de datos, se lanza el error para que pueda ser manejado por el controlador o middleware correspondiente.
//     //Esto permite que el error sea manejado adecuadamente y se pueda enviar una respuesta adecuada al cliente.
//   }
// }

// async function getInventoryItemById(inv_id) {
//   try {
//     const data = await pool.query(
//       `SELECT * FROM public.inventory WHERE inv_id = $1`,
//       [inv_id]
//     );
//     return data.rows[0];
//   } 
//   catch (error) {
//     console.error("Error fetching inventory item id");
//   }
//   throw error;
// }

// module.exports = {
//   getClassifications,
//   getInventoryByClassificationId,
//   getInventoryItemById,
// };