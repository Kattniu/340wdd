// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildItemDetailById);

// Route to management view
router.get("/", invController.buildMgmtView);

// Route to Add Classification view
router.get("/add-classification", invController.buildAddClassificationView);

// Route to add a new classification from the user
router.post(
  "/add-classification",
  inventoryValidate.classificationRules(),
  inventoryValidate.checkClassificationData,
  invController.addNewClassificationFromUser
);

// Route to Add Vehicle view
router.get("/add-inventory", invController.buildAddVehicle);

// Route to add a new vehicle
router.post(
  "/add-inventory",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkVehicleData,
  invController.addNewVehicleFromUser
);

module.exports = router;