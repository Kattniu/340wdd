// Importa el modelo de inventario y utilidades (como nav, dropdowns, etc.)
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const commentModel = require("../models/comment-model");

// Controlador del inventario – contiene funciones que responden a rutas
const invCont = {}

// Si no hay resultados, pasa al siguiente middleware (por ejemplo, al 404)
function skipControllerIfBlankResult(data, next){
    if (!data || data.length === 0) {      
        return next()
    }
}

// =============================
// Mostrar vehículos por categoría
// =============================
invCont.buildByClassificationId = async function (req, res, next) {
    console.log("in buildByClassificationId")
    const classification_id = req.params.classificationId // ID desde la URL
    const data = await invModel.getInventoryByClassificationId(classification_id) // Obtener vehículos
    skipControllerIfBlankResult(data, next) // Si no hay resultados, salta al siguiente middleware
    const grid = await utilities.buildClassificationGrid(data) // Generar grid HTML con info
    let nav = await utilities.getNav() // Obtener navegación
    const className = data[0].classification_name // Obtener el nombre de la categoría
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

// =============================
// Mostrar detalles de un vehículo con comentarios
// =============================
invCont.buildByInventoryId = async function (req, res, next) {
    console.log('in buildByInventoryId')

    // Obtener el ID del vehículo desde la URL
    const inv_id = req.params.inventoryId

    // Consultar los datos del vehículo
    const data = await invModel.getInventoryByInventoryId(inv_id)
    
    // Si no se encontró nada, pasar al siguiente middleware (como 404)
    skipControllerIfBlankResult(data, next)

    // Tomamos el primer (y único) resultado
    const vehicle = data[0]

    // Generar el HTML con los detalles del vehículo
    const grid = await utilities.buildInventoryGrid(data)

    // Obtener la navegación
    const nav = await utilities.getNav()

    // Crear el título dinámico (ej. "2022 Toyota Corolla")
    const title = `${vehicle.inv_year} ${vehicle.inv_model} ${vehicle.inv_make}`

    // === 🔽 Agregar lógica para comentarios ===
    // Obtener todos los comentarios para este vehículo
    const comments = await commentModel.getCommentsByInvId(inv_id)
    // Verificar si hay un usuario con sesión iniciada
    const account_id = res.locals.user?.account_id || null

    // Renderizar la vista con toda la información
    res.render('./inventory/details.ejs', {
        title,         // Título de la página
        nav,           // Navegación superior
        grid,          // HTML con los detalles del vehículo
        comments,      // Lista de comentarios para mostrar
        inv_id,        // ID del vehículo (usado en el formulario)
        account_id,    // ID del usuario actual, si hay sesión
        errors: null   // Para validación futura (opcional)
    })
}
// =============================
// Procesar la adición de un comentario
// =============================
invCont.addComment = async function (req, res) {
    console.log("Inside addComment - req.session:", req.session);
    const { inv_id, comment_text } = req.body;
    const account_id = req.session.accountData?.account_id; // Obtén el ID del usuario de la sesión

    if (!account_id) {
        req.flash('notice', 'Debes iniciar sesión para dejar un comentario.');
        return res.redirect(`/account/login`);
    }

    if (inv_id && comment_text && account_id) {
        const result = await commentModel.addComment(inv_id, account_id, comment_text);

        if (result) {
            req.flash('notice', '¡Comentario añadido!');
            return res.redirect(`/inv/detail/${inv_id}`); // Redirige de vuelta a los detalles del vehículo
        } else {
            req.flash('notice', 'Hubo un error al añadir el comentario.');
            return res.redirect(`/inv/detail/${inv_id}`); // Redirige de vuelta a los detalles del vehículo
        }
    } else {
        req.flash('notice', 'Todos los campos son requeridos para dejar un comentario.');
        return res.redirect(`/inv/detail/${inv_id}`); // Redirige de vuelta a los detalles del vehículo
    }
};

// ==================================
// Página principal de administración
// ==================================
invCont.buildVehicleManager = async function (req,res, next) {
    let nav = await utilities.getNav()
    classDrop = await utilities.buildClassificationDropdown()
    res.render("./inventory/managment.ejs", {
        title: 'Vehicle Management',
        nav,
        classDrop,
    })
}

// =============================================
// Mostrar formulario para añadir una clasificación
// =============================================
invCont.buildAddClass =  async function (req,res, next) {
    console.log('in buildAddClass')
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification.ejs", {
        title: 'Add New Classification',
        nav,
        errors: null,
    })
}

// =========================================
// Mostrar formulario para añadir inventario
// =========================================
invCont.buildAddInv =  async function (req,res, next) {
    let nav = await utilities.getNav()
    let classDrop = await utilities.buildClassificationDropdown()
    res.render("./inventory/add-inventory.ejs", {
        title: 'Add New Inventory',
        nav,
        errors: null,
        classDrop
    })
}

