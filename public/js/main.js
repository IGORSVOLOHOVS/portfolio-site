// public/js/main.js
import * as pdfjsLib from 'pdfjs-dist';

// Указываем путь к worker'у PDF.js ОТНОСИТЕЛЬНО HTML СТРАНИЦЫ
// Убедитесь, что файл pdf.worker.mjs доступен по этому пути на сервере
// Он должен лежать рядом с pdf.mjs в папке public/js/pdfjs/build/
pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdfjs/build/pdf.worker.mjs';

const url = '/api/cv'; // URL для получения PDF файла с бэкенда
const container = document.getElementById('pdf-viewer-container');

async function renderPdf() {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        console.log('PDF загружен');
        container.innerHTML = ''; // Очищаем сообщение "Загрузка..."

        // Загружаем и рендерим каждую страницу
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            console.log('Страница ' + pageNum + ' загружена');

            const scale = 1.5; // Масштаб отображения
            const viewport = page.getViewport({ scale: scale });

            // Создаем canvas для текущей страницы
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // Добавляем стили прямо здесь или через CSS
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto 15px auto'; // Центрируем и добавляем отступ снизу
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.border = '1px solid #ccc';
            canvas.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';


            // Добавляем canvas в контейнер
            container.appendChild(canvas);

            // Рендерим страницу PDF на canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
            console.log('Страница ' + pageNum + ' отрендерена');
        }
    } catch (reason) {
        // Ошибка загрузки PDF
        console.error('Ошибка загрузки или рендеринга PDF:', reason);
        let errorMessage = 'Не удалось загрузить PDF файл.';
        if (reason?.status === 404) {
             errorMessage += ' Файл cv.pdf не найден на сервере. Пожалуйста, загрузите его через страницу /upload.';
        } else if (reason instanceof Error) {
             errorMessage += ` Причина: ${reason.message}`;
        } else if (typeof reason === 'string') {
             errorMessage += ` Причина: ${reason}`;
        }
        container.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${errorMessage}</p>`;
    }
}

// Запускаем рендеринг при загрузке страницы
renderPdf();
