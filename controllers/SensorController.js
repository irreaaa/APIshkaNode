// controllers/SensorController.js

const express = require('express');
const router = express.Router();

module.exports = function(pool) {
    // Получение списка датчиков
    router.get('/', async (req, res) => {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM sensors');
            client.release();
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    // Получение информации о датчике по ID
    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM sensors WHERE sensor_id = $1', [id]);
            client.release();
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    // Добавление нового датчика
    router.post('/', async (req, res) => {
        const { sensorName, sensor_id } = req.body;
        try {
            const client = await pool.connect();
            const result = await client.query('INSERT INTO sensors (sensor_name, sensor_id) VALUES ($1, $2) RETURNING *', [sensorName, sensor_id]);
            client.release();
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    // Обновление информации о датчике
    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const { sensorName } = req.body;
        try {
            const client = await pool.connect();
            const result = await client.query('UPDATE sensors SET sensor_name = $1 WHERE sensor_id = $2 RETURNING *', [sensorName, id]);
            client.release();
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    // Удаление датчика по ID
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const client = await pool.connect();
            await client.query('DELETE FROM sensors WHERE sensor_id = $1', [id]);
            client.release();
            res.status(204).end();
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    return router;
};
