# Sistema de Reservas de Salas

Aplicación web para gestionar reservas de salas universitarias con **Node.js**, **React** y **MySQL**.

## hacer que ande

```bash
docker-compose up -d  # iniciar mysql
npm install           # instalar dependencias
npm start             # iniciar el server
npm run import        # importar datos sql
npm run setpw         # import pwd
```

## tech

- **Frontend**: React 18 + Bootstrap 5
- **Backend**: Node.js + Express
- **Base de datos**: MySQL 8.0 (Docker)

## estructura

```
obligatorio2502/
├── web/                          # Frontend React
│   ├── index.html               # Página principal
│   └── js/
│       ├── App.js               # Componente principal de React
│       ├── utils.js             # Hook useApi para llamadas al servidor
│       ├── components/          # Componentes reutilizables
│       │   ├── Login.js         # Pantalla de login (user:user123)
│       │   ├── Navegacion.js    # Barra de navegación y menu
│       │   ├── participantes/   # Gestión de participantes
│       │   │   ├── FormularioParticipante.js    # Agregar participantes
│       │   │   ├── ListaParticipantes.js        # Mostrar participantes
│       │   │   └── ModalEditarParticipante.js   # Editar participantes
│       │   ├── salas/           # Gestión de salas
│       │   │   ├── FormularioSala.js            # Agregar salas
│       │   │   ├── ListaSalas.js                # Mostrar salas
│       │   │   └── ModalEditarSala.js           # Editar salas
│       │   ├── sanciones/       # Gestión de sanciones
│       │   │   ├── FormularioSancion.js         # Agregar sanciones
│       │   │   ├── ListaSanciones.js            # Mostrar sanciones
│       │   │   └── ModalEditarSancion.js        # Editar sanciones
│       │   ├── reservas/        # Gestión de reservas
│       │   │   └── FormularioReserva.js         # Crear reservas
│       │   └── reportes/        # Sistema de reportes
│       │       └── Reportes.js                  # Todos los reportes
│       └── pages/               # Páginas principales
│           ├── ParticipantesPage.js             # Página de participantes
│           ├── SalasPage.js                     # Página de salas
│           ├── SancionesPage.js                 # Página de sanciones
│           ├── ReservasPage.js                  # Página de reservas
│           └── ReportesPage.js                  # Página de reportes
├── server.js                    # Servidor Express con 18 endpoints API
├── db.js                        # Conexión a MySQL
├── utils.js                     # Funciones utilitarias del backend
├── create_db.sql               # Script para crear base de datos
├── insert_data.sql             # Datos iniciales
├── import_sql.js               # Importador de SQL
├── set_passwords.js            # Configurar contraseñas
├── docker-compose.yml          # Configuración MySQL
├── package.json                # Dependencias y scripts
└── README.md                   # Documentación
```

#### back

- **server.js**: Servidor principal con 18 endpoints REST para CRUD completo
- **db.js**: Configuración y conexión a MySQL con pool de conexiones
- **utils.js**: Funciones auxiliares (hash passwords, validaciones, reglas de negocio)
- **create_db.sql**: Schema completo de la base de datos
- **insert_data.sql**: Datos de prueba (participantes, salas, turnos)
- **import_sql.js**: Script para importar automáticamente los SQL
- **set_passwords.js**: Configurar passwords de usuarios de prueba

#### front

- **App.js**: Componente raíz, manejo de navegación y estado global
- **utils.js**: Hook personalizado useApi para llamadas HTTP
- **Navegacion.js**: Menu responsive con indicador de estado de conexión
- **FormularioX.js**: Formularios para crear/agregar datos con validaciones
- **ListaX.js**: Listas con funcionalidad de editar/eliminar
- **ModalEditarX.js**: Modales para edición inline de registros
- **XPage.js**: Páginas que combinan formularios y listas por funcionalidad
- **Reportes.js**: 7 tipos de reportes diferentes con parámetros

#### config

- **docker-compose.yml**: MySQL 8.0 con datos persistentes
- **package.json**: Scripts npm y dependencias (express, mysql2, bcryptjs)

### 1 dependencias

```bash
npm install
```

### 2 init db

```bash
docker-compose up -d
sleep 10
npm run import
npm run setpw
```

### 3 server

```bash
npm start
```

Abrir: **http://localhost:3000**

## mecanismo de autenticacion

el sistema implementa autenticacion basada en base de datos con las siguientes caracteristicas:

### arquitectura de seguridad

**tablas involucradas:**

- `participante` - almacena datos personales (ci, nombre, apellido, email)
- `login` - almacena credenciales de acceso (correo, contrasena hasheada)

**flujo de autenticacion:**

