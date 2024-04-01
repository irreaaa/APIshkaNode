// routes/apiRoutes.js

const express = require('express');
const router = express.Router();

// Подключаем контроллер для управления датчиками
const sensorController = require('../controllers/SensorController');
const measurementTypeController = require('../controllers/MeasurementTypeController');
const meteostationController = require('../controllers/MeteostationController');

module.exports = function(pool) {
    // Определяем маршруты для контроллера датчиков и передаем пул соединений
    router.use('/sensors', sensorController(pool));
    router.use('/sensors_measurements', measurementTypeController(pool));
    router.use('/meteostation', meteostationController(pool));


    return router;
};


