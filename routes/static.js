const express = require('express');
const router = express.Router();

//Rutas para mis archivs staticos (css,js y la imagenes)
router.use(express.static("public")); //carpeta public
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));
module.exports = router;



