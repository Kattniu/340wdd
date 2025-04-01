//ESTE ARCHIVO DEFINE LAS DEL SERVIDOR DE INVENTARIO. Contiene 
// las rutas para manejar las solicitudes relacionadas con el inventario de vehículos.
//contiene la logica para manejar las solicitudes HTTP relacionadas con el inventario de vehículos

/******************************************************************************************************************* */
// IMPORTACION DE RECURSOS:
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController"); //Se encaragara de manejar las solicitudes HTTP relacionadas con el inventario de vehículos
const inventoryValidate = require("../utilities/inventory-validation"); //Se encargara de validar los datos de entrada para las solicitudes relacionadas con el inventario de vehículos
/****************************************************************************************************************** */
// RUTAS GET- RECUPERACION DE DATOS DEL SERVIDOR

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
    /*Cuando alguien accede a "/type/:classificationId", se ejecuta invController.buildByClassificationId.
      Esto significa que, por ejemplo, si visitas /type/1, la aplicación mostrará 
      todos los vehículos de la clasificación con ID 1.*/

// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildItemDetailById);

// Route to management view
router.get("/", invController.buildMgmtView);
      /*Que hace esta ruta? Carga la vista de gestion del inventario, donde los administradores 
      pueden agregar o modificar vehiculos*/

// Route to Add Classification view
router.get("/add-classification", invController.buildAddClassificationView);
      /*¿Qué hace esta ruta?
        Muestra la vista donde los administradores pueden agregar una nueva clasificación 
        (como "SUV", "Sedán", "Camioneta", etc.).*/

// Route to Add Vehicle view
router.get("/add-inventory", invController.buildAddVehicle);
        /*¿Qué hace esta ruta?
        Muestra la vista donde los administradores pueden agregar un nuevo vehículo al inventario. */

/*********************************************************************************************************/
//RUTAS POST- ENviO DE DATOS AL SERVIDOR

// Route to add a new vehicle classification:
router.post(
  "/add-classification",
  inventoryValidate.classificationRules(), 
  // Se encarga de validar los datos de entrada para la clasificación RECIBE LOS DATOS DE UNA NUEVA CLASIFICACION 
  inventoryValidate.checkClassificationData, 
  // Se encarga de verificar los datos de la clasificación SI SON SCORRECTOS 
  invController.addNewClassificationFromUser 
  // Se encarga de agregar la nueva clasificación al inventario SI ES QUE TODO ESTA BIEN
);
   //ejemplo:
   //Si el usuario llena un formulario con "SUV" como nombre de la clasificación y lo envía, esta ruta lo guardará en la base de datos.


// Route to add a new vehicle
router.post(
  "/add-inventory",
  inventoryValidate.vehicleRules(), // Se encarga de validar los datos de entrada para el vehículo RECIBE LOS DATOS DE UN NUEVO VEHICULO
  inventoryValidate.checkVehicleData, // Se encarga de verificar los datos del vehículo SI SON SCORRECTOS
  invController.addNewVehicleFromUser // Se encarga de agregar el nuevo vehículo al inventario SI ES QUE TODO ESTA BIEN
); 
    //ejemplo:
    //Si un administrador llena un formulario con un nuevo auto (Toyota Corolla 2022, $20,000), esta ruta lo guardará en la base de datos.

module.exports = router;
//PERMITE que este router reusado en otros archivos, como el archivo principal del servidor (server.js)
//Esto significa que todas LAS RUTAS definidas aqui estaran disponibles bajo  /inventory/