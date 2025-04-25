// middleware/auth.js
const basicAuth = require('express-basic-auth');
require('dotenv').config(); // Загружаем переменные окружения

const adminUser = process.env.BASIC_AUTH_USER;
const adminPassword = process.env.BASIC_AUTH_PASSWORD;

if (!adminUser || !adminPassword) {
    console.error("Ошибка: Не заданы учетные данные BASIC_AUTH_USER или BASIC_AUTH_PASSWORD в .env");
    process.exit(1); // Останавливаем приложение, если нет учетных данных
}

const users = {};
users[adminUser] = adminPassword;

const unauthorizedResponse = (req) => {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided';
};

const authenticator = basicAuth({
    users: users,
    challenge: true, // Показывать стандартное окно Basic Auth в браузере
    unauthorizedResponse: unauthorizedResponse
});

module.exports = authenticator;
