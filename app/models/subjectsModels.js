const { dbConnect } = require('../../config/mysql');

const createSubject = async (subjectData) => {
    const connection = await dbConnect().promise();
    const query = "INSERT INTO subjects (Name, University) VALUES (?, ?)";
    const values = [subjectData.Name, subjectData.University];
    
    try {
        const [result] = await connection.query(query, values);
        return result;
    } catch (err) {
        throw err;
    } finally {
        await connection.end();
    }
}

const getAllSubjects = async () => {
    const connection = await dbConnect().promise();
    const query = "SELECT * FROM subjects";
    
    try {
        const [results] = await connection.query(query);
        return results;
    } catch (err) {
        throw err;
    } finally {
        await connection.end();
    }
}

const getSubjectById = async (subjectId) => {
    const connection = await dbConnect().promise();
    const query = "SELECT * FROM subjects WHERE idSubjects = ?";
    
    try {
        const [results] = await connection.query(query, [subjectId]);
        return results.length > 0 ? results[0] : null;
    } catch (err) {
        throw err;
    } finally {
        await connection.end();
    }
}

const modifySubject = async (subjectId, subjectData) => {
    const connection = await dbConnect().promise();
    
    let query = "UPDATE subjects SET ";
    const fields = Object.keys(subjectData);
    const setValues = fields.map(field => `${field} = ?`).join(', ');
    query += setValues + " WHERE idSubjects = ?";

    const values = fields.map(field => subjectData[field]);
    values.push(subjectId);
    
    try {
        const [result] = await connection.query(query, values);
        return result;
    } catch (err) {
        throw err;
    } finally {
        await connection.end();
    }
}

const deleteSubject = async (subjectId) => {
    const connection = await dbConnect().promise();
    const query = "DELETE FROM subjects WHERE idSubjects = ?";
    
    try {
        const [result] = await connection.query(query, [subjectId]);
        return result;
    } catch (err) {
        throw err;
    } finally {
        await connection.end();
    }
}

module.exports = { getAllSubjects, getSubjectById, createSubject, modifySubject, deleteSubject };
