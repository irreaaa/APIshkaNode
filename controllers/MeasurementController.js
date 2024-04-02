const express = require('express');
const router = express.Router();


module.exports = function(pool) {
    // Добавление новых измерений
    router.post('/', async (req, res) => {
        try {
            const measurements = req.body;
            const query = 'INSERT INTO measurements (sensor_inventory_number, measurement_value, measurement_ts, measuremnet_type) VALUES ($1, $2, $3, $4)';
            await Promise.all(measurements.map(async (measurement) => {
                await pool.query(query, [measurement.sensor_inventory_number, measurement.measurement_value, measurement.measurement_ts, measurement.measuremnet_type]);
            }));
            res.status(201).send('Measurements added successfully');
        } catch (error) {
            console.error('Error adding measurements', error);
            res.status(500).send('Error adding measurements');
        }
    });

// Получение записей с условием
    router.get('/', async (req, res) => {
        try {
            const { meteostation, sensor } = req.query;
            let query = 'SELECT * FROM measurements WHERE 1=1';
            const queryParams = [];
            if (meteostation) {
                query += ' AND sensor_inventory_number = $1';
                queryParams.push(meteostation);
            }
            if (sensor) {
                query += ' AND measuremnet_type = $2';
                queryParams.push(sensor);
            }
            const result = await pool.query(query, queryParams);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching measurements', error);
            res.status(500).send('Error fetching measurements');
        }
    });

// Получение всех записей
    router.get('/all', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM measurements');
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching measurements', error);
            res.status(500).send('Error fetching measurements');
        }
    });

// Удаление записей по условию
    router.delete('/', async (req, res) => {
        try {
            const conditions = req.body.conditions; // Используйте conditions.conditions
            console.log(conditions); // Выведем для отладки
            const query = 'DELETE FROM measurements WHERE sensor_inventory_number = $1 AND measuremnet_type = $2';
            await Promise.all(conditions.map(async (condition) => {
                await pool.query(query, [condition.condition.sensor_inventory_number, condition.condition.measuremnet_type]);
            }));
            res.send('Measurements deleted successfully');
        } catch (error) {
            console.error('Error deleting measurements', error);
            res.status(500).send('Error deleting measurements');
        }
    });
    return router;
}

