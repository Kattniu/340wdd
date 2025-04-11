// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/index.js")
const invValidate = require('../utilities/inventory-validation.js')

// Route to load the vehicle management view (must be logged in)
router.get("/",
    utilities.checkLogin, 
    utilities.handleErrors(invController.buildVehicleManager))

// Route to show the form to add a new classification (admin only)
router.get("/addClass",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    utilities.handleErrors(invController.buildAddClass))

// Route to handle the POST request for adding a new classification
router.post("/addClass",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    invValidate.addClassRules(), // Validation rules
    invValidate.checkAddClassData, // Validation result checking
    utilities.handleErrors(invController.addClass))

// Route to show the form to add a new vehicle (admin only)
router.get("/addInv",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    utilities.handleErrors(invController.buildAddInv))

// Route to handle the POST request for adding a new vehicle
router.post("/addInv",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    invValidate.addInvRules(), // Validation rules
    invValidate.checkAddInvData, // Validation result checking
    utilities.handleErrors(invController.addInv))

// Route to build inventory by classification ID
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to show detailed view for a specific inventory item
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

// Route to get inventory JSON data based on classification ID
router.get("/getInventory/:classificationId", utilities.handleErrors(invController.getInventoryJSON))

// Route to show the form to edit an existing inventory item
router.get("/edit/:inventoryId",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    utilities.handleErrors(invController.buildEditInv))

// Route to handle update submission for inventory item
router.post("/update/",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    invValidate.addInvRules(), // Reuses the same validation rules as add
    invValidate.checkAddInvData,
    utilities.handleErrors(invController.updateEditInv))

// Route to show confirmation page for deleting inventory item
router.get("/delete/:inventoryId",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    utilities.handleErrors(invController.buildDeleteInv))

// Route to handle the deletion of an inventory item
router.post("/delete/",
    utilities.checkLogin, 
    utilities.accountTypeCheck,
    utilities.handleErrors(invController.deleteInv))

// Export the router to be used in the main app
module.exports = router;
