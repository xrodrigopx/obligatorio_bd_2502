const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
const utils = require("./utils");

// configurar servidor express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("web"));

// función para convertir errores técnicos en mensajes amigables
function convertirErrorAmigable(error) {
  const mensaje = error.message || error;

  // error de clave duplicada en participantes
  if (
    mensaje.includes("Duplicate entry") &&
    mensaje.includes("participante.PRIMARY")
  ) {
    return "este participante ya esta registrado";
  }

  // error de clave duplicada en reserva_participante
  if (
    mensaje.includes("Duplicate entry") &&
    mensaje.includes("reserva_participante.PRIMARY")
  ) {
    return "ya tienes una reserva para esta sala y horario";
  }

  // error de clave foranea - participante no existe
  if (
    mensaje.includes("foreign key constraint") &&
    mensaje.includes("ci_participante")
  ) {
    return "el participante no está registrado en el sistema";
  }

  // error de clave foranea - sala no existe
  if (
    mensaje.includes("foreign key constraint") &&
    mensaje.includes("nombre_sala")
  ) {
    return "la sala especificada no existe";
  }

  // error de clave foranea - turno no existe
  if (
    mensaje.includes("foreign key constraint") &&
    mensaje.includes("id_turno")
  ) {
    return "el turno especificado no es válido";
  }

  // error de conexión a base de datos
  if (mensaje.includes("ECONNREFUSED") || mensaje.includes("connect")) {
    return "error de conexión con la base de datos";
  }

  // error genérico
  return "ha ocurrido un error. intenta nuevamente";
}

// endpoint de login
app.post("/api/login", async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: "faltan campos requeridos" });
  }

  try {
    // buscar usuario en la base de datos
    const rows = await db.query(
      "SELECT correo, contrasena FROM login WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "credenciales incorrectas" });
    }

    const usuario = rows[0];

    // verificar la contraseña
    const passwordValido = bcrypt.compareSync(password, usuario.contrasena);

    if (!passwordValido) {
      return res.status(401).json({ error: "credenciales incorrectas" });
    }

    // obtener datos del participante
    const participante = await db.query(
      "SELECT ci, nombre, apellido, email FROM participante WHERE email = ?",
      [correo]
    );

    // login exitoso
    res.json({
      ok: true,
      mensaje: "login exitoso",
      usuario: participante[0] || { email: correo },
    });
  } catch (e) {
    console.error("error en login:", e);
    res.status(500).json({ error: "error al procesar el login" });
  }
});

