// 本地 API 服务器 - 临时解决方案
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 配置 multer 用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 健康检查
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'PhotoBox Local API Server is running',
        timestamp: new Date().toISOString()
    });
});

// OCR 端点 - 模拟实现
app.post('/ocr', (req, res) => {
    try {
        const { image, filename } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'No image data provided'
            });
        }
        
        // 模拟 OCR 处理
        const mockText = `模拟识别文本 - ${filename || 'image'}\n包含关键词: 测试, 图片, 文字`;
        
        res.json({
            success: true,
            text: mockText,
            filename: filename || 'unknown',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 背景移除端点 - 模拟实现
app.post('/remove-background', (req, res) => {
    try {
        const { image, newBgColor } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'No image data provided'
            });
        }
        
        // 模拟背景移除处理
        // 在实际实现中，这里会调用 AI 模型进行背景移除
        // 现在返回原始图片作为占位符
        
        res.json({
            success: true,
            message: 'Background removal completed (simulated)',
            backgroundColor: newBgColor || '#FFFFFF',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Background Removal Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 PhotoBox Local API Server running on http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`  GET  / - Health check`);
    console.log(`  POST /ocr - OCR text recognition`);
    console.log(`  POST /remove-background - Background removal`);
    console.log(`\n💡 To use with your frontend, update the API URL to: http://localhost:${PORT}`);
});

module.exports = app;
