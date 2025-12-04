const bcrypt = require("bcryptjs");
const db = require("./db");

// encriptar contraseña con bcrypt
async function hashPassword(plain) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
}

// verificar si el turno esta dentro del horario permitido (08:00-23:00)
async function isWithinHours(id_turno) {
  const rows = await db.query(
    "SELECT hora_inicio, hora_fin FROM turno WHERE id_turno=?",
    [id_turno]
  );
  if (!rows.length) return [false, "turno inexistente"];
  const h0 = rows[0].hora_inicio;
  if (h0 >= "08:00:00" && h0 < "23:00:00") return [true, ""];
  return [false, "turno fuera de horario permitido (08:00-23:00)"];
}

// contar cuantas reservas activas tiene un participante en una fecha
async function participantDailyHours(ci, fecha) {
  const rows = await db.query(
    `SELECT COUNT(rp.id_reserva) AS cant FROM reserva_participante rp JOIN reserva r ON rp.id_reserva=r.id_reserva WHERE rp.ci_participante=? AND r.fecha=? AND r.estado='activa'`,
    [ci, fecha]
  );
  return rows[0] ? rows[0].cant : 0;
}

// contar cuantas reservas activas tiene un participante en la semana
async function participantActiveWeek(ci, fecha) {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = (day + 6) % 7; // lunes=0
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const rows = await db.query(
    `SELECT COUNT(DISTINCT r.id_reserva) AS cant FROM reserva_participante rp JOIN reserva r ON rp.id_reserva=r.id_reserva WHERE rp.ci_participante=? AND r.fecha BETWEEN ? AND ? AND r.estado='activa'`,
    [ci, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
  return rows[0] ? rows[0].cant : 0;
}

// obtener rol y programa académico de un participante
async function getParticipantRoleProgram(ci) {
  const rows = await db.query(
    `SELECT pa.rol, pa.nombre_programa, p.tipo FROM participante_programa_academico pa JOIN programa_academico p ON pa.nombre_programa=p.nombre_programa WHERE pa.ci_participante=? LIMIT 1`,
    [ci]
  );
  if (!rows.length) return [null, null, null];
  return [rows[0].rol, rows[0].nombre_programa, rows[0].tipo];
}

// obtener información de una sala
async function getSala(nombre, edificio) {
  const rows = await db.query(
    "SELECT * FROM sala WHERE nombre_sala=? AND edificio=?",
    [nombre, edificio]
  );
  return rows[0] || null;
}

// agregar participante a una reserva verificando capacidad
async function addParticipantToReserva(ci, id_reserva) {
  const r = await db.query(
    "SELECT nombre_sala, edificio FROM reserva WHERE id_reserva=?",
    [id_reserva]
  );
  if (!r.length) return [false, "reserva no encontrada"];
  const { nombre_sala, edificio } = r[0];
  const sala = await getSala(nombre_sala, edificio);
  if (!sala) return [false, "sala no encontrada"];
  const cntRows = await db.query(
    "SELECT COUNT(*) AS c FROM reserva_participante WHERE id_reserva=?",
    [id_reserva]
  );
  const cnt = cntRows[0] ? cntRows[0].c : 0;
  if (cnt >= sala.capacidad)
    return [false, `capacidad de sala alcanzada (${sala.capacidad})`];
  try {
    await db.execute(
      "INSERT INTO reserva_participante (ci_participante, id_reserva) VALUES (?,?)",
      [ci, id_reserva]
    );
    return [true, "participante agregado"];
  } catch (e) {
    // convertir errores tecnicos en mensajes amigables
    const mensaje = e.message || e;
    if (
      mensaje.includes("Duplicate entry") &&
      mensaje.includes("reserva_participante.PRIMARY")
    ) {
      return [false, "ya tienes una reserva para esta sala y horario"];
    }
    if (
      mensaje.includes("foreign key constraint") &&
      mensaje.includes("ci_participante")
    ) {
      return [false, "el participante no esta registrado en el sistema"];
    }
    return [false, "error al procesar la reserva. intenta nuevamente"];
  }
}

// verificar si un participante esta sancionado en una fecha
async function isSanctioned(ci, fecha) {
  const rows = await db.query(
    "SELECT * FROM sancion_participante WHERE ci_participante=? AND fecha_inicio<=? AND fecha_fin>=?",
    [ci, fecha, fecha]
  );
  return rows.length > 0;
}

module.exports = {
  hashPassword,
  isWithinHours,
  participantDailyHours,
  participantActiveWeek,
  getParticipantRoleProgram,
  getSala,
  addParticipantToReserva,
  isSanctioned,
};
