/**
 Meteostations:
 Добавление новых метеостанций(POST),
 удаление метеостанций(только в том случае, если нет измерений. каскадно удаляются записи meteostations_sensors)(DELETE/{station_id}),
 редактирование станций(PUT),
 просмотр метеостанций(GET),
 просмотр привязанных датчиков к метеостанции(GET/{station_id}/sensor).

 Meteostations sensors
 Привязка новых датчиков к метеостанциям
 POST
 requset
 body{
 “meteostaions_sensors”: [
 “meteostaion_sensor” :{
 “station_id”: 123.
 “sensor_id”: 321,
 “added_ts”: “12.02.2024”
 },
 “meteostaion_sensor” :{
 “station_id”: 121.
 “sensor_id”: 212
 }]
 }
 Удаление датчика
 PUT meteostations_sensors/{sensor_iventory_number}/removed_ts
 request
 body {
 “removed_ts”: 26.02.2024
 }
 (по дефолту используется дата отправки запроса)
 body {
 }

 Вывод всех датчиков:
 GET meteostations_sensors/
 request
 body {
 }
 response
 body {
 “meteostations_sensors”:[{

 “meteostation”: {
 “station_id”: 123,
 “station_name”: “station”,
 “station_longitude”: 12.3,
 “station_latitude”: 12.4,
 “sensors”:[
 {
 “sensor_inventory_number: “12345678912345”,
 “sensor_id”: 1234,
 “sensor_name”: “BME280”.
 “sensor_added_ts”: “”,
 “sensor_remove_ts”: “”
 }]
 }
 }]
 }
 **/

const express = require('express');
const router = express.Router();


// Добавление метеостанции
module.exports = function(pgWrapper) {
    const meteostationRepository = require('../repository/meteostationRepository')(pgWrapper);
    // TODO: ОБЫЧНОЕ ДОБАВЛЕНИЕ METEOSTATION
    router.post('/', async (req, res) => {
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await pgWrapper.transaction(async () => {
                await meteostationRepository.addMeteostation(req.body);
            });
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при добавлении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при добавлении метеостанции'});
        }
    });

    //TODO: УДАЛЕНИЕ МЕТЕОСТАНЦИИ ПО АЙДИ ПРИ УСЛОВИИ ЧТО НЕТ ИЗМЕРЕНИЙ
    router.delete('/:id', async (req, res) => {
        const {id} = req.params;
        try {
            if (!(await meteostationRepository.getMeasurement(id)).length) {
                await pgWrapper.transaction(async () => {
                    await meteostationRepository.deleteMeteostationSensor(id);
                    await meteostationRepository.deleteMeteostation(id);
                });
                return res.status(200);
            } else {
                return res.status(400).json({message: 'Существуют записи'})
            }
        } catch (error) {
            console.error('Ошибка при удалении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при удалении метеостанции'});
        }
    });

    //TODO: ОБНОВЛЕНИЕ ИНФОРМАЦИИ О METEOSTATION
    router.put('/:id', async (req, res) => {
        const {id} = req.params;
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await pgWrapper.transaction(async () => {
                await meteostationRepository.updateMeteostation({id, ...req.body});
            });
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при обновлении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при обновлении метеостанции'});
        }
    });

    //TODO: ПРОСМОТР ВСЕХ МЕТЕОСТАНЦИЙ
    router.get('/', async (req, res) => {
        try {
            return res.json(meteostationRepository.getAllMeteostations());
        } catch (error) {
            console.error('Ошибка при получении всех метеостанций:', error);
            return res.status(500).json({message: 'Произошла ошибка при получении всех метеостанций'});
        }
    });

    //TODO: ПРОСМОТР ПРИВЯЗАННЫХ ДАТЧИКОВ К МЕТЕОСТАНЦИИ
    router.get('/:station_id/sensor', async (req, res) => {
        const {station_id} = req.params;
        try {
            res.json(meteostationRepository.getSensorsByMeteostation(station_id));
        } catch (error) {
            console.error('Ошибка при получении датчиков для метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при получении датчиков для метеостанции'});
        }
    });
    // TODO: ПРИВЯЗКА НОВЫХ ДАТЧИКОВ К МЕТЕОСТАНЦИИ
    router.post('/aloha', async (req, res) => {
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await pgWrapper.transaction(async () => {
                await meteostationRepository.addMeteostationSensor(req.body.meteostations_sensors);
            });
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при привязке новых датчиков к метеостанциям:', error);
            res.status(500).json({ message: 'Произошла ошибка при привязке новых датчиков к метеостанциям' });
        }
    });
    //TODO: УДАЛЕНИЕ (PUT) ПРИ УСЛОВИИ, ЧТО НЕТ ИЗМЕРЕНИЙ
    router.put('/:sensor_inventory_number/removed_ts', async (req, res) => {
        const { sensor_inventory_number } = req.params;
        const { removed_ts } = req.body;
        try {
            if ((await meteostationRepository.getMeasurement2(sensor_inventory_number)).length) return res.status(400).json({message: 'Существуют измерения'});
            await pgWrapper.transaction(async () => {
                await meteostationRepository.removeMeteostationSensor(sensor_inventory_number, removed_ts);
            });
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при удалении датчика:', error);
            res.status(500).json({ message: 'Произошла ошибка при удалении датчика' });
        }
    });
    //TODO: ВЫВОД ВСЕХ ДАТЧИКОВ ( example: {
    //     "meteostations_sensors": {
    //         "meteostations_sensors": [
    //             {
    //                 "meteostation": {
    //                     "station_id": 1,
    //                     "station_name": "dwdw",
    //                     "station_longitude": "23.22",
    //                     "station_latitude": "23.22",
    //                     "sensors": [
    //                         {
    //                             "sensor_inventory_number": "1              ",
    //                             "sensor_id": 1,
    //                             "sensor_name": "aloha"
    //                         }
    //                     ]
    //                 }
    //             }
    //         ]
    //     }
    // } )
    router.get('/aloha', async (req, res) => {
        try {
            const sensors = await meteostationRepository.getAllMeteostationSensors();
            res.json({ meteostations_sensors: sensors });
        } catch (error) {
            console.error('Ошибка при получении всех датчиков:', error);
            res.status(500).json({ message: 'Произошла ошибка при получении всех датчиков' });
        }
    });

    return router;
}