1. **pantalla de login (Login.js)**

   - el usuario ingresa correo electronico y contraseña
   - validacion en frontend: verifica campos no vacios
   - envia credenciales via POST a `/api/login`

2. **endpoint de autenticacion (server.js)**

   ```javascript
   POST / api / login;
   ```

   - recibe `{ correo, password }` en el body
   - busca usuario en tabla `login` usando prepared statement
   - compara contraseña con bcrypt (`bcrypt.compareSync()`)
   - si es valido, consulta datos del participante
   - retorna `{ ok: true, mensaje, usuario }`

3. **gestion de sesion (App.js)**

   - componente App mantiene estado `autenticado` (true/false)
   - al login exitoso: `setAutenticado(true)` y guarda datos usuario
   - muestra aplicacion completa si autenticado
   - muestra Login si no autenticado

4. **asignacion de roles**

   - despues de validar credenciales, se consulta el rol del participante
   - busca en tabla `participante_programa_academico`
   - roles disponibles: `alumno` o `docente`
   - si no tiene rol asignado, se asigna `alumno` por defecto
   - el rol se incluye en el objeto usuario retornado

5. **cierre de sesion**
   - boton "salir" en navbar ejecuta `onLogout()`
   - resetea estado: `setAutenticado(false)`
   - vuelve a mostrar pantalla de login

### seguridad implementada

**encriptacion de contraseñas:**

- algoritmo: bcrypt con salt de 10 rounds
- las contraseñas nunca se almacenan en texto plano
- archivo: `utils.js` - funcion `hashPassword()`
- verificacion: `bcrypt.compareSync(plainPassword, hashedPassword)`

**proteccion contra inyeccion sql:**

- todas las queries usan prepared statements con placeholders `?`
- parametros se pasan separados del sql
- ejemplo: `SELECT ... WHERE correo = ?` con `[correo]`

**validaciones:**

- campos requeridos verificados en frontend y backend
- mensajes de error genericos ("credenciales incorrectas") para no revelar info
- manejo de errores con try/catch en todas las operaciones

### configuracion de usuarios

**script de inicializacion (set_passwords.js):**

```bash
npm run setpw
```

este script:

- lee todos los correos de la tabla `login`
- genera contraseña: `[nombre_del_correo]123` (ej: ana.perez123)
- caso especial admin: `admin-bd-ucu-2025`
- hashea cada contraseña con bcrypt
- actualiza tabla `login` con hash

**estructura de datos:**

```sql
CREATE TABLE login (
  correo VARCHAR(100) PRIMARY KEY,
  contrasena VARCHAR(255) NOT NULL
);
```

### Credenciales de Acceso

credenciales disponibles despues de ejecutar `npm run setpw`:

- **Admin**:

  - correo: `admin@example.com`
  - contraseña: `admin-bd-ucu-2025`

- **Usuarios de prueba**:
  - patron: `[correo]` / `[nombre]123`
  - ejemplo: `ana.perez@example.com` / `ana.perez123`

## Cómo probar

### 1 add participante

- completa formulario con CI, nombre, apellido y email
- verifica que aparece en la lista

### 2 add reserva

- CI: usar uno existente (ej: 12345678)
- Sala: S101
- Edificio: B1
- Fecha: fecha futura
- Turno: número entre 1-15

### 3 ver reportes

- Hacer clic en "Salas más reservadas"

## endpoints

- `GET /api/participants` - Lista participantes
- `POST /api/participants` - Crear participante
- `POST /api/reservas` - Crear reserva
- `GET /api/reports/top_salas` - Reporte salas

## consultas sql

esta seccion documenta todas las consultas sql utilizadas en el proyecto, su proposito y ubicacion en el codigo.

### autenticacion

**archivo: server.js (linea 68-108)**

**login de usuario**

```sql
SELECT correo, contrasena FROM login WHERE correo = ?
```

- verifica credenciales de acceso al sistema
- usa prepared statements para prevenir inyeccion sql
- la contraseña se compara con bcrypt

**obtener datos del participante**

```sql
SELECT p.ci, p.nombre, p.apellido, p.email FROM participante p WHERE p.email = ?
```

- recupera informacion del usuario autenticado
- se ejecuta despues de validar el login

**obtener rol del participante**

```sql
SELECT rol FROM participante_programa_academico WHERE ci_participante = ? LIMIT 1
```

- obtiene el rol del participante (alumno/docente)
- se ejecuta despues de obtener datos del participante
- si no tiene rol asignado, se usa "alumno" por defecto

### participantes

**archivo: server.js (lineas 114-220)**

**listar todos los participantes**

```sql
SELECT p.ci, p.nombre, p.apellido, p.email FROM participante p
```

