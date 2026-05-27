const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
    if (err) {
        console.error('***** ERROR DE CONEXION A DB*****:', err);
    } else {
        console.log('**** CONEXION A DB CORRECTA ****');
        release();
    }
});

const caseMap = {
  iduser: 'idUser', username: 'Username', password: 'Password', name: 'Name', dni: 'DNI', legajo: 'Legajo',
  typeofuser: 'TypeOfUser', mail: 'Mail', phone: 'Phone', university: 'University', avatar_url: 'Avatar_URL',
  opinion: 'Opinion', numberopinion: 'NumberOpinion', averageopinion: 'AverageOpinion',
  idsubjects: 'idSubjects', users_iduser: 'Users_idUser', subjects_idsubjects: 'Subjects_idSubjects',
  idclasses: 'idClasses', place: 'Place', users_idcreator: 'Users_idCreator', enddate: 'endDate',
  idinscription: 'idInscription', classes_idclasses: 'Classes_idClasses', idalumno: 'idAlumno', idmentor: 'idMentor',
  mentorname: 'MentorName', subjectname: 'SubjectName', idmateria: 'IdMateria', facultad: 'Facultad',
  idfacultad: 'IdFacultad', id_facultad: 'Id_Facultad', mentoruniversity: 'MentorUniversity', classdetails: 'ClassDetails',
  idcareer: 'idCareer',
  date: 'Date',
  description: 'Description',
  userid: 'userId', createdat: 'createdAt', expiresat: 'expiresAt'
};

const mapRowKeys = (row) => {
    const newRow = {};
    for (const key in row) {
        const mappedKey = caseMap[key] || key;
        newRow[mappedKey] = row[key];
    }
    return newRow;
};

const executeQuery = async (queryText, values) => {
    let index = 1;
    let transformedQuery = queryText;
    if (queryText && queryText.includes('?')) {
        transformedQuery = queryText.replace(/\?/g, () => `$${index++}`);
    }
    const res = await pool.query(transformedQuery, values);
    
    if (res.command === 'SELECT') {
        const mappedRows = res.rows.map(mapRowKeys);
        return [mappedRows, res.fields];
    } else {
        const resultObj = {
            affectedRows: res.rowCount,
        };
        return [resultObj, res.fields];
    }
};

const promiseWrapper = {
    query: executeQuery,
    execute: executeQuery,
    end: async () => {},
};

const dbConnect = () => {
    return {
        promise: () => promiseWrapper,
        query: (queryText, values, cb) => {
            if (typeof values === 'function') {
                cb = values;
                values = undefined;
            }
            executeQuery(queryText, values)
                .then(res => cb(null, res[0], res[1]))
                .catch(err => cb(err));
        },
        end: () => {}
    };
};

module.exports = { dbConnect };
