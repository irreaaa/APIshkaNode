// controllers/meteostationController.js

const express = require('express');
const router = express.Router();


// Добавление метеостанции
module.exports = function(pool) {
    const meteostationRepository = require('../repository/meteostationRepository')(pool);
    router.post('/', async (req, res) => {
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await meteostationRepository.addMeteostation(req.body);
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при добавлении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при добавлении метеостанции'});
        }
    });

// Удаление метеостанции
    router.delete('/:id', async (req, res) => {
        const {id} = req.params;
        try {
            if (!(await meteostationRepository.getMeasurement(id)).length) {
                await meteostationRepository.deleteMeteostationSensor(id);
                await meteostationRepository.deleteMeteostation(id);
                res.sendStatus(200);
            } else {
                throw new Error('Невозможно удалить, существуют записи');
            }
        } catch (error) {
            console.error('Ошибка при удалении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при удалении метеостанции'});
        }
    });

// Обновление информации о метеостанции
    router.put('/:id', async (req, res) => {
        const {id} = req.params;
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await meteostationRepository.updateMeteostation({id, ...req.body});
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при обновлении метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при обновлении метеостанции'});
        }
    });

// Получение всех метеостанций
    router.get('/', async (req, res) => {
        try {
            const meteostations = await meteostationRepository.getAllMeteostations();
            res.json(meteostations);
        } catch (error) {
            console.error('Ошибка при получении всех метеостанций:', error);
            res.status(500).json({message: 'Произошла ошибка при получении всех метеостанций'});
        }
    });

// Получение датчиков для метеостанции
    router.get('/:station_id/sensor', async (req, res) => {
        const {station_id} = req.params;
        try {
            const sensors = await meteostationRepository.getSensorsByMeteostation(station_id);
            res.json(sensors);
        } catch (error) {
            console.error('Ошибка при получении датчиков для метеостанции:', error);
            res.status(500).json({message: 'Произошла ошибка при получении датчиков для метеостанции'});
        }
    });

    router.post('/aloha', async (req, res) => {
        try {
            if(req.body.meteostation.longitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            }
            if(req.body.meteostation.latitude > -180 < 180) {
                return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            }
            await meteostationRepository.addMeteostationSensor(req.body.meteostations_sensors);
            res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при привязке новых датчиков к метеостанциям:', error);
            res.status(500).json({ message: 'Произошла ошибка при привязке новых датчиков к метеостанциям' });
        }
    });

    router.put('/:sensor_inventory_number/removed_ts', async (req, res) => {
        const { sensor_inventory_number } = req.params;
        const { removed_ts } = req.body;
        try {
            // if(req.body.meteostation.longitude > -180 < 180) {
            //     return res.status(300).json({message: 'ограничение нв longitude от -180 до 180'});
            // }
            // if(req.body.meteostation.latitude > -180 < 180) {
            //     return res.status(300).json({message: 'ограничение нв latitude от -180 до 180'});
            // }
            await meteostationRepository.removeMeteostationSensor(sensor_inventory_number, removed_ts);
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при удалении датчика:', error);
            res.status(500).json({ message: 'Произошла ошибка при удалении датчика' });
        }
    });

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

