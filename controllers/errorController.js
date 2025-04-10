const utilities = require("../utilities/")
const errorCont = {} //Crea un objeto vacío llamado errorCont, 
                   // donde se guardarán funciones relacionadas con el manejo de errores.
              
errorCont.BuildByErrorCode = async function (req, res, next) { //Recibe la petición (req), respuesta (res) y el siguiente middleware (next).
                                                             //Se asigna como propiedad del objeto errorCont.
    
    console.log("in errorCont.BuildByErrorCode")
    console.log('known status', req.path.split("/")[2])

    // falsy defaults to 404
 const status = parseInt(req.path.split("/")[2]) || 404 //Intenta convertir el valor de la URL en un número.
                                                        //Si no encuentra un número, por defecto usa 404.

 let message //Inicializa una variable para el mensaje de error que se mostrará.



switch (status) {
    case 500:
        message = "Our engine broke down! We're sorry for the inconvenience. Try ductaping it!"
        break;
    default:
        message = '<br>Render fender bender!🚧💥🚙 <br>You\'ve bumped into an unknown page, but the rest of the site is roadworthy!”<br>🚗💥🚙<br> <a href="/">Return home</a>'
        break;
}

return {status, message} //Devuelve un objeto con el estado y el mensaje de error.

}

module.exports = errorCont //Exporta el objeto errorCont para que pueda ser utilizado en otros archivos de la aplicación