// ==========================
// Procesar nueva clasificación
// ==========================
invCont.addClass = async function(req,res){
    const {classification_name} = req.body; // Obtener nombre desde form
    const addResult = await invModel.addInventoryClassByName(classification_name)

    if (addResult){
        let nav = await utilities.getNav()
        req.flash('notice',`You're classification '${classification_name}' has been added to the system.`)
        res.status(201).render("inventory/managment.ejs", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        let nav = await utilities.getNav()
        req.flash('notice', `The classification '${classification_name}' could not be added. Please try again later.`)
        res.status(501).render("inventory/managment.ejs",{
            title:"Add New Classification",
            nav,
            errors: null,
        })
    }
}

// ===============================
// Procesar nuevo inventario (auto)
// ===============================
invCont.addInv = async function(req,res){
    console.log('in addClass')
    const {
        classification_id, inv_make, inv_model,
        inv_year, inv_description, inv_image,
        inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    const addResult = await invModel.addInventoryItem(
        classification_id, inv_make, inv_model, inv_year,
        inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color
    )

    if (addResult){
        let nav = await utilities.getNav()
        req.flash('notice',`The ${inv_color} ${inv_year} ${inv_make} ${inv_model} has been added successfully to inventory system.`)
        res.status(201).render("inventory/managment.ejs", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        let nav = await utilities.getNav()
        let classDrop = await utilities.buildClassificationDropdown(classification_id)
        req.flash('notice', `The ${inv_color} ${inv_year} ${inv_make} ${inv_model} could not be added due to a database error. Please try again later.`)
        res.status(501).render("inventory/add-inventory.ejs",{
            title:"Add New Inventory",
            nav,
            errors: null,
            classDrop,
            classification_id,
            inv_make,inv_model, inv_year,
            inv_description, inv_image,
            inv_thumbnail, inv_price,
            inv_miles, inv_color
        })
    }
}
// ====================================
// API JSON: Obtener autos por categoría
// ====================================
invCont.getInventoryJSON = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id){
        return res.json(invData) // Enviar data como JSON (AJAX o fetch)
    } else {
        next(new Error("No data found"))
    }
}
// =============================
// Formulario para editar vehículo
// =============================
invCont.buildEditInv = async function (req, res, next) {
    console.log('in buildEditInv')
    const inventory_id = parseInt(req.params.inventoryId)
    let nav = await utilities.getNav()
    const invItemData = await invModel.getInventoryByInventoryId(inventory_id)
    const invItem = invItemData[0]
    let classDrop = await utilities.buildClassificationDropdown(invItem.classification_id)
    const itemName = `${invItem.inv_make} ${invItem.inv_model}`
    res.render("./inventory/edit-inventory.ejs", {
        title: `Edit ${itemName}`,
        nav,
        errors: null,
        classDrop,
        inv_id: invItem.inv_id,
        inv_make: invItem.inv_make,
        inv_model: invItem.inv_model,
        inv_year: invItem.inv_year,
        inv_description: invItem.inv_description,
        inv_image: invItem.inv_image,
        inv_thumbnail: invItem.inv_thumbnail,
        inv_price: invItem.inv_price,
        inv_miles: invItem.inv_miles,
        inv_color: invItem.inv_color,
        classification_id: invItem.classification_id,
    })
}

// ==============================
// Procesar edición del vehículo
// ==============================
invCont.updateEditInv = async function(req,res){
    let nav = await utilities.getNav()
    const {
        inv_id, inv_make, inv_model, inv_description,
        inv_image, inv_thumbnail, inv_price,
        inv_year, inv_miles, inv_color, classification_id
    } = req.body

    const updateResult = await invModel.updateInventoryItem(
        inv_id, inv_make, inv_model, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_year,
        inv_miles, inv_color, classification_id
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const classDrop = await utilities.buildClassificationDropdown(classification_id)
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory.ejs", {
            title: `Edit ${inv_make} ${inv_model}`,
            nav,
            classDrop: classDrop,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

// ========================================
// Mostrar página de confirmación de borrado
// ========================================
invCont.buildDeleteInv = async function (req, res, next) {
    console.log('in buildEditInv')
    const inventory_id = parseInt(req.params.inventoryId)
    let nav = await utilities.getNav()
    const invItemData = await invModel.getInventoryByInventoryId(inventory_id)
    const invItem = invItemData[0]
    let classDrop = await utilities.buildClassificationDropdown(invItem.classification_id)
    res.render("./inventory/delete-confirm.ejs", {
        title:  `Delete ${invItem.inv_make} ${invItem.inv_model}`,
        nav,
        errors: null,
        classDrop,
        inv_id: invItem.inv_id,
        inv_make: invItem.inv_make,
        inv_model: invItem.inv_model,
        inv_year: invItem.inv_year,
        inv_price: invItem.inv_price,
    })
}

// =============================
// Procesar eliminación de auto
// =============================
invCont.deleteInv = async function(req,res){
    console.log('in deleteInv')
    const { inv_id } = req.body
    const invIdInt = parseInt(inv_id)
    const deleteResult = await invModel.deleteInventoryItem(invIdInt)

    if (deleteResult) {
        const deletedItemName = deleteResult.inv_make + " " + deleteResult.inv_model
        req.flash("notice", `The ${deletedItemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        req.flash("notice", "Sorry, the deletion failed.")
        res.redirect(`/inv/delete/${inv_id}`)
    }
}


module.exports = invCont
