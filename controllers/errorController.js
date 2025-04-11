const utilities = require("../utilities/") // Importa funciones utilitarias personalizadas
const errorCont = {} // Crea un objeto vacío llamado errorCont, 
                     // donde se guardarán funciones relacionadas con el manejo de errores.

/* ******************************************
 * BuildByErrorCode - Middleware que construye
 * una respuesta basada en un código de error.
 * Used to return a message depending on error code.
 ******************************************/
errorCont.BuildByErrorCode = async function (req, res, next) {
    
    console.log("in errorCont.BuildByErrorCode") // Debug log para saber que la función fue invocada
    console.log('known status', req.path.split("/")[2]) // Muestra en consola la parte de la URL que contiene el código de error

    // Extrae el código de estado desde la URL (ej: /error/500)
    // Si no hay código, usa 404 como valor por defecto
    const status = parseInt(req.path.split("/")[2]) || 404 

    let message // Variable para almacenar el mensaje de error que será mostrado al usuario

    // Dependiendo del código de error, se elige un mensaje
    switch (status) {
        case 500: // Internal Server Error
            message = "Our engine broke down! We're sorry for the inconvenience. Try ductaping it!"
            break;
        default: // Any other status (e.g. 404 Not Found)
            message = '<br>🚧Roadblock ahead!💥<br>Don’t worry, it happens! Let’s get you back to safety.<br> 🚗💥🚙<br><a href="/">Return home</a>'
            break;
    }

    // Devuelve un objeto con el status y el mensaje para ser renderizado
    return {status, message}
}

module.exports = errorCont // Exporta el controlador de errores para usarlo en otros archivos
