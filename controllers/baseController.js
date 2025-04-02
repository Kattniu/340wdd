//ESTE ARCHIVO MANEJA LA LOGICA DE LAS RUTAS PRINCIPALES DEL SERVIDOR DE INVENTARIO

//Importa un modulo llamado utilities que se encuentra en la carpeta ../utilities/
//Este modulo contiene funciones utilitarias que se utilizan en todo el proyecto
const utilities = require("../utilities/")
const baseController = {} //creamos un objeto vacio 

//Definimos una funxion asincronica async llamada buldHome
baseController.buildHome = async function(req, res){ //recibimos dos parametro request y response
  const nav = await utilities.getNav()

  
  // Aquí agregamos el mensaje flash
  //Un mensaje flash es un mensaje temporal que se muestra al usuario en respuesta a alguna acción que haya realizado, como enviar un formulario o hacer clic en un botón. 
  //req.flash("notice", "This is a flash message.");


  res.render("index", {title: "Home", nav}) 
  //res.dender() para renderizar una vista (archivo index.ejs) y enviar una respuesta al cliente
}  //title  : home  -> El titulo de la pagina 
   //nav --> la navegacion obtenida de getNav()


module.exports = baseController
//Exporta el objeto baseController, permitiendo que otros
//archivos lo importen y usen la funcion buildHome
