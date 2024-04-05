// server.js

const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Создаем экземпляр Express приложения
const app = express();

// Загрузка конфигурации из файла .env
dotenv.config();

// Подключаемся к базе данных PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Пример использования конфигурации
console.log('Пользователь базы данных:', process.env.DB_USER);
console.log('Хост базы данных:', process.env.DB_HOST);
console.log('Имя базы данных:', process.env.DB_DATABASE);
console.log('Пароль базы данных:', process.env.DB_PASSWORD);
console.log('Порт базы данных:', process.env.DB_PORT);

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
