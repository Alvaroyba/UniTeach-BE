const { dbConnect } = require("../../config/mysql");

// Crear una relación usuario-materia
const createUserSubject = async (userSubjectData) => {
  const connection = await dbConnect().promise();
  const query =
    "INSERT INTO userssubjects (Users_idUser, Subjects_idSubjects) VALUES (?, ?)";
  const values = [
    userSubjectData.Users_idUser,
    userSubjectData.Subjects_idSubjects,
  ];

  try {
    const [result] = await connection.query(query, values);
    console.log("Relación mentor-materia creada correctamente");
    return result;
  } catch (err) {
    console.error("Error al crear la relación mentor-materia:", err);
    throw err;
  } finally {
    await connection.end();
  }
};

// Eliminar una relación usuario-materia
const deleteUserSubject = async (userId, subjectId) => {
  const connection = await dbConnect().promise();
  const query =
    "DELETE FROM userssubjects WHERE Users_idUser = ? AND Subjects_idSubjects = ?";
  const values = [userId, subjectId];

  try {
    const [result] = await connection.query(query, values);
    console.log("Relación mentor-materia eliminada correctamente");
    return result;
  } catch (err) {
    console.error("Error al eliminar la relación mentor-materia:", err);
    throw err;
  } finally {
    await connection.end();
  }
};

// Obtener materias de un usuario
const getUserSubjects = async (userId) => {
  const connection = await dbConnect().promise();
  const query = `SELECT us.*, 
  s.Name AS subjectName, 
    u.Name AS userName 
FROM userssubjects us 
JOIN users u ON us.Users_idUser = u.idUser 
LEFT JOIN subjects s ON us.Subjects_idSubjects = s.idSubjects 
WHERE Users_idUser = ?`;

  const values = [userId];

  try {
    const [results] = await connection.query(query, values);
    if (results.length === 0) {
      console.log("No tiene materias asignadas");
    } else {
      console.log("Materias del usuario obtenidas correctamente");
    }
    return results;
  } catch (err) {
    console.error("Error al obtener las materias del mentor:", err);
    throw err;
  } finally {
    await connection.end();
  }
};

module.exports = { createUserSubject, deleteUserSubject, getUserSubjects };
