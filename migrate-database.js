/**
 * 数据库迁移脚本
 * 将现有用户数据迁移到持久化路径（如果需要）
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 数据库迁移脚本启动...\n');

// 源数据库路径（当前本地路径）
const sourceDbPath = path.join(__dirname, 'backend/database/aiec_users.db');

// 目标数据库路径（持久化路径，仅在生产环境）
const targetDbPath = process.env.DATABASE_PATH || sourceDbPath;

console.log(`📂 源数据库: ${sourceDbPath}`);
console.log(`📂 目标数据库: ${targetDbPath}`);

// 检查是否需要迁移
if (sourceDbPath === targetDbPath) {
    console.log('ℹ️  当前运行在开发环境，无需迁移数据库');
    console.log('📝 在生产环境中，请确保设置了 DATABASE_PATH 环境变量');
    process.exit(0);
}

// 创建目标目录
const targetDir = path.dirname(targetDbPath);
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 已创建目标目录: ${targetDir}`);
}

// 检查源数据库是否存在
if (!fs.existsSync(sourceDbPath)) {
    console.log('❌ 源数据库不存在，无需迁移');
    process.exit(1);
}

// 执行数据迁移
async function migrateDatabase() {
    try {
        console.log('🔄 开始迁移数据库...');
        
        // 如果目标数据库已存在，备份
        if (fs.existsSync(targetDbPath)) {
            const backupPath = `${targetDbPath}.backup.${Date.now()}`;
            fs.copyFileSync(targetDbPath, backupPath);
            console.log(`📦 已备份现有数据库: ${backupPath}`);
        }
        
        // 复制数据库文件
        fs.copyFileSync(sourceDbPath, targetDbPath);
        console.log('✅ 数据库文件迁移完成');
        
        // 验证迁移结果
        const db = new sqlite3.Database(targetDbPath, sqlite3.OPEN_READONLY);
        
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
            if (err) {
                console.error('❌ 验证迁移失败:', err.message);
                return;
            }
            
            console.log(`✅ 迁移验证通过，用户数量: ${row.count}`);
            
            db.get("SELECT COUNT(*) as count FROM learning_records", [], (err, row) => {
                if (err) {
                    console.log('⚠️  学习记录表验证失败:', err.message);
                } else {
                    console.log(`✅ 学习记录数量: ${row.count}`);
                }
                
                console.log('\n🎉 数据库迁移完成！');
                console.log('📝 接下来请在Zeabur控制台设置环境变量，然后重新部署');
                
                db.close();
            });
        });
        
    } catch (error) {
        console.error('❌ 数据库迁移失败:', error);
        process.exit(1);
    }
}

// 执行迁移
migrateDatabase();