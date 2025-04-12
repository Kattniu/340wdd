// Se requieren los modelos y utilidades necesarias
const inventoryModel = require("../models/inventory-model")  // Modelo de inventario
const utilities = require(".")  // Utilidades generales
const { body, validationResult } = require("express-validator")  // Librería para validar y sanear datos en formularios
const validate = {}  // Objeto donde se guardan las reglas de validación

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */

// Reglas de validación para agregar una clasificación de inventario
validate.addClassRules = () => {
    return [
        // Se valida el campo "classification_name"
        body("classification_name")
        .trim()  // Elimina los espacios en blanco antes y después del texto
        .escape()  // Escapa caracteres especiales
        .notEmpty()  // Asegura que no esté vacío
        .isLength({ min: 3 })  // Asegura que tenga al menos 3 caracteres
        .isAlphanumeric()  // Solo permite caracteres alfanuméricos
        .withMessage("Please provide a valid classification name.")  // Mensaje de error si no pasa la validación
        .custom(async (classification_name) => {  // Función personalizada para verificar si la clasificación ya existe
            const classExists = await inventoryModel.checkExistingClass(classification_name)
            if (classExists.rowCount) {
                throw new Error("Classification already exists. Please enter a different classification name.")
            }
        })
    ]
}

// Reglas de validación para agregar un inventario de vehículo
validate.addInvRules = () => {
    console.log("in addInvRules")  // Solo para depuración
    return [
        // Validaciones para "classification_id", debe ser un campo no vacío
        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("The selected classification name cannot be used or was not selected."),
        
        // Validaciones para "inv_make" (marca del vehículo)
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .isAlphanumeric()
        .withMessage("The vehicle make is not the appropriate value."),
        
        // Validaciones para "inv_model" (modelo del vehículo)
        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .matches(/^[a-zA-Z0-9 ]+$/)  // Permite letras, números y espacios, no caracteres especiales
        .withMessage("The vehicle model is not the appropriate value."),
        
        // Validaciones para "inv_year" (año del vehículo)
        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .isLength({ min: 4, max: 4 })  // Debe tener 4 dígitos
        .withMessage("The vehicle year is not the appropriate value."),
        
        // Validaciones para "inv_description" (descripción del vehículo)
        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("The vehicle description is not the appropriate value."),
        
        // Validaciones para "inv_image" (imagen del vehículo)
        body("inv_image")
        .trim()
        .notEmpty()
        .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/)  // Valida la ruta de la imagen
        .withMessage("The vehicle image path is not the appropriate value."),
        
        // Validaciones para "inv_thumbnail" (miniatura del vehículo)
        body("inv_thumbnail")
        .trim()
        .notEmpty()
        .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/)
        .withMessage("The vehicle thumbnail is not the appropriate value."),
        
        // Validaciones para "inv_price" (precio del vehículo)
        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("The vehicle price is not the appropriate value."),
        
        // Validaciones para "inv_miles" (millas recorridas del vehículo)
        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("The vehicle miles is not the appropriate value."),
        
        // Validaciones para "inv_color" (color del vehículo)
        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isAlpha()  // Solo permite letras, no números ni caracteres especiales
        .withMessage("The vehicle color is not the appropriate value."),
    ]
}

/* ******************************
 * Check data and return errors or continue to add
 * ***************************** */

// Revisa si los datos de la clasificación son correctos antes de agregarla
validate.checkAddClassData = async (req, res, next) => {
    console.log("in checkAddClassData")  // Solo para depuración
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)  // Obtiene los errores de validación
    console.log("errors", errors)  // Muestra los errores (si los hay)
    if (!errors.isEmpty()) {  // Si hay errores, vuelve a renderizar el formulario con los errores
        let nav = await utilities.getNav()  // Obtiene la navegación del sitio
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",  // Título de la página
            nav,
            classification_name
        })
        return
    }
    next()  // Si no hay errores, continua con la ejecución
}

// Revisa si los datos del inventario son correctos antes de agregar el vehículo
validate.checkAddInvData = async (req, res, next) => {
    console.log("in checkAddInvData")  // Solo para depuración
    const { classification_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)  // Obtiene los errores de validación
    console.log("errors", errors)  // Muestra los errores (si los hay)
    if (!errors.isEmpty()) {  // Si hay errores, vuelve a renderizar el formulario con los errores
        let nav = await utilities.getNav()
        let classDrop = await utilities.buildClassificationDropdown()  // Crea un dropdown con las clasificaciones
        res.render("inventory/add-inventory.ejs", {
            errors,
            title: "Add New Inventory",  // Título de la página
            nav,
            classDrop,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
        return
    }
    next()  // Si no hay errores, continua con la ejecución
}

// Revisa si los datos para actualizar el inventario son correctos
validate.checkUpdateData = async (req, res, next) => {
    console.log("in checkAddInvData")  // Solo para depuración
    const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    const itemName = `${inv_make} ${inv_model}`  // Nombre del vehículo para mostrar en el título
    let errors = []
    errors = validationResult(req)  // Obtiene los errores de validación
    console.log("errors", errors)  // Muestra los errores (si los hay)
    if (!errors.isEmpty()) {  // Si hay errores, vuelve a renderizar el formulario con los errores
        let nav = await utilities.getNav()
        let classDrop = await utilities.buildClassificationDropdown()  // Crea un dropdown con las clasificaciones
        res.render("inventory/edit-inventory.ejs", {
            errors,
            title: `Edit ${itemName} Inventory`,  // Título de la página con el nombre del vehículo
            nav,
            classDrop,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()  // Si no hay errores, continua con la ejecución
}

// Exporta las reglas de validación para que puedan usarse en otros archivos
module.exports = validate
