// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view - RUTA PARA EL DETALLE DEL VEHICULO
//Datail/:inv_id es la ruta que toma un ID del vehiculo en la URL
router.get("/detail/:inv_id", invController.buildItemDetailById);
module.exports = router;