// obtener lista de todos los participantes
app.get("/api/participants", async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT p.ci, p.nombre, p.apellido, p.email FROM participante p"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// agregar nuevo participante
app.post("/api/participants", async (req, res) => {
  const { ci, nombre, apellido, email, password } = req.body;
  if (!ci || !nombre || !apellido || !email)
    return res.status(400).json({ error: "faltan campos requeridos" });
  try {
    await db.execute(
      "INSERT INTO participante (ci,nombre,apellido,email) VALUES (?,?,?,?)",
      [ci, nombre, apellido, email]
    );
    if (password) {
      const hash = await utils.hashPassword(password);
      await db.execute("INSERT INTO login (correo,contrasena) VALUES (?,?)", [
        email,
        hash,
      ]);
    }
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Eliminar participante
app.delete("/api/participants/:ci", async (req, res) => {
  const { ci } = req.params;

  if (!ci) {
    return res.status(400).json({ error: "CI es requerido" });
  }

  try {
    // Verificar si el participante existe
    const participante = await db.query(
      "SELECT ci FROM participante WHERE ci = ?",
      [ci]
    );

    if (participante.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }

    // Eliminar el participante (las claves foráneas se eliminan automáticamente por CASCADE)
    await db.execute("DELETE FROM participante WHERE ci = ?", [ci]);

    res.json({ ok: true, mensaje: "Participante eliminado exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Actualizar participante
app.put("/api/participants/:ci", async (req, res) => {
  const { ci } = req.params;
  const { nombre, apellido, email } = req.body;

  if (!ci) {
    return res.status(400).json({ error: "CI es requerido" });
  }

  if (!nombre || !apellido || !email) {
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos (nombre, apellido, email)" });
  }

  try {
    // Verificar si el participante existe
    const participante = await db.query(
      "SELECT ci FROM participante WHERE ci = ?",
      [ci]
    );

    if (participante.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }

    // Actualizar el participante
    await db.execute(
      "UPDATE participante SET nombre = ?, apellido = ?, email = ? WHERE ci = ?",
      [nombre, apellido, email, ci]
    );

    // Actualizar también el email en la tabla login si existe
    await db.execute(
      "UPDATE login SET correo = ? WHERE correo = (SELECT email FROM participante WHERE ci = ?)",
      [email, ci]
    );

    res.json({ ok: true, mensaje: "Participante actualizado exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Obtener lista de todas las salas
app.get("/api/salas", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM sala");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Agregar nueva sala
app.post("/api/salas", async (req, res) => {
  const { nombre_sala, edificio, capacidad, tipo_sala } = req.body;

  if (!nombre_sala || !edificio || !capacidad || !tipo_sala) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // Validar que la capacidad sea un número positivo
  const cap = parseInt(capacidad);
  if (isNaN(cap) || cap <= 0) {
    return res
      .status(400)
      .json({ error: "La capacidad debe ser un número positivo" });
  }

  try {
    await db.execute(
      "INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES (?,?,?,?)",
      [nombre_sala, edificio, cap, tipo_sala]
    );
    res.status(201).json({ ok: true, mensaje: "Sala creada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Actualizar sala
app.put("/api/salas/:nombre_sala/:edificio", async (req, res) => {
  const { nombre_sala, edificio } = req.params;
  const { capacidad, tipo_sala } = req.body;

  if (!capacidad || !tipo_sala) {
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos (capacidad, tipo_sala)" });
  }

  // Validar que la capacidad sea un número positivo
  const cap = parseInt(capacidad);
  if (isNaN(cap) || cap <= 0) {
    return res
      .status(400)
      .json({ error: "La capacidad debe ser un número positivo" });
  }

  try {
    // Verificar si la sala existe
    const sala = await db.query(
      "SELECT nombre_sala FROM sala WHERE nombre_sala = ? AND edificio = ?",
      [nombre_sala, edificio]
    );

    if (sala.length === 0) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    // Actualizar la sala
    await db.execute(
      "UPDATE sala SET capacidad = ?, tipo_sala = ? WHERE nombre_sala = ? AND edificio = ?",
      [cap, tipo_sala, nombre_sala, edificio]
    );

    res.json({ ok: true, mensaje: "Sala actualizada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Eliminar sala
app.delete("/api/salas/:nombre_sala/:edificio", async (req, res) => {
  const { nombre_sala, edificio } = req.params;

  if (!nombre_sala || !edificio) {
    return res
      .status(400)
      .json({ error: "Nombre de sala y edificio son requeridos" });
  }

  try {
    // Verificar si la sala existe
    const sala = await db.query(
      "SELECT nombre_sala FROM sala WHERE nombre_sala = ? AND edificio = ?",
      [nombre_sala, edificio]
    );

    if (sala.length === 0) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    // Eliminar la sala (las reservas se eliminan automáticamente por CASCADE)
    await db.execute(
      "DELETE FROM sala WHERE nombre_sala = ? AND edificio = ?",
      [nombre_sala, edificio]
    );

    res.json({ ok: true, mensaje: "Sala eliminada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// ====== ENDPOINTS PARA SANCIONES ======

// Obtener lista de todas las sanciones
app.get("/api/sanciones", async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT s.*, p.nombre, p.apellido, p.email
      FROM sancion_participante s
      JOIN participante p ON s.ci_participante = p.ci
      ORDER BY s.fecha_inicio DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Agregar nueva sanción
app.post("/api/sanciones", async (req, res) => {
  const { ci_participante, fecha_inicio, fecha_fin, motivo } = req.body;

  if (!ci_participante || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      error: "Faltan campos requeridos (CI, fecha inicio, fecha fin)",
    });
  }

  // Validar que fecha_fin sea posterior a fecha_inicio
  if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
    return res.status(400).json({
      error: "La fecha de fin debe ser posterior a la fecha de inicio",
    });
  }

  try {
    // Verificar que el participante existe
    const participante = await db.query(
      "SELECT ci FROM participante WHERE ci = ?",
      [ci_participante]
    );

    if (participante.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }

    await db.execute(
      "INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin, motivo) VALUES (?,?,?,?)",
      [ci_participante, fecha_inicio, fecha_fin, motivo || null]
    );
    res.status(201).json({ ok: true, mensaje: "Sanción creada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Actualizar sanción
app.put("/api/sanciones/:id_sancion", async (req, res) => {
  const { id_sancion } = req.params;
  const { fecha_inicio, fecha_fin, motivo } = req.body;

  if (!fecha_inicio || !fecha_fin) {
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos (fecha inicio, fecha fin)" });
  }

  // Validar que fecha_fin sea posterior a fecha_inicio
  if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
    return res.status(400).json({
      error: "La fecha de fin debe ser posterior a la fecha de inicio",
    });
  }

  try {
    // Verificar si la sanción existe
    const sancion = await db.query(
      "SELECT id_sancion FROM sancion_participante WHERE id_sancion = ?",
      [id_sancion]
    );

    if (sancion.length === 0) {
      return res.status(404).json({ error: "Sanción no encontrada" });
    }

    // Actualizar la sanción
    await db.execute(
      "UPDATE sancion_participante SET fecha_inicio = ?, fecha_fin = ?, motivo = ? WHERE id_sancion = ?",
      [fecha_inicio, fecha_fin, motivo || null, id_sancion]
    );

    res.json({ ok: true, mensaje: "Sanción actualizada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Eliminar sanción
app.delete("/api/sanciones/:id_sancion", async (req, res) => {
  const { id_sancion } = req.params;

  if (!id_sancion) {
    return res.status(400).json({ error: "ID de sanción es requerido" });
  }

  try {
    // Verificar si la sanción existe
    const sancion = await db.query(
      "SELECT id_sancion FROM sancion_participante WHERE id_sancion = ?",
      [id_sancion]
    );

    if (sancion.length === 0) {
      return res.status(404).json({ error: "Sanción no encontrada" });
    }

    // Eliminar la sanción
    await db.execute("DELETE FROM sancion_participante WHERE id_sancion = ?", [
      id_sancion,
    ]);

    res.json({ ok: true, mensaje: "Sanción eliminada exitosamente" });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Obtener lista de todos los edificios
app.get("/api/edificios", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM edificio");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Obtener lista de todas las reservas
app.get("/api/reservas", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM reserva");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Crear nueva reserva
app.post("/api/reservas", async (req, res) => {
  try {
    const { ci, nombre_sala, edificio, id_turno, fecha } = req.body;
    if (!ci || !nombre_sala || !edificio || !id_turno || !fecha)
      return res.status(400).json({ error: "Faltan campos requeridos" });

    // Verificar reglas de negocio
    const [dentro, mensaje] = await utils.isWithinHours(id_turno);
    if (!dentro) return res.status(400).json({ error: mensaje });

    const sancionado = await utils.isSanctioned(ci, fecha);
    if (sancionado)
      return res
        .status(400)
        .json({ error: "Participante sancionado en esa fecha" });

    const horasDiarias = await utils.participantDailyHours(ci, fecha);
    if (horasDiarias >= 2)
      return res.status(400).json({ error: "Limite diario alcanzado" });

    const horasSemanales = await utils.participantActiveWeek(ci, fecha);
    if (horasSemanales >= 5)
      return res.status(400).json({ error: "Limite semanal alcanzado" });

    // Crear o encontrar reserva para sala+turno+fecha
    const existente = await db.query(
      "SELECT * FROM reserva WHERE nombre_sala=? AND edificio=? AND id_turno=? AND fecha=?",
      [nombre_sala, edificio, id_turno, fecha]
    );
    let id_reserva;
    if (existente.length) {
      id_reserva = existente[0].id_reserva;
    } else {
      id_reserva = await db.execute(
        'INSERT INTO reserva (nombre_sala,edificio,id_turno,fecha,estado) VALUES (?,?,?,?,"activa")',
        [nombre_sala, edificio, id_turno, fecha]
      );
    }

    const [exito, mensajeAgregar] = await utils.addParticipantToReserva(
      ci,
      id_reserva
    );
    if (!exito) return res.status(400).json({ error: mensajeAgregar });

    res.status(201).json({ ok: true, id_reserva });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de salas más reservadas
app.get("/api/reports/top_salas", async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT r.nombre_sala, r.edificio, COUNT(rp.id_reserva) AS reservas 
       FROM reserva r 
       LEFT JOIN reserva_participante rp ON r.id_reserva=rp.id_reserva 
       GROUP BY r.nombre_sala, r.edificio 
       ORDER BY reservas DESC 
       LIMIT 10`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de reservas por participante en una fecha específica
app.get("/api/reports/participante_dia", async (req, res) => {
  const { ci, fecha } = req.query;
  if (!ci || !fecha) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros: ci y fecha son requeridos" });
  }
  try {
    const cantidad = await utils.participantDailyHours(ci, fecha);
    const participante = await db.query(
      "SELECT nombre, apellido FROM participante WHERE ci=?",
      [ci]
    );
    if (!participante.length) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }
    res.json({
      ci,
      nombre: participante[0].nombre,
      apellido: participante[0].apellido,
      fecha,
      reservas_dia: cantidad,
    });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de reservas por participante en la semana
app.get("/api/reports/participante_semana", async (req, res) => {
  const { ci, fecha } = req.query;
  if (!ci || !fecha) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros: ci y fecha son requeridos" });
  }
  try {
    const cantidad = await utils.participantActiveWeek(ci, fecha);
    const participante = await db.query(
      "SELECT nombre, apellido FROM participante WHERE ci=?",
      [ci]
    );
    if (!participante.length) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }
    res.json({
      ci,
      nombre: participante[0].nombre,
      apellido: participante[0].apellido,
      fecha,
      reservas_semana: cantidad,
    });
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de participantes más activos
app.get("/api/reports/participantes_activos", async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT p.ci, p.nombre, p.apellido, COUNT(rp.id_reserva) AS total_reservas
       FROM participante p 
       LEFT JOIN reserva_participante rp ON p.ci = rp.ci_participante
       LEFT JOIN reserva r ON rp.id_reserva = r.id_reserva AND r.estado = 'activa'
       GROUP BY p.ci, p.nombre, p.apellido 
       ORDER BY total_reservas DESC 
       LIMIT 10`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de ocupación por edificio
app.get("/api/reports/ocupacion_edificios", async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT s.edificio, COUNT(r.id_reserva) AS reservas_totales,
              COUNT(DISTINCT s.nombre_sala) AS salas_disponibles,
              ROUND(COUNT(r.id_reserva) / COUNT(DISTINCT s.nombre_sala), 2) AS promedio_uso
       FROM sala s
       LEFT JOIN reserva r ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
       GROUP BY s.edificio
       ORDER BY promedio_uso DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Reporte de participantes sancionados
app.get("/api/reports/participantes_sancionados", async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT p.ci, p.nombre, p.apellido, sp.fecha_inicio, sp.fecha_fin
       FROM participante p
       JOIN sancion_participante sp ON p.ci = sp.ci_participante
       WHERE sp.fecha_fin >= CURDATE()
       ORDER BY sp.fecha_fin DESC`
    );

    // Si no hay sanciones, devolver array vacío con mensaje informativo
    if (rows.length === 0) {
      res.json({
        mensaje: "No hay participantes sancionados actualmente",
        sanciones: [],
      });
    } else {
      res.json(rows);
    }
  } catch (e) {
    // Si la tabla no existe, devolver mensaje informativo en lugar de error
    if (e.message && e.message.includes("doesn't exist")) {
      res.json({
        mensaje:
          "La funcionalidad de sanciones no está disponible (tabla no encontrada)",
        sanciones: [],
      });
    } else {
      res.status(500).json({ error: convertirErrorAmigable(e) });
    }
  }
});

// Reporte de turnos más utilizados
app.get("/api/reports/turnos_populares", async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT t.id_turno, t.hora_inicio, t.hora_fin, COUNT(r.id_reserva) AS reservas
       FROM turno t
       LEFT JOIN reserva r ON t.id_turno = r.id_turno AND r.estado = 'activa'
       GROUP BY t.id_turno, t.hora_inicio, t.hora_fin
       ORDER BY reservas DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: convertirErrorAmigable(e) });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
