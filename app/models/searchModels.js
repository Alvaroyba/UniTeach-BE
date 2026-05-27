const { dbConnect } = require("../../config/mysql"); // Asegúrate de tener configurado el archivo de conexión en config/mysql.js

const searchMentors = async (subjectName, Facultad, University) => {
  const connection = dbConnect().promise();

  let query = `
    SELECT 
        u.idUser, 
        u.Name AS MentorName,
        u.AverageOpinion AS Opinion,
        s.Name AS SubjectName,
        s.idSubjects AS IdMateria,
        s.Facultad AS Facultad,
        s.Id_Facultad AS IdFacultad,
        u.University AS MentorUniversity,
        u.Avatar_URL,
        STRING_AGG(CASE WHEN c.hour IS NOT NULL THEN CONCAT(c.hour, ', ', TO_CHAR(c.date, 'YYYY-MM-DD')) ELSE NULL END, '; ') AS ClassDetails
    FROM 
        users u
    JOIN 
        userssubjects us ON u.idUser = us.Users_idUser
    JOIN 
        subjects s ON us.Subjects_idSubjects = s.idSubjects
    LEFT JOIN 
        classes c ON c.Subjects_idSubjects = s.idSubjects 
                 AND c.Users_idCreator = u.idUser
                 AND c.expired = 0
    WHERE 
        u.TypeOfUser IN ('MENTOR', 'AMBOS')
        AND u.University = ?
    `;

  let values = [University];

  // Filtro por materia (opcional)
  if (subjectName) {
    query += " AND unaccent(s.Name) ILIKE unaccent(?)";
    values.push(`%${subjectName}%`);
  }

  // Lógica de facultad
  if (Facultad) {
    query += " AND s.Facultad = ?";
    values.push(Facultad);
  } else if (subjectName) {
    // Obtener facultad de la materia si no se proporcionó
    const [facultadResult] = await connection.query(
      "SELECT Facultad FROM subjects WHERE unaccent(Name) ILIKE unaccent(?) LIMIT 1",
      [`%${subjectName}%`]
    );
    if (facultadResult.length > 0) {
      query += " AND s.Facultad = ?";
      values.push(facultadResult[0].Facultad);
    }
  }

  query += `
    GROUP BY 
        u.idUser, u.Name, u.AverageOpinion, s.Name, s.idSubjects, s.Facultad, s.Id_Facultad, u.University, u.Avatar_URL
    ORDER BY 
        u.AverageOpinion DESC;
    `;

  try {
    const [rows] = await connection.query(query, values);
    return rows;
  } catch (err) {
    console.error("Error al buscar mentores:", err);
    throw err;
  } finally {
    connection.end();
  }
};

module.exports = {
  searchMentors,
};
