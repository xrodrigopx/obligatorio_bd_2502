
USE reserva_salas;

-- Facultades
INSERT INTO facultad (nombre) VALUES ('Ciencias'), ('Ingenieria'), ('Humanidades');

-- Edificios
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('B1','Av. Central 100','Centro'),
('B2','Calle Falsa 123','Norte'),
('B3','Paseo 45','Sur');

-- Programas
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Informatica', 2, 'grado'),
('Matematica', 1, 'grado'),
('Magister CS', 2, 'posgrado');

-- Participantes
INSERT INTO participante (ci, nombre, apellido, email) VALUES
('12345678','Ana','Perez','ana.perez@example.com'),
('87654321','Luis','Gomez','luis.gomez@example.com'),
('11223344','Marta','Lopez','marta.lopez@example.com'),
('99999999','Admin','Sistema','admin@example.com');

-- participante_programa_academico
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, rol) VALUES
('12345678','Informatica','alumno'),
('87654321','Magister CS','alumno'),
('11223344','Matematica','docente');

-- Login (passwords hashed later or via helper). Here put placeholders
INSERT INTO login (correo, contrasena) VALUES
('ana.perez@example.com',''),
('luis.gomez@example.com',''),
('marta.lopez@example.com',''),
('admin@example.com','');

-- Salas
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES
('S101','B1',20,'libre'),
('S102','B1',10,'posgrado'),
('S201','B2',15,'docente');

-- Turnos (1-hour blocks from 08:00 to 22:00)
INSERT INTO turno (hora_inicio, hora_fin) VALUES
('08:00:00','09:00:00'),
('09:00:00','10:00:00'),
('10:00:00','11:00:00'),
('11:00:00','12:00:00'),
('12:00:00','13:00:00'),
('13:00:00','14:00:00'),
('14:00:00','15:00:00'),
('15:00:00','16:00:00'),
('16:00:00','17:00:00'),
('17:00:00','18:00:00'),
('18:00:00','19:00:00'),
('19:00:00','20:00:00'),
('20:00:00','21:00:00'),
('21:00:00','22:00:00');

-- Example reservation
INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado) VALUES
('S101','B1', CURDATE(), 1,'activa');

-- reserve participants
INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia) VALUES
('12345678', LAST_INSERT_ID(), NULL);

-- Sanciones de ejemplo
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin, motivo) VALUES
-- Sanción activa (válida hasta mañana)
('87654321', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Uso inadecuado de las instalaciones'),
-- Sanción expirada (terminó ayer)
('11223344', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'No presentarse a reserva confirmada'),
-- Sanción activa (válida por una semana)
('12345678', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Daño a equipos de la sala');
