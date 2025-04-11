// Importando las utilidades necesarias
const utilities = require("../utilities");

// Creando un objeto baseController que contendrá las funciones para manejar rutas
const baseController = {}

// Función para renderizar la vista de la página principal (home)
baseController.buildHome = async function(req, res) {
    // Esta línea está comentada, pero normalmente imprimiría las cookies del navegador
    // console.log("cookies: ", req.cookies);

    // Llama a la función getNav de utilities para obtener el menú de navegación
    const nav = await utilities.getNav();

    // Renderiza la vista 'index' y pasa la información para la vista: título de la página y la navegación
    res.render("index", { title: "Home", nav })  // Renderiza la página de inicio con el título "Home" y el nav dinámico
}

// Exportando el objeto baseController para que pueda ser utilizado en otros archivos
module.exports = baseController;
