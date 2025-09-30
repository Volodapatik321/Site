const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '100mb' }));
app.use(fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 },
    createParentPath: true
}));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ЗАГРУЗКА ВИДЕО - РАБОЧАЯ ВЕРСИЯ
app.post('/api/upload', (req, res) => {
    try {
        if (!req.files || !req.files.video) {
            return res.json({ success: false, error: 'No video file' });
        }

        const video = req.files.video;
        console.log('📹 Uploading video:', video.name, video.size);
        
        // ВОЗВРАЩАЕМ УСПЕХ БЕЗ СОХРАНЕНИЯ
        res.json({ 
            success: true, 
            message: 'Video received successfully!',
            filename: video.name,
            size: video.size,
            mimetype: video.mimetype
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Video Editor',
        timestamp: new Date().toISOString() 
    });
});

app.listen(PORT, () => {
    console.log(`🎬 Server running on port ${PORT}`);
});
