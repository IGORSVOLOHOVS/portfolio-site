// routes/cvRoutes.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const basicAuthMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CV_FILENAME = process.env.CV_FILENAME || 'cv.pdf';
const CV_FILE_PATH = path.join(UPLOAD_DIR, CV_FILENAME);

// --- Настройка Multer для загрузки файла ---
// Убедимся, что папка uploads существует
if (!fs.existsSync(UPLOAD_DIR)) {
    try {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`Создана директория: ${UPLOAD_DIR}`);
    } catch (err) {
        console.error(`Ошибка при создании директории ${UPLOAD_DIR}:`, err);
        process.exit(1); // Останавливаем приложение, если не можем создать папку
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR); // Папка для сохранения
    },
    filename: function (req, file, cb) {
        // Всегда сохраняем под одним и тем же именем, заменяя старый файл
        cb(null, CV_FILENAME);
    }
});

const fileFilter = (req, file, cb) => {
    // Принимаем только PDF файлы
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Неверный тип файла, разрешены только PDF!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // Лимит 10MB
    }
}).single('cvfile'); // 'cvfile' - это имя поля input type="file" в форме

// --- Маршруты ---

// Маршрут для получения файла CV (для PDF.js и скачивания)
router.get('/api/cv', (req, res) => {
    if (fs.existsSync(CV_FILE_PATH)) {
        res.sendFile(path.resolve(CV_FILE_PATH));
    } else {
        console.warn(`Запрос /api/cv: Файл ${CV_FILE_PATH} не найден.`);
        res.status(404).send('Файл CV не найден. Загрузите его через /upload.');
    }
});

// Маршрут для скачивания файла CV
router.get('/download', (req, res) => {
    if (fs.existsSync(CV_FILE_PATH)) {
        // Предлагаем скачать файл с осмысленным именем
        res.download(CV_FILE_PATH, `Igors_Volohovs_CV.pdf`, (err) => {
            if (err) {
                console.error("Ошибка при скачивании файла:", err);
                if (!res.headersSent) {
                    res.status(500).send('Не удалось скачать файл.');
                }
            }
        });
    } else {
        console.warn(`Запрос /download: Файл ${CV_FILE_PATH} не найден.`);
        res.status(404).send('Файл CV для скачивания не найден.');
    }
});

// --- Маршруты для владельца (защищенные) ---

// Страница загрузки (защищено Basic Auth)
// Отдаем простой HTML файл для формы загрузки
router.get('/upload', basicAuthMiddleware, (req, res) => {
    // Используем resolve для получения абсолютного пути
    res.sendFile(path.resolve(__dirname, '../views/upload_form.html'));
});

// Обработка загрузки файла (защищено Basic Auth)
router.post('/upload', basicAuthMiddleware, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Ошибка Multer при загрузке
            console.error("Multer Error:", err);
            return res.status(400).send(`Ошибка загрузки: ${err.message}`);
        } else if (err) {
            // Другая ошибка (например, неверный тип файла)
            console.error("File Upload Error:", err);
            return res.status(400).send(`Ошибка: ${err.message}`);
        }
        // Файл успешно загружен и заменен
        console.log(`Файл CV успешно обновлен пользователем ${req.auth.user}: ${CV_FILE_PATH}`);
        // Отправляем страницу успеха
        res.sendFile(path.resolve(__dirname, '../views/upload_success.html'));
    });
});

module.exports = router;
