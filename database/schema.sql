-- =====================================================
-- ESQUEMA DE BASE DE DATOS - INVITACIÓN DE BODA RSVP
-- =====================================================
-- Importar con: mysql -u usuario -p nombre_bd < schema.sql

CREATE DATABASE IF NOT EXISTS boda_rsvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boda_rsvp;

-- ---------------------------------------------------
-- Tabla: familias (cada código de invitación = 1 fila)
-- ---------------------------------------------------
CREATE TABLE familias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre_familia VARCHAR(120) NOT NULL,
  cupo_maximo TINYINT NOT NULL DEFAULT 5,
  confirmado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_confirmacion DATETIME NULL,
  dispositivo_hash VARCHAR(64) NULL,   -- huella simple del navegador/dispositivo que confirmó
  ip_confirmacion VARCHAR(45) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Tabla: invitados (cada persona dentro de una familia)
-- ---------------------------------------------------
CREATE TABLE invitados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  familia_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  asiste TINYINT(1) NULL,              -- NULL = sin responder, 1 = asiste, 0 = no asiste
  FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Tabla: administradores (acceso al panel oculto)
-- ---------------------------------------------------
CREATE TABLE administradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- =====================================================
-- DATOS DE EJEMPLO (mismos códigos usados en familias.js)
-- =====================================================
INSERT INTO familias (codigo, nombre_familia, cupo_maximo) VALUES
('RIOS2026', 'Familia Ríos', 4),
('TORRES5', 'Familia Torres', 5),
('LUNA1', 'Invitado especial', 1),
('GOMEZ3', 'Familia Gómez', 3);

INSERT INTO invitados (familia_id, nombre) VALUES
(1, 'Sr. Alberto Ríos'),
(1, 'Sra. Patricia Ríos'),
(1, 'Daniela Ríos'),
(1, 'Emilio Ríos'),
(2, 'Jorge Torres'),
(2, 'Mariana Torres'),
(2, 'Sofía Torres'),
(2, 'Diego Torres'),
(2, 'Renata Torres'),
(3, 'Fernanda Luna'),
(4, 'Ricardo Gómez'),
(4, 'Valeria Gómez'),
(4, 'Santiago Gómez');

-- Usuario administrador de ejemplo: usuario "admin" / contraseña "boda2026"
-- El hash se genera con password_hash('boda2026', PASSWORD_BCRYPT) en PHP.
-- Ejecuta backend-php/admin/generar_hash.php una vez para crear el tuyo y
-- reemplaza este INSERT, o créalo manualmente.
-- INSERT INTO administradores (usuario, password_hash) VALUES ('admin', '$2y$10$...');
