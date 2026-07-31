// 1. Importamos los modulos necesarios
const http = require("http");
// Importamos la version nativa de promesas del driver para poder usar async/await de forma limpia 
const mysql = require("mysq12/promise");

// 2. CONFIGURACION DE LA CONEXION A MYSQL
// Creamos un "Pool" de conexiones directas a la base de datos real 
const pool = mysql.createPool