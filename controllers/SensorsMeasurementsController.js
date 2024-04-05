/**
 Sensors Measurements
 Привязка измерений к сенсорам:
 POST/sensors_measurements/{sensor_id}/
 request
 body{
 “sensors_measurements”: [
 {“type_id”:123, “type_name”:”Temperature”, “type_units”: “°C”, “type_formula”: “ax^2”},
 {“type_id”:124, “type_name”: “Pressure”, “type_units”: “hPa”},
 {“type_id”:125, “type_nane”: “Humidity”, “type_units”: “%”}
 ]}
 DELETE /sensors_measurements/{sensor_id}/
 request
 body{
 “measurements_type”: [123, 124, 125]}
 **/

const express = require('express');
const router = express.Router();


module.exports = function(pgWrapper) {

    // TODO: ПРИВЯЗКА ИЗМЕРЕНИЙ К СЕНСОРУ (POST)
    router.post("/:sensor_id", async (req, res) => {
        const {sensor_id} = req.params;
        const {sensors_measurements} = req.body;
        try {
            await pgWrapper.transaction(async (client) => {
                for (const sensorMeasurements of sensors_measurements) {
                    const sql2 = "INSERT INTO measurements_type (type_id, type_name, type_units) VALUES ($1, $2, $3)";
                    await client.query(sql2, [sensorMeasurements.type_id, sensorMeasurements.type_name, sensorMeasurements.type_units]);
                    const sql1 = "INSERT INTO sensors_measurements (sensor_id, type_id, measurment_formula) VALUES ($1, $2, $3)";
                    await client.query(sql1, [sensor_id, sensorMeasurements.type_id, sensorMeasurements.type_formula]);
                }
            });
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

    // TODO: УДАЛЕНИЕ ( DELETE /sensors_measurements/{sensor_id}/
    //  request
    //  body{ “measurements_type” : [123, 124, 125]} )
    router.delete('/:sensor_id', async (req, res) => {
        const sensor_id = req.params.sensor_id;
        const {measurements_type} = req.body;
        if (!sensor_id || !measurements_type) {
            return res.status(400).json({message: 'Необходимо указать sensor_id и measurements_type в теле запроса'});
        }
        try {
            await pgWrapper.transaction(async (client) => {
                for (const elem of measurements_type) {
                    const sql2 = "SELECT * FROM measurements WHERE measuremnet_type = $1";
                    const result = await client.query(sql2, [elem]);
                    if (result.rows.length > 0) return res.status(400).json({message: 'Существуют измерения, удаление невозможно'});
                    const sql1 = "delete from sensors_measurements where type_id = $1";
                    await client.query(sql1, [elem]);
                    const sql3 = "delete from measurements_type where type_id = $1";
                    await client.query(sql3, [elem]);
                }
            });
            return res.status(200).json({ message: `Измерения для датчика с ID ${sensor_id} успешно удалены` });
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });
    return router;
}