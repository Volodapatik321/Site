const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '500mb' }));
app.use(fileUpload({
    limits: { fileSize: 500 * 1024 * 1024 },
    createParentPath: true
}));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница редактора
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// Загрузка видео
app.post('/api/upload', (req, res) => {
    try {
        if (!req.files || !req.files.video) {
            return res.json({ success: false, error: 'No video file' });
        }

        const video = req.files.video;
        
        // Создаем папку uploads если нет
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        
        const fileName = `upload_${Date.now()}_${video.name.replace(/\s/g, '_')}`;
        const filePath = path.join(__dirname, 'uploads', fileName);

        video.mv(filePath, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.json({ success: false, error: err.message });
            }
            
            res.json({ 
                success: true, 
                filename: fileName,
                url: `/uploads/${fileName}`,
                size: video.size,
                mimetype: video.mimetype
            });
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Статические файлы загрузок
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API для базовых операций с видео
app.post('/api/video/process', (req, res) => {
    // Здесь будет обработка видео (пока заглушка)
    res.json({ 
        success: true, 
        message: 'Video processing will be implemented soon',
        operation: req.body.operation
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Video Editor',
        timestamp: new Date().toISOString(),
        features: ['upload', 'preview', 'basic_processing']
    });
});

app.listen(PORT, () => {
    console.log(`🎬 Video Editor Server running on port ${PORT}`);
    console.log(`📱 Open: http://localhost:${PORT}`);
    console.log(`🔧 Health: http://localhost:${PORT}/health`);
});
