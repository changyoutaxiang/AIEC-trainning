/**
 * AIEC 用户认证API路由
 * 
 * 功能：
 * 1. 企业邮箱白名单注册
 * 2. 企业邮箱登录验证
 * 3. 用户信息管理
 * 4. 学习记录存储
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const router = express.Router();

// 数据库路径
const DB_PATH = path.join(__dirname, '../database/aiec_users.db');

// 白名单配置文件路径
const WHITELIST_PATH = path.join(__dirname, '../config/authorized-users.json');

// 读取白名单配置
function loadWhitelist() {
    try {
        const data = fs.readFileSync(WHITELIST_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取白名单配置失败:', error);
        return { authorizedEmails: [], adminEmails: [] };
    }
}

// 验证邮箱是否在白名单中
function isEmailAuthorized(email) {
    const whitelist = loadWhitelist();
    return whitelist.authorizedEmails.includes(email);
}

// 创建数据库连接
function getDbConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('数据库连接失败:', err.message);
        }
    });
}

// 6位数字密码验证
function validatePassword(password) {
    // 检查是否为6位数字
    return /^[0-9]{6}$/.test(password);
}

// 密码哈希
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// 密码验证
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * POST /api/auth/register
 * 企业邮箱注册
 */
router.post('/register', async (req, res) => {
    const { email, name, department, position, password } = req.body;
    
    // 输入验证
    if (!email || !name || !password) {
        return res.status(400).json({
            success: false,
            message: '邮箱、姓名和密码为必填项'
        });
    }
    
    // 密码格式验证
    if (!validatePassword(password)) {
        return res.status(400).json({
            success: false,
            message: '密码必须为6位数字'
        });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: '邮箱格式不正确'
        });
    }
    
    // 验证是否在白名单中
    if (!isEmailAuthorized(email)) {
        return res.status(403).json({
            success: false,
            message: '该邮箱未获得授权，请联系管理员添加到白名单'
        });
    }
    
    const db = getDbConnection();
    
    try {
        // 检查邮箱是否已存在
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: '该邮箱已注册，请直接登录'
            });
        }
        
        // 密码哈希
        const hashedPassword = await hashPassword(password);
        
        // 创建新用户
        const result = await new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (email, name, department, position, password)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [email, name, department || null, position || null, hashedPassword], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        // 获取新创建的用户信息
        const newUser = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name, department, position, created_at, status FROM users WHERE id = ?', 
                   [result.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        res.status(201).json({
            success: true,
            message: '注册成功！欢迎加入AIEC团队！',
            user: newUser
        });
        
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({
            success: false,
            message: '注册失败，请稍后重试'
        });
    } finally {
        db.close();
    }
});

/**
 * POST /api/auth/login
 * 企业邮箱登录
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // 输入验证
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: '请输入邮箱和密码'
        });
    }
    
    // 密码格式验证
    if (!validatePassword(password)) {
        return res.status(400).json({
            success: false,
            message: '密码必须为6位数字'
        });
    }
    
    // 验证是否在白名单中
    if (!isEmailAuthorized(email)) {
        return res.status(403).json({
            success: false,
            message: '该邮箱未获得授权，请联系管理员'
        });
    }
    
    const db = getDbConnection();
    
    try {
        // 查找用户（包含密码）
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name, department, position, created_at, status, password FROM users WHERE email = ?', 
                   [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在，请先注册'
            });
        }
        
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: '账户已被禁用，请联系管理员'
            });
        }
        
        // 验证密码
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '密码错误，请重试'
            });
        }
        
        // 更新最后登录时间
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', 
                   [user.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 返回用户信息（移除密码字段）
        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            department: user.department,
            position: user.position,
            created_at: user.created_at,
            status: user.status
        };
        
        res.json({
            success: true,
            message: `欢迎回来，${user.name}！`,
            user: safeUser
        });
        
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    } finally {
        db.close();
    }
});

/**
 * GET /api/auth/profile/:userId
 * 获取用户信息
 */
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    
    const db = getDbConnection();
    
    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name, department, position, created_at, last_login, status FROM users WHERE id = ?', 
                   [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
        
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户信息失败'
        });
    } finally {
        db.close();
    }
});

/**
 * POST /api/auth/save-learning-record
 * 保存学习记录
 */
router.post('/save-learning-record', async (req, res) => {
    const { 
        userId, 
        habitId, 
        unitId, 
        exerciseType, 
        exerciseId, 
        userResponse, 
        aiEvaluation, 
        score 
    } = req.body;
    
    // 输入验证
    if (!userId || !habitId || !exerciseType || !exerciseId) {
        return res.status(400).json({
            success: false,
            message: '缺少必要的学习记录参数'
        });
    }
    
    const db = getDbConnection();
    
    try {
        // 保存学习记录
        const result = await new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO learning_records 
                (user_id, habit_id, unit_id, exercise_type, exercise_id, user_response, ai_evaluation, score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [
                userId, habitId, unitId, exerciseType, exerciseId, 
                userResponse, JSON.stringify(aiEvaluation), score
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        res.json({
            success: true,
            message: '学习记录保存成功',
            recordId: result.id
        });
        
    } catch (error) {
        console.error('保存学习记录失败:', error);
        res.status(500).json({
            success: false,
            message: '保存学习记录失败'
        });
    } finally {
        db.close();
    }
});

/**
 * GET /api/auth/learning-history/:userId
 * 获取用户学习历史
 */
router.get('/learning-history/:userId', async (req, res) => {
    const { userId } = req.params;
    const { habitId, limit = 50 } = req.query;
    
    const db = getDbConnection();
    
    try {
        let sql = `
            SELECT * FROM learning_records 
            WHERE user_id = ?
        `;
        const params = [userId];
        
        if (habitId) {
            sql += ' AND habit_id = ?';
            params.push(habitId);
        }
        
        sql += ' ORDER BY completed_at DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const records = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        // 解析AI评估JSON
        const processedRecords = records.map(record => ({
            ...record,
            ai_evaluation: record.ai_evaluation ? JSON.parse(record.ai_evaluation) : null
        }));
        
        res.json({
            success: true,
            records: processedRecords
        });
        
    } catch (error) {
        console.error('获取学习历史失败:', error);
        res.status(500).json({
            success: false,
            message: '获取学习历史失败'
        });
    } finally {
        db.close();
    }
});

/**
 * GET /api/auth/whitelist
 * 获取白名单配置（仅管理员）
 */
router.get('/whitelist', (req, res) => {
    try {
        const whitelist = loadWhitelist();
        res.json({
            success: true,
            whitelist: {
                totalUsers: whitelist.authorizedEmails.length,
                maxUsers: whitelist.settings?.maxUsersLimit || 20,
                lastUpdated: whitelist.lastUpdated
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取白名单信息失败'
        });
    }
});

module.exports = router;