- muestra todos los participantes registrados en el sistema

**crear participante**

```sql
INSERT INTO participante (ci,nombre,apellido,email) VALUES (?,?,?,?)
```

- registra un nuevo participante

**crear credenciales de login**

```sql
INSERT INTO login (correo,contrasena) VALUES (?,?)
```

- crea credenciales de acceso para el participante
- la contraseña se hashea con bcrypt

**verificar existencia de participante**

```sql
SELECT ci FROM participante WHERE ci = ?
```

- valida que el participante existe antes de eliminarlo o editarlo

**eliminar participante**

```sql
DELETE FROM participante WHERE ci = ?
```

- elimina un participante del sistema

**actualizar participante**

```sql
UPDATE participante SET nombre = ?, apellido = ?, email = ? WHERE ci = ?
```

- modifica los datos de un participante existente

**actualizar email en login**

```sql
UPDATE login SET correo = ? WHERE correo = (SELECT email FROM participante WHERE ci = ?)
```

- sincroniza el email en la tabla de login cuando se actualiza

### salas

**archivo: server.js (lineas 221-334)**

**listar todas las salas**

```sql
SELECT * FROM sala
```

- muestra todas las salas disponibles

**crear sala**

```sql
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES (?,?,?,?)
```

- registra una nueva sala en el sistema

**verificar existencia de sala**

```sql
SELECT nombre_sala FROM sala WHERE nombre_sala = ? AND edificio = ?
```

- valida que la sala existe antes de editarla o eliminarla

**actualizar sala**

```sql
UPDATE sala SET capacidad = ?, tipo_sala = ? WHERE nombre_sala = ? AND edificio = ?
```

- modifica capacidad y tipo de una sala existente

**eliminar sala**

```sql
DELETE FROM sala WHERE nombre_sala = ? AND edificio = ?
```

- elimina una sala del sistema

### sanciones

**archivo: server.js (lineas 335-458)**

**listar sanciones con datos del participante**

```sql
SELECT s.*, p.nombre, p.apellido, p.email
FROM sancion_participante s
JOIN participante p ON s.ci_participante = p.ci
ORDER BY s.fecha_inicio DESC
```

- muestra todas las sanciones con informacion del participante sancionado
- ordenadas por fecha mas reciente primero

**crear sancion**

```sql
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin, motivo) VALUES (?,?,?,?)
```

- registra una nueva sancion para un participante

**verificar existencia de sancion**

```sql
SELECT id_sancion FROM sancion_participante WHERE id_sancion = ?
```

- valida que la sancion existe antes de editarla o eliminarla

**actualizar sancion**

```sql
UPDATE sancion_participante SET fecha_inicio = ?, fecha_fin = ?, motivo = ? WHERE id_sancion = ?
```

- modifica las fechas y motivo de una sancion

**eliminar sancion**

```sql
DELETE FROM sancion_participante WHERE id_sancion = ?
```

- elimina una sancion del sistema

### edificios

**archivo: server.js (linea 459-467)**

**listar edificios**

```sql
SELECT * FROM edificio
```

- obtiene todos los edificios disponibles

### reservas

**archivo: server.js (lineas 469-530)**

**listar todas las reservas**

```sql
SELECT * FROM reserva
```

- muestra todas las reservas del sistema

**verificar reserva existente**

```sql
SELECT * FROM reserva WHERE nombre_sala=? AND edificio=? AND id_turno=? AND fecha=?
```

- busca si ya existe una reserva para esa sala, turno y fecha
- evita duplicar reservas

**crear nueva reserva**

```sql
INSERT INTO reserva (nombre_sala,edificio,id_turno,fecha,estado) VALUES (?,?,?,?,"activa")
```

- crea una nueva reserva activa

**agregar participante a reserva**

```sql
INSERT INTO reserva_participante (ci_participante, id_reserva) VALUES (?,?)
```

- asocia un participante con una reserva
- ubicado en utils.js (linea 90)

### reportes

**archivo: server.js (lineas 531-686)**

**1. salas mas reservadas**

```sql
SELECT r.nombre_sala, r.edificio, COUNT(rp.id_reserva) AS reservas
FROM reserva r
LEFT JOIN reserva_participante rp ON r.id_reserva=rp.id_reserva
GROUP BY r.nombre_sala, r.edificio
ORDER BY reservas DESC
LIMIT 10
```

- muestra top 10 de salas mas utilizadas

**2. reservas de participante por dia**

```sql
SELECT COUNT(rp.id_reserva) AS cant
FROM reserva_participante rp
JOIN reserva r ON rp.id_reserva=r.id_reserva
WHERE rp.ci_participante=? AND r.fecha=? AND r.estado='activa'
```

