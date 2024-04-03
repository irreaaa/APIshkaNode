/**
 Measurements
 POST Добавление новых измерений (отправляется массив объектов),
 GET /measurements?meteostaion=&&senors вывод записей с условием
 GET /measurements вывод всех записей
 DELETE /measurements Удаление массивом по условию
 **/



const express = require('express');
const router = express.Router();


module.exports = function (pool) {
    // TODO: POST Добавление новых измерений (отправляется массив объектов) ( Пример: {
    //     "measurements": [
    //         {
    //             "sensor_inventory_number": 1,
    //             "measurement_value": 22.22,
    //             "measurement_ts": "12.03.2026",
    //             "measurement_type": 2
    //         },
    //          {
    //             "sensor_inventory_number": 1,
    //             "measurement_value": 23.22,
    //             "measurement_ts": "13.03.2026",
    //             "measurement_type": 2
    //         }
    //     ]
    // } )
    router.post('/', async (req, res) => {
        try {
            await pool.query('BEGIN');
            const {measurements} = req.body;
            const query = 'INSERT INTO measurements (sensor_inventory_number, measurement_value, measurement_ts, measuremnet_type) VALUES ($1, $2, $3, $4)';
            for (const measurement of measurements) {
                await pool.query(query, [measurement.sensor_inventory_number, measurement.measurement_value, measurement.measurement_ts, measurement.measurement_type]);
            }
            await pool.query('COMMIT');
            res.status(201).send('Measurements added successfully');
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error adding measurements', error);
            res.status(500).send('Error adding measurements');
        }
    });

    //TODO: Получение записей с условием ( example: http://localhost:3000/api/measurements?meteostation=1 or http://localhost:3000/api/measurements?meteostation=1&sensor=1 or http://localhost:3000/api/measurements?sensor=1 )
    //TODO: + ПОЛУЧЕНИЕ ВСЕХ ЗАПИСЕЙ ПРИ: http://localhost:3000/api/measurements
    router.get('/', async (req, res) => {
        try {
            const {meteostation, sensor} = req.query;



            if (meteostation && sensor) {
                let query2 = 'SELECT * FROM measurements JOIN public.measurements_type mt on mt.type_id = measurements.measuremnet_type JOIN public.sensors_measurements sm on mt.type_id = sm.type_id JOIN public.sensors s on s.sensor_id = sm.sensor_id WHERE measurements.sensor_inventory_number = $1 and sm.sensor_id = $2';
                const result = await pool.query(query2, [meteostation, sensor]);
                return res.json(result.rows);
            }
            if (meteostation) {
                let query1 = 'SELECT * FROM measurements WHERE public.measurements.sensor_inventory_number = $1';
                const result = await pool.query(query1, [meteostation]);
                return res.json(result.rows);
            }
            if (sensor) {
                let query3 = 'SELECT * FROM measurements JOIN public.measurements_type mt on mt.type_id = measurements.measuremnet_type JOIN public.sensors_measurements sm on mt.type_id = sm.type_id JOIN public.sensors s on s.sensor_id = sm.sensor_id WHERE sm.sensor_id = $1';
                const result = await pool.query(query3, [sensor]);
                return res.json(result.rows);
            }
            const result = await pool.query('SELECT * FROM measurements');

            res.json(result.rows);
        } catch (error) {

            console.error('Error fetching measurements', error);
            res.status(500).send('Error fetching measurements');
        }
    });

    //TODO: УДАЛЕНИЕ ЗАПИСЕЙ ПО УСЛОВИЮ
    router.delete('/', async (req, res) => {
        const client = await pool.connect();
        try {
            const {meteostation, sensor} = req.query;
            // Начать транзакцию
            await client.query('BEGIN');

            if (meteostation && sensor) {
                const deleteQuery = ` DELETE
                                  FROM measurements
                                  WHERE sensor_inventory_number IN (SELECT sensor_inventory_number
                                                                    FROM meteostations_sensors
                                                                    WHERE sensor_id = $1
                                                                      AND station_id = $2)`;
                await client.query(deleteQuery, [sensor, meteostation]);
                return res.json({message: 'Успешно удалено'});
            }
            if (sensor) {
                const deleteQuery = ` DELETE
                                  FROM measurements
                                  WHERE sensor_inventory_number IN (SELECT sensor_inventory_number
                                                                    FROM meteostations_sensors
                                                                    WHERE sensor_id = $1
                                                                    )`;
                await client.query(deleteQuery, [sensor]);
                return res.json({message: 'Успешно удалено'});
            }
            if (meteostation) {
                const deleteQuery = ` DELETE
                                  FROM measurements
                                  WHERE sensor_inventory_number IN (SELECT sensor_inventory_number
                                                                    FROM meteostations_sensors
                                                                    WHERE meteostations_sensors.station_id = $1
                                                                    )`;
                await client.query(deleteQuery, [meteostation]);
                return res.json({message: 'Успешно удалено'});
            }
            await client.query('COMMIT');
            console.log('Записи из таблицы "measurements" успешно удалены.');
            client.release();

            return res.status(400).json({message: 'Ничего не удалено, добавьте параметры meteostation и sensor'})
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка при удалении записей из таблицы "measurements":', error);
        }
    });
    return router;
}

