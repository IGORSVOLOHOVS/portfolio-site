// app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cvRoutes = require('./routes/cvRoutes');

// Загрузка переменных окружения из .env файла
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware для логирования запросов (простой пример)
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || 'N/A';
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${ip} - Agent: ${userAgent.substring(0, 50)}...`);

    // Логирование попыток доступа к /upload
    if (req.originalUrl.startsWith('/upload')) {
         // express-basic-auth добавляет req.auth при успешной аутентификации
         const authUser = req.auth ? req.auth.user : 'anonymous';
         console.log(`Попытка доступа к /upload пользователем: ${authUser}`);
    }
    next();
});


// Раздача статических файлов из папки 'public'
// Указываем абсолютный путь к папке public
app.use(express.static(path.join(__dirname, 'public')));

// Подключение маршрутов для CV
app.use('/', cvRoutes); // Монтируем маршруты CV в корень

// Обработчик для ненайденных маршрутов (404)
app.use((req, res, next) => {
    res.status(404).send("Извините, страница не найдена!");
});

// Базовый обработчик ошибок (должен быть последним)
app.use((err, req, res, next) => {
    console.error("Глобальная ошибка:", err.stack);
    res.status(err.status || 500).send(err.message || 'Что-то пошло не так!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Сайт доступен по адресу: http://localhost:${PORT}`);
    console.log(`Страница загрузки CV (требует авторизации admin/admin): http://localhost:${PORT}/upload`);
    console.log(`Папка для загрузки CV: ${path.resolve(process.env.UPLOAD_DIR || './uploads')}`);
});
