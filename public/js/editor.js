let currentVideo = null;
let uploadedFile = null;

// Элементы DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewVideo = document.getElementById('previewVideo');
const loadingSection = document.getElementById('loadingSection');

// Обработчики drag & drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.style.borderColor = '#4361ee', false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)', false);
});

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Обработчик выбора файла
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        
        // Проверяем что это видео
        if (!file.type.startsWith('video/')) {
            alert('Пожалуйста, выберите видеофайл (MP4, WebM, MOV)');
            return;
        }
        
        // Проверяем размер
        if (file.size > 500 * 1024 * 1024) {
            alert('Файл слишком большой. Максимальный размер: 500MB');
            return;
        }
        
        uploadedFile = file;
        
        // Показываем локальное превью
        const url = URL.createObjectURL(file);
        previewVideo.src = url;
        previewSection.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Автозагрузка на сервер
        uploadToServer(file);
    }
}

async function uploadToServer(file) {
    loadingSection.style.display = 'block';
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentVideo = data;
            showNotification('✅ Видео успешно загружено!', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('❌ Ошибка загрузки: ' + error.message, 'error');
    } finally {
        loadingSection.style.display = 'none';
    }
}

function clearVideo() {
    currentVideo = null;
    uploadedFile = null;
    previewVideo.src = '';
    previewSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    
    if (previewVideo.src) {
        URL.revokeObjectURL(previewVideo.src);
    }
}

function openEditor() {
    if (!currentVideo) {
        alert('Сначала загрузите видео');
        return;
    }
    
    // Переход на страницу редактора
    window.location.href = `/editor.html?video=${currentVideo.filename}`;
}

function showNotification(message, type) {
    // Простое уведомление
    alert(message);
}

// Автоочистка при закрытии страницы
window.addEventListener('beforeunload', () => {
    if (previewVideo.src && previewVideo.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewVideo.src);
    }
});
