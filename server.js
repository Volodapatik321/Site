const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - ДОЛЖНО БЫТЬ ПЕРВЫМ!
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://site-vxvx.onrender.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.static('public'));
app.use(express.json({ limit: '100mb' }));
app.use(fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 },
    createParentPath: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/upload', (req, res) => {
    try {
        if (!req.files || !req.files.video) {
            return res.json({ success: false, error: 'No video file' });
        }

        const video = req.files.video;
        console.log('📹 Uploading video:', video.name, video.size);
        
        res.json({ 
            success: true, 
            message: 'Video uploaded successfully! 🎬',
            filename: video.name,
            size: video.size
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎬 Server running on port ${PORT}`);
});
