const express = require('express');
const router = express.Router();


module.exports = function(pool) {

// Привязка типов измерений к датчику
    router.post("/:sensor_id", async (req, res) => {
        const {sensor_id} = req.params;
        const {sensors_measurements} = req.body;
        try {
            const client = await pool.connect();
            await client.query('BEGIN'); // Начало транзакции
            for (const sensorMeasurements of sensors_measurements) {
                const sql1 = "INSERT INTO sensors_measurements (sensor_id, type_id, measurment_formula) VALUES ($1, $2, $3)";
                await client.query(sql1, [sensor_id, sensorMeasurements.type_id, sensorMeasurements.measurement_formula]);
                const sql2 = "INSERT INTO measurements_type (type_id, type_name, type_units) VALUES ($1, $2, $3)";
                await client.query(sql2, [sensorMeasurements.type_id, sensorMeasurements.type_name, sensorMeasurements.type_units]);
            }
            await client.query('COMMIT'); // Фиксация транзакции
            client.release();
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            await client.query('ROLLBACK'); // Откат транзакции в случае ошибки
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

// Удаление типов измерений для датчика
    router.delete("/:type_id", async (req, res) => {
        const {type_id} = req.params;
        const {measurement_type} = req.body;
        try {
            const client = await pool.connect();
            await client.query('BEGIN'); // Начало транзакции
            for (const mt of measurement_type) {
                const sql1 = "SELECT * FROM measurements WHERE measuremnet_type = $1";
                const result = await client.query(sql1, [mt]);
                if (result.rows.length > 0) throw new Error("Существуют записи, удаление невозможно");
                const sql2 = "DELETE FROM sensors_measurements WHERE type_id = $1";
                await client.query(sql2, [mt]);
            }
            const sql3 = "DELETE FROM measurements_type WHERE type_id = $1";
            await client.query(sql3, [type_id]);
            await client.query('COMMIT'); // Фиксация транзакции
            client.release();
            res.sendStatus(204);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            await client.query('ROLLBACK'); // Откат транзакции в случае ошибки
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

// Добавление нового типа измерения
    router.post("/", async (req, res) => {
        const {type_name, type_units} = req.body;
        try {
            const client = await pool.connect();
            const sql = "INSERT INTO measurements_type (type_name, type_units) VALUES ($1, $2)";
            await client.query(sql, [type_name, type_units]);
            client.release();
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

// Обновление информации о типе измерения
    router.put("/:type_id", async (req, res) => {
        const {type_id} = req.params;
        const {type_name, type_units} = req.body;
        try {
            const client = await pool.connect();
            let sql;
            if (type_name && type_units) {
                sql = "UPDATE measurements_type SET type_name = $1, type_units = $2 WHERE type_id = $3";
                await client.query(sql, [type_name, type_units, type_id]);
            } else if (type_name) {
                sql = "UPDATE measurements_type SET type_name = $1 WHERE type_id = $2";
                await client.query(sql, [type_name, type_id]);
            } else if (type_units) {
                sql = "UPDATE measurements_type SET type_units = $1 WHERE type_id = $2";
                await client.query(sql, [type_units, type_id]);
            }
            client.release();
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

// Получение всех типов измерений
    router.get("/", async (req, res) => {
        try {
            const client = await pool.connect();
            const sql = "SELECT * FROM sensors_measurements";
            const result = await client.query(sql);
            console.log(result)
            client.release();
            const typeList = result.rows;
            res.json(typeList);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });
    return router;
}


