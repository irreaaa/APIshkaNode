/**
 1. Sensor:
 “/sensor”
 создание новых моделей (POST), удаление моделей (удаление только в том случае, если нет измерений. При удалении с отсутствием измерений каскадно удаляются данные из таблицы sensors_measurements)(DELETE), редактирование моделей(PUT), просмотр всех моделей (GET), просмотр конкретной модели (GET + path parameter)
 При добавлении новой модели сразу же заполняется информация об измеряемых параметров датчиков:
 -request
 body{
 “sensor_name” : “new_sensor”,
 “sensors_measurements”: [
 {“type_id”:123, “type_formula”: “ax^2”},
 {“type_id”:124},
 {“type_id”:125}
 ]
 }
 -response
 body{
 “sensor_id”: 123,
 “sensor_name”: “new_sensor”,
 “sensors_measurements”: [
 {“type_id”:123, “type_name”:”Temperature”, “type_units”: “°C”, “type_formula”: “ax^2”},
 {“type_id”:124, “type_name”: “Pressure”, “type_units”: “hPa”},
 {“type_id”:125, “type_nane”: “Humidity”, “type_units”: “%”}
 ]
 }
 При запросе модели sensor/{sensor_id}/type всегда выводятся типы измеряемых параметров.
 **/


const express = require('express');
const {Router} = require("express");
const router = express.Router();

module.exports = function(pool) {

    //TODO: ПРОСМОТР ВСЕХ МОДЕЛЕЙ
    router.get('/', async (req, res) => {
        try {
            const client = await pool.connect();
            const result = await client.query(`
                SELECT
                sensors.sensor_id,
                sensors.sensor_name,
                array_agg(json_build_object('type_id', mt.type_id, 'measurement_formula', sm.measurment_formula)) AS measurement_types
            FROM
                sensors
                JOIN public.sensors_measurements sm ON sensors.sensor_id = sm.sensor_id
                JOIN public.measurements_type mt ON mt.type_id = sm.type_id
            GROUP BY
                sensors.sensor_id, sensors.sensor_name
        `);
            client.release();
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });

    //TODO: GET + PATH PARAM
    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const { rows } = await pool.query('SELECT * FROM sensors WHERE sensor_id = $1', [id]);
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    router.post('/default', async (req, res) => {
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

    //TODO: POST запрос для сохранения нового датчика
    router.post('/', async (req, res) => {
        const { sensorName, sensorMeasurements } = req.body;
        try {
            const client = await pool.connect();
            await client.query('BEGIN');

            const { rows } = await client.query('INSERT INTO sensors (sensor_name) VALUES ($1) RETURNING sensor_id', [sensorName]);
            const sensorId = rows[0].sensor_id;

            for (const measurement of sensorMeasurements) {
                await client.query('INSERT INTO sensors_measurements (sensor_id, type_id, measurment_formula) VALUES ($1, $2, $3)', [sensorId, measurement.type_id, measurement.measurementFormula]);
            }

            await client.query('COMMIT');
            client.release();
            res.status(201).send();
        } catch (err) {
            await pool.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    });


    //TODO: PUT для обновления Датчика
    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const { sensorName } = req.body;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query('UPDATE sensors SET sensor_name = $1 WHERE sensor_id = $2 RETURNING *', [sensorName, id]);
            await pool.query('COMMIT');
            client.release();
            res.status(200).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({ message: 'Произошла ошибка при выполнении запроса к базе данных' });
        }
    });


    //TODO: DELETE запрос для удаления датчика по ID (если есть измерения не удаляем)
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            await pool.query('BEGIN');
            const { rows } = await pool.query("select * from  sensors_measurements join measurements_type mt on sensors_measurements.type_id = mt.type_id join measurements m on mt.type_id = m.measuremnet_type where sensor_id=$1", [id]);
            console.log(rows)
            if (rows.length!==0) return res.status(300).send("Измерения есть");
            await pool.query('DELETE FROM sensors_measurements WHERE sensor_id = $1', [id]);
            await pool.query('DELETE FROM sensors WHERE sensor_id = $1', [id]);
            await pool.query('COMMIT');
            res.status(200).send();
        } catch (err) {
            await pool.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    });

    //TODO: GET запрос для получения типов измерений для данного датчика по ID
    router.get('/:id/type', async (req, res) => {
        const id = req.params.id;
        try {
            const { rows } = await pool.query('SELECT mt.type_id, sm.measurment_formula, mt.type_name, mt.type_units FROM sensors_measurements sm JOIN measurements_type mt ON mt.type_id = sm.type_id WHERE sensor_id = $1', [id]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    return router;
};
