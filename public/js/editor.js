let currentVideo = null;

// Элементы DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewVideo = document.getElementById('previewVideo');
const loadingSection = document.getElementById('loadingSection');

// Дебаг функция
function debug(message) {
    console.log('🔧 DEBUG:', message);
    alert('🔧 ' + message); // Показываем всплывающее окно
}

// Обработчик выбора файла
fileInput.addEventListener('change', function() {
    debug('Файл выбран в input');
    handleFiles(this.files);
});

function handleFiles(files) {
    debug('Обрабатываем файлы: ' + files.length);
    
    if (files.length > 0) {
        const file = files[0];
        debug('Файл: ' + file.name + ' (' + file.type + ')');
        
        if (!file.type.startsWith('video/')) {
            alert('❌ Это не видео файл!');
            return;
        }
        
        if (file.size > 100 * 1024 * 1024) {
            alert('❌ Файл слишком большой! Макс: 100MB');
            return;
        }
        
        // Показываем локальное превью
        debug('Создаем превью...');
        const url = URL.createObjectURL(file);
        previewVideo.src = url;
        previewSection.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Пробуем загрузить на сервер
        debug('Пробуем загрузить на сервер...');
        uploadToServer(file);
    }
}

async function uploadToServer(file) {
    debug('Начинаем загрузку на сервер...');
    loadingSection.style.display = 'block';
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
        debug('Отправляем fetch запрос...');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        debug('Получили ответ: ' + response.status);
        
        const data = await response.json();
        debug('Данные ответа: ' + JSON.stringify(data));
        
        if (data.success) {
            currentVideo = data;
            alert('✅ ' + data.message);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        debug('❌ Ошибка: ' + error.message);
        alert('❌ Ошибка загрузки: ' + error.message);
    } finally {
        loadingSection.style.display = 'none';
    }
}

function clearVideo() {
    currentVideo = null;
    previewVideo.src = '';
    previewSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    debug('Видео очищено');
}

// Инициализация
debug('Страница загружена!');