- cuenta cuantas reservas tiene un participante en una fecha especifica
- ubicado en utils.js (linea 26)

**3. reservas de participante por semana**

```sql
SELECT COUNT(DISTINCT r.id_reserva) AS cant
FROM reserva_participante rp
JOIN reserva r ON rp.id_reserva=r.id_reserva
WHERE rp.ci_participante=? AND r.fecha BETWEEN ? AND ? AND r.estado='activa'
```

- cuenta reservas activas de un participante en la semana actual
- ubicado en utils.js (linea 40)

**4. participantes mas activos**

```sql
SELECT p.ci, p.nombre, p.apellido, COUNT(rp.id_reserva) AS total_reservas
FROM participante p
LEFT JOIN reserva_participante rp ON p.ci = rp.ci_participante
LEFT JOIN reserva r ON rp.id_reserva = r.id_reserva AND r.estado = 'activa'
GROUP BY p.ci, p.nombre, p.apellido
ORDER BY total_reservas DESC
LIMIT 10
```

- muestra los 10 participantes con mas reservas activas

**5. ocupacion por edificio**

```sql
SELECT s.edificio, COUNT(r.id_reserva) AS reservas_totales,
       COUNT(DISTINCT s.nombre_sala) AS salas_disponibles,
       ROUND(COUNT(r.id_reserva) / COUNT(DISTINCT s.nombre_sala), 2) AS promedio_uso
FROM sala s
LEFT JOIN reserva r ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
GROUP BY s.edificio
ORDER BY promedio_uso DESC
```

- calcula estadisticas de uso por edificio
- muestra promedio de reservas por sala

**6. participantes sancionados actualmente**

```sql
SELECT p.ci, p.nombre, p.apellido, sp.fecha_inicio, sp.fecha_fin
FROM participante p
JOIN sancion_participante sp ON p.ci = sp.ci_participante
WHERE sp.fecha_fin >= CURDATE()
ORDER BY sp.fecha_fin DESC
```

- lista participantes con sanciones vigentes
- filtrados por fecha actual

**7. turnos mas populares**

```sql
SELECT t.id_turno, t.hora_inicio, t.hora_fin, COUNT(r.id_reserva) AS reservas
FROM turno t
LEFT JOIN reserva r ON t.id_turno = r.id_turno AND r.estado = 'activa'
GROUP BY t.id_turno, t.hora_inicio, t.hora_fin
ORDER BY reservas DESC
```

- muestra los turnos horarios mas solicitados

### validaciones (utils.js)

**verificar horario de turno**

```sql
SELECT hora_inicio, hora_fin FROM turno WHERE id_turno=?
```

- valida que el turno este dentro del horario permitido (08:00-23:00)
- ubicado en utils.js (linea 12)

**verificar sancion activa**

```sql
SELECT * FROM sancion_participante
WHERE ci_participante=? AND fecha_inicio<=? AND fecha_fin>=?
```

- verifica si un participante esta sancionado en una fecha
- ubicado en utils.js (linea 120)

**obtener informacion de sala**

```sql
SELECT * FROM sala WHERE nombre_sala=? AND edificio=?
```

- recupera datos completos de una sala especifica
- ubicado en utils.js (linea 60)

**contar participantes en reserva**

```sql
SELECT COUNT(*) AS c FROM reserva_participante WHERE id_reserva=?
```

- cuenta cuantos participantes hay en una reserva
- usado para validar capacidad maxima
- ubicado en utils.js (linea 78)

**obtener sala de una reserva**

```sql
SELECT nombre_sala, edificio FROM reserva WHERE id_reserva=?
```

- obtiene datos de la sala asociada a una reserva
- ubicado en utils.js (linea 69)

**obtener datos de participante**

```sql
SELECT nombre, apellido FROM participante WHERE ci=?
```

- recupera nombre completo de un participante
- usado en reportes individuales

**obtener rol y programa academico**

```sql
SELECT pa.rol, pa.nombre_programa, p.tipo
FROM participante_programa_academico pa
JOIN programa_academico p ON pa.nombre_programa=p.nombre_programa
WHERE pa.ci_participante=? LIMIT 1
```

- obtiene el rol (alumno/docente), nombre del programa y tipo (grado/posgrado)
- usado para validaciones de acceso y permisos
- ubicado en utils.js (linea 48)

**nota de seguridad**: todas las consultas utilizan prepared statements con placeholders (?) para prevenir inyecciones sql. los parametros se pasan por separado nunca concatenados en el string sql.

## reglas de negocio

- horario válido: 08:00-23:00
- max 2 reservas por día por participante
- max 5 reservas por semana por participante
