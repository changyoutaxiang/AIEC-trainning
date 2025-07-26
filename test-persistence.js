/**
 * 持久化存储测试脚本
 * 验证Zeabur持久化存储卷是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 持久化存储测试开始...\n');

// 测试持久化路径
const persistentPath = '/data';
const testFile = path.join(persistentPath, 'test-persistence.txt');
const timestamp = new Date().toISOString();

console.log(`📍 持久化路径: ${persistentPath}`);
console.log(`📍 测试文件: ${testFile}`);

// 1. 检查持久化目录是否存在
if (fs.existsSync(persistentPath)) {
    console.log('✅ 持久化目录存在');
    
    // 检查权限
    try {
        fs.accessSync(persistentPath, fs.constants.W_OK);
        console.log('✅ 持久化目录可写');
    } catch (err) {
        console.error('❌ 持久化目录不可写:', err.message);
        process.exit(1);
    }
} else {
    console.error('❌ 持久化目录不存在');
    process.exit(1);
}

// 2. 检查是否有之前的测试文件
if (fs.existsSync(testFile)) {
    const content = fs.readFileSync(testFile, 'utf8');
    console.log(`📜 发现之前的测试文件内容: ${content}`);
    console.log('🎉 持久化存储正常工作！');
} else {
    console.log('📝 未发现之前的测试文件，这可能是首次部署');
}

// 3. 写入新的测试文件
try {
    fs.writeFileSync(testFile, `测试时间: ${timestamp}\n部署ID: ${process.env.ZEABUR_DEPLOYMENT_ID || 'unknown'}`);
    console.log(`✅ 成功写入测试文件: ${timestamp}`);
} catch (err) {
    console.error('❌ 写入测试文件失败:', err.message);
}

// 4. 检查数据库目录
const dbDir = '/data/database';
if (fs.existsSync(dbDir)) {
    console.log(`📁 数据库目录存在: ${dbDir}`);
    
    const dbFile = path.join(dbDir, 'aiec_users.db');
    if (fs.existsSync(dbFile)) {
        const stats = fs.statSync(dbFile);
        console.log(`📊 数据库文件存在，大小: ${stats.size} bytes`);
        console.log(`📅 最后修改: ${stats.mtime}`);
    } else {
        console.log('📊 数据库文件不存在');
    }
} else {
    console.log(`📁 数据库目录不存在: ${dbDir}`);
}

console.log('\n🧪 持久化存储测试完成');