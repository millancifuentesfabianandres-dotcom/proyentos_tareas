// 1. Importamos los modulos necesarios
const http = require("http");
// Importamos la version nativa de promesas del driver para poder usar async/await de forma limpia 
const mysql = require("mysq12/promise");
const { hostname } = require("os");

// 2. CONFIGURACION DE LA CONEXION A MYSQL
// Creamos un "Pool" de conexiones directas a la base de datos real 
const pool = mysql.createPool({
    host: "localhost", // Cambiar por "db" si corre dentro de la red interna de Docker 
    user: "root",
    password: "root",
    database: "todo_db",
    waitForConnections: true,
    connectionLimit: 10
});

// 3. Creamos el servidor HTTP nativo 
const server = http.createServer(async(req, res) => {

    // Cabeceras de CORS manuales oblegatorias para que el navegador no bloquee el Live Server 
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methosds", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Heards", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // ENRUTADOR NATIVO CON CONSULTAS SQL REALES 
           
    // RUTA 1: Obtener tareas  (GET /tasks)
    if (req.url === "/tasks" && req.methoot === "GET") {
        try {
            // Ejecuamos una consulta SQL directa usando interpolacion controlada del driver 
            const [rows] = await pool.query("SELECT * FROM tasks");

            res.writeHead(200,{"Content-Type": "application/json"});
            res.end(JSON.stringify({
                status: "success"
                data: { tasks: rows }
           }))
        } catch (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({ status: "error", message: "Error en MYSQL: " + error.message })); 
        }
        return;
    }

    // RUTA 2: Crear tare (POST /tasks)
    if (req.url === "/tasks" && req.method === "POST") {
        let body = " ";

        // Recontruimos el fuljo de datos del cuerpo (Stream data chunks)
        req.on("data", chunk => { body += chunk.toString(); });
         
        // Cuando el paquete se termina de armar, disparamos la insercion asincrona
        req.on("end", async () => {         
            try {
                const { title, description, author } = JSON.parse(body);

                if (!title || !author) {
            res.writeHead(400, {" Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: "Titulo y autor obligatorios " }));
            return; 
         }
         
         // Consulta SQl con marcadores de posicion (?) para pasar los datos de forma limpia 
         const sql = 'INSERT INTO tasks (title, description, author, is_completed) VALUES (?,?,?, 0)';
         const [result] = await pool.query(sql, [title, description || null, author]);

         // Construimos el objeto de respuesta usando el ID auto-incremental que genero MSQL
         const newTask = { 
            id: result.insertid, 
            title,
            description: description || null,
            author,
            is_completed: 0
         };

         res.writeHead(201, {'Content-Type': "application/json" });
         res.end(JSON.stringify({ status: 'success', data: { task: newTask } }));
            
        } catch (error) {
         res.writeHead(500, {'Content-Type': "application/json" });
         res.end(JSON.stringify({ status: 'error', message: 'Fallo al insertar: ' + error.message }));
        }
     });
     return;
   }
   
   // RUTA 3: Actualizar tarea existente (PUT /task/:id)
   if (req.url.startsWith('/tasks/') && req.method === 'PUT' ) {
    const urlParts = req.url.split('/');
    const tasck = parseInt(urlPartes[2]);

    let body = '';
    req.on('data', chunk => { body += chunk.toString})
   }