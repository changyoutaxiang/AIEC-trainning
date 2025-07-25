/**
 * 数据库更新脚本 - 添加头像字段
 * 为用户表添加avatar字段支持自定义头像
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'aiec_users.db');

function addAvatarField() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
                reject(err);
                return;
            }

            // 检查avatar字段是否已存在
            db.all("PRAGMA table_info(users)", (err, rows) => {
                if (err) {
                    console.error('检查表结构失败:', err.message);
                    db.close();
                    reject(err);
                    return;
                }

                // 检查是否已有avatar字段
                const hasAvatarField = rows.some(row => row.name === 'avatar');
                
                if (hasAvatarField) {
                    console.log('✅ avatar字段已存在，无需添加');
                    db.close();
                    resolve();
                    return;
                }

                // 添加avatar字段
                const sql = "ALTER TABLE users ADD COLUMN avatar TEXT";
                
                db.run(sql, (err) => {
                    if (err) {
                        console.error('添加avatar字段失败:', err.message);
                        db.close();
                        reject(err);
                    } else {
                        console.log('✅ 成功添加avatar字段到users表');
                        db.close();
                        resolve();
                    }
                });
            });
        });
    });
}

// 如果直接运行此脚本
if (require.main === module) {
    addAvatarField()
        .then(() => {
            console.log('数据库更新完成！');
            process.exit(0);
        })
        .catch((err) => {
            console.error('数据库更新失败:', err);
            process.exit(1);
        });
}

module.exports = { addAvatarField };