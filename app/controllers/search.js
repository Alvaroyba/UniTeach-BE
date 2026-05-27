const searchModels = require('../models/searchModels');

const searchMentors = async (req, res) => {
    try {
        const { University, subjectName, Facultad } = req.query;

        // Validar que 'university' esté presente
        if (!University) {
            return res.status(400).json({ error: 'Debe proporcionar el nombre de la universidad.' });
        }

        // Llamar a la función que hace la búsqueda en la base de datos
        const results = await searchModels.searchMentors(subjectName, Facultad, University);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

module.exports = { searchMentors };
