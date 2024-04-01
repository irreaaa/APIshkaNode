// routes/apiRoutes.js

const express = require('express');
const router = express.Router();

// Подключаем контроллер для управления датчиками
const sensorController = require('../controllers/SensorController');

module.exports = function(pool) {
    // Определяем маршруты для контроллера датчиков и передаем пул соединений
    router.use('/sensors', sensorController(pool));

    return router;
};


