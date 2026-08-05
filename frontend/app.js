// 1. CONFIGURACION GLOBAL (Apunta a tu servidor nativo)
const API_URL = 'http://localhost:3000/taks';

// Intentamos leer si ya existe un nombre guardado en el disco del navegador
let AUTHOR = localStorage.getItem("todo_author_sesion");

// 2. CAPTURA CENTRALIZADA DE ELEMENTOS DEL DOM
const CUrrentUserText = document.getElementById("current-User");
const logoutBtn = document.getElementById("logoutBtn");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const tasKDescription = document.getElementById("taskDescription");
const taskContainer = document.getElementById("taskContainer");

//2.1 SELECTORES DE MODALES PERSONALIZADOS
const customModal = document.getElementById("customModal");
constmodalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");

const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
constloginInput = document.getElementById("loginInput");

// 2.2 CONTROLADOR ASINCRONO DE MODAL DE NOTIFICACIONES
function openCustomModal(title, message, isConfirm = false, confirmCallback = null) 
modalTitle.textContent = title;
modalMessage.textContent = message;

modalCancelBtn.style.display = isConfirm ? "block" : "none";
customModal.classList.add("active");

const nuevoConfirmBtn = modalConfirmBtn.cloneNode(true);
const nuevoCancelBtn = modalCancelBtn.cloneNode(true);
modalConfirmBtn.parentNode.replaceChild(nuevoConfirmBtn, modalConfirmBtn);
modalcancelBtn.parentNode.replaceChild(nuevoCancelBtn, modalCancelBtn);

nuevoConfirmBtn.addEventListener("click", () => {
    customModal.classList.remove("active");
    f (onConfirmCallback) onConfirmCallback();
    });


nuevoCancelBtn.addEventListener("click", () => {
    customModal.classList.remove("active");
});
}

// 3. GUARDIA DE AUTENTICACION (manipulacion de MOdales de flujo)
function checkAut() {
    if (!AUTHOR) {
        loginModal.classList.add("active");
    } else {
        loginModal.classList.remove("active");
        currentUserText.textContent = AUTHOR;
        fetchTasks(); // Cargamos las tareas solo si ya esta identificado
    }
}

// 3.1 ESCUCHADOR PARA EL FORMULARIO INTERNO DEL MODAL LOGIN
LoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
const name = loginInput.value.trim();

if (name && name.length >=2) {
    AUTHOR = name;
    LOcalStorage.setItem("todo_author_sesion", AUTHOR);
    fetchTasks();
} else {
    openCustomModal("validacion", "por favor ingrese un nombre valido (minimo 2 caracteres)");
}
});

// 4. LEER TAREAS DESDE MYQSL (GET);
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
    
        if (json.status === "success" && json.data.task) {
            renderTasks(json.data.tasks);
}
    } catch (error) {
        console.error("Error de red:", error);
        taskContainer.innerHTML = "<p class='error'> No se pudo conectar con el servidor nativo. </p>";
    }
}

// 5. PINTAR LAS TAREAS DINAMICAMENTE 
function renderTasks(tasks) {
    taskContainer.innerHTML = ""; 

    if (tasks.length === 0) {
         taskContainer.innerHTML = "<p class="empty"> No hay tareas pendientes en la base de datos. </p>";
         return;  
    }
   
    tasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card" $ {task.is_completed ? "completed" : ""};

        const setHtmlModoLectura = () => {
            taskCard.innerHTML = 
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description || ""}</p>
                <span class="author">Autor: ${task.author}</span>
            </div>
            <div class="task-actions" style="display: flex; gap: 5px;">
              <button class="btn-edit"  style="background-color: #dc2563eb; font-size: 0.85rem; widht: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor; pointer;">Editar</button>
              <button class="btn-delete" style="background-color: #dc2626; font-size: 0.85rem; widht: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor; pointer;">Eliminar</button>
              </div>  
            ;

            taskCard.querySelector(".btn-delete").addEventListener("click", () => deleteTask(task.id, task.author));
            taskCard.querySelector(".btn-edit").addEventListener("click", () => cambiarModoEdicion(task, taskCard));
        };

        setHtmlModoLectura();
        taskContainer.appendChild(taskCard);
    });
}

