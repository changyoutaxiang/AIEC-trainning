/**
 * 数据库配置检查脚本
 * 用于验证数据库路径和数据持久化状态
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('🔍 开始检查数据库配置...\n');

// 1. 检查环境变量
console.log('📋 环境变量检查:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
console.log(`DATABASE_PATH: ${process.env.DATABASE_PATH || '未设置'}`);
console.log(`UPLOADS_PATH: ${process.env.UPLOADS_PATH || '未设置'}`);

// 2. 检查数据库路径
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'backend/database/aiec_users.db');
console.log(`\n📊 数据库路径: ${dbPath}`);

// 3. 检查数据库文件是否存在
if (fs.existsSync(dbPath)) {
    console.log('✅ 数据库文件存在');
    
    // 获取数据库文件信息
    const stats = fs.statSync(dbPath);
    console.log(`📅 创建时间: ${stats.birthtime}`);
    console.log(`📅 修改时间: ${stats.mtime}`);
    console.log(`📦 文件大小: ${stats.size} bytes`);
    
    // 4. 检查数据库内容
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('❌ 无法连接数据库:', err.message);
            return;
        }
        
        console.log('\n🔍 检查数据库表结构:');
        
        // 检查表是否存在
        db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
            if (err) {
                console.error('❌ 查询表失败:', err.message);
                return;
            }
            
            console.log('📋 现有表:');
            tables.forEach(table => {
                console.log(`  - ${table.name}`);
            });
            
            // 检查用户数据
            db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
                if (err) {
                    console.log('❌ 用户表不存在或查询失败:', err.message);
                } else {
                    console.log(`\n👥 用户数量: ${row.count}`);
                }
                
                // 检查学习记录
                db.get("SELECT COUNT(*) as count FROM learning_records", [], (err, row) => {
                    if (err) {
                        console.log('❌ 学习记录表不存在或查询失败:', err.message);
                    } else {
                        console.log(`📚 学习记录数量: ${row.count}`);
                    }
                    
                    console.log('\n🎯 检查完成！');
                    console.log('\n📝 建议操作:');
                    
                    if (process.env.DATABASE_PATH) {
                        if (process.env.DATABASE_PATH.startsWith('/data/')) {
                            console.log('✅ 环境变量配置正确，使用持久化路径');
                        } else {
                            console.log('⚠️  建议将DATABASE_PATH设置为: /data/database/aiec_users.db');
                        }
                    } else {
                        console.log('⚠️  建议在Zeabur控制台设置环境变量:');
                        console.log('   DATABASE_PATH=/data/database/aiec_users.db');
                        console.log('   UPLOADS_PATH=/data/uploads');
                    }
                    
                    db.close();
                });
            });
        });
    });
} else {
    console.log('❌ 数据库文件不存在');
    console.log('📝 这可能是首次部署，数据库将在首次启动时创建');
}