const invModel = require("../models/inventory-model"); // Import the inventory model
const utilities = require("../utilities/"); // Import the utilities module

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view - crear la funcio del controlador  para el detalle del vehiculo
 * Controlador de inventario que maneja la vista de detalle del vehiculo
 * ************************** */
invCont.buildItemDetailById = async function (req, res, next) {
  try {   
    //El parametro inv_id es tomado de la URL
    //Ejemplo: /inv/detail/1, el 1 es el ID del vehiculo
    //lo que permite obtener el ID del vehiculo que se desea ver
    const inv_id = req.params.inv_id; //Obtenemos el ID del vehiculo de la URL

    //Usas invmodel.getInventoryItemById para obtener los datos del vehiculo por ID
    const vehicleData = await invModel.getInventoryItemById(inv_id);//Obtenemos los datos del vehiculo por ID
    
    //Es importante que esta funcion en utilities este correctamente definida para generar el html que necesitas para la vista
    const vehicleHTML = await utilities.buildItemDetails(vehicleData);
    //Construimos el HTML del vehiculo usando la funcion buildItemDetails de utilities
    //La funcion buildItemDetails es la que genera el HTML para mostrar los detalles del vehiculo
    let nav = await utilities.getNav();
    res.render("./inventory/vehicle-details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    console.error("Error building vehicle detail view");
    next(error);
  }
};

module.exports = invCont;