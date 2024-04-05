// routes/apiRoutes.js

const express = require('express');
const router = express.Router();

// Подключаем контроллер для управления датчиками
const sensorController = require('../controllers/SensorController');
const measurementTypeController = require('../controllers/MeasurementTypeController');
const meteostationController = require('../controllers/MeteostationController');
const measurementController = require('../controllers/MeasurementController');
const sensorsMeasurementController  = require('../controllers/SensorsMeasurementsController');

module.exports = function(pgWrapper) {
    // Определяем маршруты для контроллера датчиков и передаем пул соединений
    router.use('/sensor', sensorController(pgWrapper));
    router.use('/measurementsType', measurementTypeController(pgWrapper));
    router.use('/meteostation', meteostationController(pgWrapper));
    router.use('/measurements', measurementController(pgWrapper));
    router.use('/sensors_measurements', sensorsMeasurementController(pgWrapper));


    return router;
};


