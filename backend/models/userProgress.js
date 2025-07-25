/**
 * 用户学习进度数据模型
 * 用于存储和管理用户在七个习惯学习系统中的进度数据
 */

const fs = require('fs');
const path = require('path');

class UserProgressModel {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.filePath = path.join(this.dataDir, 'userProgress.json');
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({ users: {} }, null, 2));
        }
    }

    /**
     * 获取或创建用户进度
     */
    async getUserProgress(userId, username = '匿名用户', department = '默认部门') {
        const data = this.readData();
        
        if (!data.users[userId]) {
            data.users[userId] = {
                userId,
                username,
                department,
                totalProgress: 0,
                completedHabits: 0,
                practiceScores: {},
                streakDays: 0,
                totalScore: 0,
                privacySetting: 'public',
                lastActivity: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.writeData(data);
        }

        return data.users[userId];
    }

    /**
     * 更新用户进度
     */
    async updateProgress(userId, updates) {
        const data = this.readData();
        
        if (!data.users[userId]) {
            throw new Error('用户不存在');
        }

        Object.assign(data.users[userId], updates, {
            updatedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });

        // 重新计算总得分
        data.users[userId].totalScore = this.calculateTotalScore(data.users[userId]);

        this.writeData(data);
        return data.users[userId];
    }

    /**
     * 获取排行榜数据
     */
    async getLeaderboard(options = {}) {
        const {
            type = 'global',
            period = 'total',
            limit = 100,
            department = null,
            userId = null
        } = options;

        const data = this.readData();
        let users = Object.values(data.users);

        // 过滤隐私设置
        users = users.filter(user => user.privacySetting === 'public');

        // 部门过滤
        if (type === 'department' && department) {
            users = users.filter(user => user.department === department);
        }

        // 好友过滤 (简化版，后续扩展)
        if (type === 'friends' && userId) {
            // 这里简化处理，实际应该查询好友关系
            users = users.slice(0, 50); // 临时方案
        }

        // 排序
        users.sort((a, b) => b.totalScore - a.totalScore);

        // 添加排名
        users = users.slice(0, limit).map((user, index) => ({
            ...user,
            rank: index + 1,
            change: 0 // 简化版，后续可以计算排名变化
        }));

        return users;
    }

    /**
     * 获取用户排名
     */
    async getUserRank(userId) {
        const user = await this.getUserProgress(userId);
        const leaderboard = await this.getLeaderboard({ limit: 10000 });
        
        const globalPosition = leaderboard.findIndex(u => u.userId === userId) + 1;
        const departmentUsers = leaderboard.filter(u => u.department === user.department);
        const departmentPosition = departmentUsers.findIndex(u => u.userId === userId) + 1;

        return {
            globalRank: {
                position: globalPosition,
                total: leaderboard.length,
                percentile: Math.round((globalPosition / leaderboard.length) * 100)
            },
            departmentRank: {
                position: departmentPosition,
                total: departmentUsers.length,
                department: user.department
            },
            userData: user
        };
    }

    /**
     * 计算用户总得分
     */
    calculateTotalScore(user) {
        const practiceAvg = Object.values(user.practiceScores).reduce((sum, score) => sum + score, 0) / 
                          Math.max(Object.keys(user.practiceScores).length, 1);
        
        return Math.round(
            user.totalProgress * 20 +           // 进度权重 20%
            user.completedHabits * 100 +        // 习惯完成 30%
            (practiceAvg || 0) * 50 +           // 练习得分 25%
            user.streakDays * 10 +              // 连续学习 15%
            0                                   // 保留原有计算逻辑
        );
    }


    /**
     * 读取数据文件
     */
    readData() {
        try {
            const content = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error('读取用户进度数据失败:', error);
            return { users: {} };
        }
    }

    /**
     * 写入数据文件
     */
    writeData(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('写入用户进度数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有部门列表
     */
    async getDepartments() {
        const data = this.readData();
        const departments = new Set();
        
        Object.values(data.users).forEach(user => {
            if (user.department) {
                departments.add(user.department);
            }
        });

        return Array.from(departments).sort();
    }
}

module.exports = UserProgressModel;