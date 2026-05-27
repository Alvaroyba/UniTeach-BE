-- PostgreSQL Initialization Script
-- Drops and creates tables based on the backend models

CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS university_type CASCADE;

CREATE TYPE user_type AS ENUM ('ALUMNO', 'MENTOR', 'AMBOS');
CREATE TYPE university_type AS ENUM ('UNT', 'UNSTA', 'UTN');

-- -----------------------------------------------------
-- Table carreras
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  iduser SERIAL PRIMARY KEY,
  username VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  dni VARCHAR(45) NOT NULL,
  legajo VARCHAR(45) NOT NULL,
  typeofuser user_type NOT NULL,
  mail VARCHAR(100) NOT NULL,
  phone VARCHAR(45),
  university university_type NOT NULL,
  avatar_url VARCHAR(255),
  carrera_id INT,
  opinion INT DEFAULT 0,
  numberopinion INT DEFAULT 0,
  averageopinion FLOAT DEFAULT 0.0,
  description TEXT,
  CONSTRAINT fk_users_carrera
    FOREIGN KEY (carrera_id)
    REFERENCES carreras (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table subjects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  idsubjects SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  university university_type NOT NULL,
  facultad VARCHAR(100),
  id_facultad INT
);

-- -----------------------------------------------------
-- Table userssubjects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS userssubjects (
  users_iduser INT NOT NULL,
  subjects_idsubjects INT NOT NULL,
  PRIMARY KEY (users_iduser, subjects_idsubjects),
  CONSTRAINT fk_users_has_materias_users
    FOREIGN KEY (users_iduser)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_userssubjects_subjects1
    FOREIGN KEY (subjects_idsubjects)
    REFERENCES subjects (idsubjects)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table classes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  idclasses SERIAL PRIMARY KEY,
  hour VARCHAR(45) NOT NULL,
  date TIMESTAMP NOT NULL,
  place VARCHAR(100) NOT NULL,
  subjects_idsubjects INT NOT NULL,
  users_idcreator INT NOT NULL,
  enddate TIMESTAMP NOT NULL,
  expired INT DEFAULT 0,
  CONSTRAINT fk_classes_subjects1
    FOREIGN KEY (subjects_idsubjects)
    REFERENCES subjects (idsubjects)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_classes_users1
    FOREIGN KEY (users_idcreator)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table inscription
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS inscription (
  idinscription SERIAL PRIMARY KEY,
  users_iduser INT NOT NULL,
  classes_idclasses INT NOT NULL,
  CONSTRAINT uq_inscription UNIQUE (users_iduser, classes_idclasses),
  CONSTRAINT fk_users_has_classes_users1
    FOREIGN KEY (users_iduser)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_users_has_classes_classes1
    FOREIGN KEY (classes_idclasses)
    REFERENCES classes (idclasses)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table ratings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  idalumno INT NOT NULL,
  idmentor INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  CONSTRAINT uq_ratings UNIQUE (idalumno, idmentor),
  CONSTRAINT fk_ratings_alumno
    FOREIGN KEY (idalumno)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_mentor
    FOREIGN KEY (idmentor)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table tokens
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  userid INT NOT NULL,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresat TIMESTAMP NOT NULL,
  CONSTRAINT fk_tokens_user
    FOREIGN KEY (userid)
    REFERENCES users (iduser)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- MOCK DATA
-- -----------------------------------------------------

INSERT INTO carreras (nombre) VALUES 
('Ingeniería en Sistemas'),
('Ingeniería Industrial'),
('Licenciatura en Computación');

INSERT INTO users (username, password, name, dni, legajo, typeofuser, mail, phone, university, carrera_id, opinion, numberopinion, averageopinion, avatar_url, description) VALUES
('alumno1', '123456', 'Juan Alumno', '40123456', '11111', 'ALUMNO', 'juan@test.com', '3811234567', 'UNSTA', 1, 0, 0, 0.0, 'https://i.pravatar.cc/150?img=11', 'Soy un estudiante entusiasta con ganas de aprender programación y física.'),
('mentor1', '123456', 'Maria Mentor', '39123456', '22222', 'MENTOR', 'maria@test.com', '3817654321', 'UNSTA', 1, 14, 3, 4.6, 'https://i.pravatar.cc/150?img=5', 'Apasionada por las ciencias exactas. Más de 3 años de experiencia ayudando estudiantes.'),
('mentor2', '123456', 'Carlos Experto', '38123456', '33333', 'AMBOS', 'carlos@test.com', '3810000000', 'UNSTA', 1, 5, 1, 5.0, 'https://i.pravatar.cc/150?img=12', 'Desarrollador fullstack y amante de la física cuántica.'),
('mentor3', '123456', 'Laura Física', '37123456', '44444', 'MENTOR', 'laura@test.com', '3812222222', 'UNSTA', 1, 18, 4, 4.8, 'https://i.pravatar.cc/150?img=9', 'Doctora en Física. Te ayudaré a entender las leyes del universo desde cero.');

INSERT INTO subjects (name, university, facultad, id_facultad) VALUES
('Matemática Superior', 'UNSTA', 'Ingeniería', 1),
('Física II', 'UNSTA', 'Ingeniería', 1),
('Anatomía I', 'UNSTA', 'Ciencias de la salud', 2),
('Introducción a la Psicología', 'UNSTA', 'Humanidades', 3);

INSERT INTO userssubjects (users_iduser, subjects_idsubjects) VALUES
(2, 1), -- Maria es mentora de Matemática Superior (Ingeniería)
(2, 2), -- Maria es mentora de Física II (Ingeniería)
(3, 4), -- Carlos es mentor de Introducción a la Psicología (Humanidades)
(4, 2); -- Laura es mentora de Física II (Ingeniería)

-- Insert mock classes (mix of future active classes and past expired classes)
INSERT INTO classes (hour, date, place, subjects_idsubjects, users_idcreator, enddate, expired) VALUES
('10:00', '2026-12-30 10:00:00', 'Aula 1', 1, 2, '2026-12-30 12:00:00', 0),
('14:00', '2026-12-31 14:00:00', 'Virtual', 4, 3, '2026-12-31 16:00:00', 0),
('09:00', '2026-11-15 09:00:00', 'Laboratorio 3', 2, 4, '2026-11-15 11:00:00', 0),
-- Clases viejas/expiradas
('16:00', '2023-05-10 16:00:00', 'Biblioteca', 2, 2, '2023-05-10 18:00:00', 1),
('11:00', '2023-08-22 11:00:00', 'Virtual', 2, 4, '2023-08-22 13:00:00', 1);

-- Insert mock inscription
INSERT INTO inscription (users_iduser, classes_idclasses) VALUES
(1, 1), -- Juan inscripto a la clase 1 de Maria (futura)
(1, 4), -- Juan inscripto a la clase 4 de Maria (vieja)
(1, 5); -- Juan inscripto a la clase 5 de Laura (vieja)

-- Insert mock ratings
INSERT INTO ratings (idalumno, idmentor, rating, comment) VALUES
(1, 2, 5, 'Excelente profe, me ayudó muchísimo a aprobar Física y Matemática!'),
(1, 4, 4, 'Sus clases de laboratorio son increíbles y muy dinámicas.');
