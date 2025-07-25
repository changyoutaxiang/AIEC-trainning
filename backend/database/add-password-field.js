/**
 * 为用户表添加6位数字密码字段
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'aiec_users.db');

function addPasswordField() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ 数据库连接成功');
            
            // 添加password字段
            const sql = `ALTER TABLE users ADD COLUMN password TEXT`;
            
            db.run(sql, (err) => {
                if (err) {
                    if (err.message.includes('duplicate column name')) {
                        console.log('⚠️  密码字段已存在，跳过添加');
                    } else {
                        console.error('添加密码字段失败:', err.message);
                        reject(err);
                        return;
                    }
                } else {
                    console.log('✅ 密码字段添加成功');
                }
                
                // 检查表结构
                db.all("PRAGMA table_info(users)", (err, rows) => {
                    if (err) {
                        console.error('获取表结构失败:', err.message);
                        reject(err);
                        return;
                    }
                    
                    console.log('📊 用户表结构:');
                    rows.forEach(row => {
                        console.log(`   ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
                    });
                    
                    db.close((err) => {
                        if (err) {
                            console.error('关闭数据库连接失败:', err.message);
                        } else {
                            console.log('📊 数据库连接已关闭');
                        }
                        resolve();
                    });
                });
            });
        });
    });
}

// 如果直接运行此文件
if (require.main === module) {
    addPasswordField()
        .then(() => {
            console.log('🎉 密码字段添加完成！');
        })
        .catch((error) => {
            console.error('❌ 操作失败:', error);
            process.exit(1);
        });
}

module.exports = { addPasswordField };