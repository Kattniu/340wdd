const pool = require("../database/")

/* ***************************
 *  Get all classification data
 *  Obtener todas las clasificaciones ordenadas por nombre
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items with classification name by classification_id
 *  Obtener vehículos por ID de clasificación (con datos de la clasificación)
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
    console.error("getInventoryByClassificationId error: " + error)
  }
}

/* ***************************
 *  Get vehicle by inventory ID
 *  Obtener un vehículo específico por su ID
 * ************************** */
async function getInventoryByInventoryId(inv_id){
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByInventoryId error: " + error)
  }
}

/* ***************************
 *  Add new classification by name
 *  Agregar una nueva clasificación
 * ************************** */
async function addInventoryClassByName(inv_class){
  try {
    const data = await pool.query(
      `INSERT INTO public.classification (classification_name) VALUES ($1)`,
      [inv_class]
    )
    return data.rows
  } catch (error) {
    console.error("addInventoryClassByName error: " + error)
  }
}

/* ***************************
 *  Add new vehicle to inventory
 *  Agregar un nuevo vehículo al inventario
 * ************************** */
async function addInventoryItem(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color){
  try {
    const data = await pool.query(
      `INSERT INTO inventory (
         classification_id, inv_make, inv_model, inv_year,
         inv_description, inv_image, inv_thumbnail,
         inv_price, inv_miles, inv_color
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]
    )
    return data.rows
  } catch (error) {
    console.error("addInventoryItem error: " + error)
  }
}

/* ***************************
 *  Check if classification already exists
 *  Verificar si la clasificación ya existe
 * ************************** */
async function checkExistingClass(classification_name){
  try {
    const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("checkExistingClass error: " + error)
    return error.message
  }
}

/* ***************************
 *  Update an inventory item by ID
 *  Actualizar datos de un vehículo específico
 * ************************** */
async function updateInventoryItem(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
){
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4,
          inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8,
          inv_color = $9, classification_id = $10
      WHERE inv_id = $11 RETURNING *`
    const data = await pool.query(sql, [
      inv_make, inv_model, inv_description, inv_image,
      inv_thumbnail, inv_price, inv_year, inv_miles,
      inv_color, classification_id, inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("updateInventoryItem error: " + error)
  }
}

/* ***************************
 *  Delete a vehicle from inventory by ID
 *  Eliminar un vehículo del inventario
 * ************************** */
async function deleteInventoryItem(inv_id){
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *"
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("deleteInventoryItem error: " + error)
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInventoryId,
  addInventoryClassByName,
  checkExistingClass,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}
