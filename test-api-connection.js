// 测试 API 连接的脚本
const https = require('https');

const API_URL = 'https://1300931050-hb0xxy3l23.ap-guangzhou.tencentscf.com';

console.log('🔍 测试 API 连接...');
console.log('API URL:', API_URL);

// 测试健康检查
function testHealthCheck() {
    return new Promise((resolve, reject) => {
        const req = https.get(API_URL, (res) => {
            console.log('✅ 健康检查响应状态:', res.statusCode);
            console.log('响应头:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('响应内容:', data);
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ 健康检查失败:', err.message);
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ 请求超时');
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// 测试 OCR 端点
function testOCREndpoint() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
            filename: 'test.jpg'
        });
        
        const options = {
            hostname: '1300931050-hb0xxy3l23.ap-guangzhou.tencentscf.com',
            port: 443,
            path: '/ocr',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            console.log('✅ OCR 端点响应状态:', res.statusCode);
            console.log('响应头:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('OCR 响应内容:', data);
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ OCR 端点测试失败:', err.message);
            reject(err);
        });
        
        req.write(postData);
        req.end();
        
        req.setTimeout(15000, () => {
            console.log('❌ OCR 请求超时');
            req.destroy();
            reject(new Error('OCR request timeout'));
        });
    });
}

// 运行测试
async function runTests() {
    try {
        console.log('\n=== 测试 1: 健康检查 ===');
        await testHealthCheck();
        
        console.log('\n=== 测试 2: OCR 端点 ===');
        await testOCREndpoint();
        
        console.log('\n✅ 所有测试完成');
    } catch (error) {
        console.log('\n❌ 测试失败:', error.message);
        console.log('\n可能的原因:');
        console.log('1. 腾讯云函数未部署或未启动');
        console.log('2. HTTP 触发器未正确配置');
        console.log('3. 网络连接问题');
        console.log('4. CORS 配置问题');
    }
}

runTests();