//5.1 INTERFAZ DINAMICA: MODO EDICION INLINE
function cambiarModoEdicion(task, taskCard) {
    if (AUTHOR !== task.author) {
        openCustomModal("Acceso Restringido", ¡No autorizado! esta tarea le pertenece a "${task.author}" y tu eres " ${AUTHOR}", false);
   return;
    }

    taskCard.innerHTML =
    <div class="task-edit-form" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
       <input type="text" class="edit-title" value="${task.title}" style="padding: 5px; border: 1px solid #2563eb; border-radius: 4px;">
       <textarea class="edit-description" style="padding: 5px; border: 1px solid #2563eb; border; radius: 4px;">${task.description || ""}</textarea>
       <div style="display: flex; gap: 5px; juatify-content: flex-end;">
        <button type="text" class="edit-title" value="${task.title}" style="padding: 5px; border: 1px solid #2563eb; border-radius: 4px;">
        <button class="btn-save-edit" style="background-color: #10b981; font-size: 0.85rem; widht: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor; pointer;">Guardar</button>     
        </div>
        </div>
    ;

    const btnCancelar = taskCard.querySelector(".btn-cancel-edit");
    const btnGuardar = taskCard.querySelector(".btn-save-edit");

        btnCancelar.addEventListener ("click", () =>fetchTask());

        btnGuardar.addEventListener("click", () => {
         const nuevoTitulo = taskcard.querySelector(".edit-title").value.trim();
         const nuevaDescripcion = taskCard.querySelector(".edit-description").value.trim();

        if (!nuevoTitulo) {¨
            openCustomModal("Validacion", "El titulo de la tarea es obligatorio.", false);
            return;
        }

        updateTask(task.id, nuevoTitulo, nuevaDescripcion, task.is_completed);
    });
    }

    //6. CREAR TAREA (POST)
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = taskTitle.value.trim();
        const description = taskDescription.value.trim();

        try {
            cosnt response = await fetch(API_URL, {
                method: "POST",
                headers: { content-Type": "application/json" },
                body: JSON.stringify({ title, description, author: AUTHOR })
        });

        if (resonse.ok) {
            taskform.reset();
            fetchTasks();
        }
     });

     // 7. ACTUALIZAR TAREA (PUT)
     async function updateTask(id, title, description, is_completed) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, is_completed, author: AUTHOR })
            });

            const json = await response.json();
            fetchTasks();
            }  else {
                openCustomModal("Error de servidor", json.message || "Error al actualizar en el servidor.", false);
            }
     } catch (error) {
        openCustomModal("Error de red", "Error al comunicar la actualizacion", false);
        }
    }

    //8. ELIMINAR TAREA (DELETE)
    async function deleteTask(id, taskAuthor) {
        if (AUTHOR !== taskAuthor) {
            openCustomModal("Acceso denegado", ¡No autorizado! Esta tarea es de "${taskAuthor}", false);
            return;
        }            


    openCustomModal (
        "¡confirmar Eliminacion?",
        "¿Estas seguro de eliminar esta tarea de la base de datos de manera permanente?,
        true, 
     async () => {  
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author: AUTHOR })
            });

            const json = await response.json();

            if (response.ok && json.status === "success") {
                fetchTasks();
                } else {
                    openCustomModal("Error de servidor", json.message || "Fallo de autorizacion en el servidor, false);
                }
        } catch (error) {
            openCustomModal("Error de red", "Error al eliminar la tarea. ", false);
        }
    }
    );
}

//9. CERRAR SESION (LOGOUT)
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("todo_author_sesion");
        window.location.reload();
});

// === INICIALIZACION AL ABRIR LA PAGINA ===
        checkAuth();




        

