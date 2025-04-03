const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};
/* ***************************
 *Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildItemDetailById = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await invModel.getInventoryItemById(inv_id);
    const vehicleHTML = await utilities.buildItemDetails(vehicleData);
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
/* ***************************
 *  Build the Management view
 * ************************** */
invCont.buildMgmtView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    next(error);
  }
};
/* ***************************
 *  Build the Add New Classification View, GET Request
 * ************************** */

invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering add classification view", error);
    next(error);
  }
};

/* ***************************
 *  POST Request, take data from the User inserted in the New Classification Form
 * ************************** */

invCont.addNewClassificationFromUser = async function (req, res, next) {
  try {
    const classification_name = req.body.classification_name;
    const newClassification = await invModel.insertNewClassification(
      classification_name
    );
    req.flash(
      "success",
      `The classification "${classification_name}" was successfully added.`
    );
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("error", "Failed to add classification. Please try again."); // Generic error message
    res.redirect("/add-classification"); // Redirect back to the form
  }
};

/* ***************************
 *  Build the dropdown in the add new vehicle form
 * ************************** */
  //Usamos la función buildClassificationList para obtener la lista de clasificaciones 
  // //y pasársela al formulario. Esta lista aparecerá como las opciones dentro del elemento <select> en la vista.
invCont.buildAddVehicle = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let dropdown = await utilities.getClassificationsDropdown();
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      dropdown,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering add vehicle view", error);
    next(error);
  }
};

/* ***************************
 *  POST request, take data from the user to add a new vehicle
 * ************************** */
invCont.addNewVehicleFromUser = async function (req, res, next) {
  try {
    const {
      classification,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body; // Receives for data.

    const newVehicle = await invModel.insertNewVehicle({
      classification_id: classification, // Mapping dropdown value to classification_id
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    }); // Pass data to the model
    req.flash(
      "success",
      `The vehicle "${inv_make} ${inv_model}" was successfully added.`
    );
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding vehicle:", error);
    req.flash("error", "Failed to add vehicle. Please try again.");
    res.redirect("/add-inventory");
  }
};

//Al hacer esto, estás asegurando que todas las funciones que has definido en el objeto invCont estén disponibles para usarse en tus rutas.
module.exports = invCont;