// server.js

const express = require('express');
const { Pool } = require('pg');

// Создаем экземпляр Express приложения
const app = express();

// Подключаемся к базе данных PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'measur',
    password: '2121',
    port: 5432 // Порт PostgreSQL
});

// Подключаем middleware для обработки JSON данных
app.use(express.json());

// Подключаем роуты и передаем пул соединений
const apiRoutes = require('./routes/apiRoutes')(pool); // Вызываем функцию, передавая pool

app.use('/api', apiRoutes);

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
