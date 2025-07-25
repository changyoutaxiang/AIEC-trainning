const express = require('express');
const router = express.Router();
const UserProgressModel = require('../models/userProgress');

const userProgressModel = new UserProgressModel();

/**
 * GET /api/leaderboard
 * 获取排行榜数据
 * 
 * Query参数:
 * - type: 'global' | 'department' | 'friends' (默认: 'global')
 * - period: 'today' | 'week' | 'month' | 'total' (默认: 'total')
 * - limit: number (默认: 100)
 * - department: string (当type='department'时)
 * - userId: string (当type='friends'时)
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const {
            type = 'global',
            period = 'total',
            limit = 100,
            department,
            userId
        } = req.query;

        console.log(`🔄 获取排行榜: type=${type}, period=${period}, limit=${limit}`);

        // 参数验证
        if (limit > 1000) {
            return res.status(400).json({
                success: false,
                error: 'limit参数不能超过1000'
            });
        }

        // 获取排行榜数据
        const rankings = await userProgressModel.getLeaderboard({
            type,
            period,
            limit: parseInt(limit),
            department,
            userId
        });

        // 获取当前用户的排名（如果有userId）
        let userRank = null;
        if (req.query.userId) {
            userRank = await userProgressModel.getUserRank(req.query.userId);
        }

        res.json({
            success: true,
            data: {
                rankings: rankings.map(user => ({
                    userId: user.userId,
                    username: user.username,
                    department: user.department,
                    totalProgress: user.totalProgress,
                    completedHabits: user.completedHabits,
                    totalScore: user.totalScore,
                    streakDays: user.streakDays,
                    rank: user.rank
                })),
                userRank: userRank ? {
                    position: userRank.globalRank.position,
                    total: userRank.globalRank.total,
                    score: userRank.userData.totalScore
                } : null,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('获取排行榜失败:', error);
        res.status(500).json({
            success: false,
            error: '获取排行榜失败',
            details: error.message
        });
    }
});

/**
 * GET /api/leaderboard/user/:userId
 * 获取单个用户的详细排名信息
 */
router.get('/leaderboard/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`👤 获取用户排名: ${userId}`);

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId参数不能为空'
            });
        }

        const userRank = await userProgressModel.getUserRank(userId);
        const userData = await userProgressModel.getUserProgress(userId);

        // 计算本周和本月的变化（简化版）
        const weeklyProgress = {
            gained: Math.floor(Math.random() * 200) + 50, // 模拟数据
            rankChange: Math.floor(Math.random() * 5) - 2
        };

        res.json({
            success: true,
            data: {
                globalRank: userRank.globalRank,
                departmentRank: userRank.departmentRank,
                weeklyProgress,
                userData: {
                    totalProgress: userData.totalProgress,
                    completedHabits: userData.completedHabits,
                    streakDays: userData.streakDays,
                    lastActivity: userData.lastActivity
                }
            }
        });

    } catch (error) {
        console.error('获取用户排名失败:', error);
        res.status(500).json({
            success: false,
            error: '获取用户排名失败',
            details: error.message
        });
    }
});

/**
 * POST /api/leaderboard/update-progress
 * 更新用户学习进度
 */
router.post('/leaderboard/update-progress', async (req, res) => {
    try {
        const {
            userId,
            username,
            department,
            habitNumber,
            progress,
            practiceScore,
            activityType
        } = req.body;

        console.log(`📝 更新用户进度: ${userId}, 活动: ${activityType}`);

        // 参数验证
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId参数不能为空'
            });
        }

        // 确保用户存在
        const user = await userProgressModel.getUserProgress(userId, username, department);

        // 根据活动类型更新进度
        let updates = {};
        
        switch (activityType) {
            case 'habit_progress':
                updates.totalProgress = Math.min(progress, 100);
                if (progress === 100) {
                    updates.completedHabits = Math.min(user.completedHabits + 1, 7);
                }
                break;

            case 'practice_completed':
                if (practiceScore) {
                    const practiceScores = { ...user.practiceScores };
                    practiceScores[`habit_${habitNumber}`] = practiceScore;
                    updates.practiceScores = practiceScores;
                }
                break;

            case 'daily_activity':
                // 简化版：每次活动增加连续学习天数
                updates.streakDays = user.streakDays + 1;
                break;

            default:
                updates.lastActivity = new Date().toISOString();
        }

        // 更新用户进度
        const updatedUser = await userProgressModel.updateProgress(userId, updates);


        res.json({
            success: true,
            data: {
                newTotalScore: updatedUser.totalScore,
                newRank: await getUserRankPosition(userId),
                streakExtended: updates.streakDays > user.streakDays
            }
        });

    } catch (error) {
        console.error('更新用户进度失败:', error);
        res.status(500).json({
            success: false,
            error: '更新用户进度失败',
            details: error.message
        });
    }
});

/**
 * GET /api/leaderboard/departments
 * 获取所有部门列表
 */
router.get('/leaderboard/departments', async (req, res) => {
    try {
        const departments = await userProgressModel.getDepartments();
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('获取部门列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取部门列表失败',
            details: error.message
        });
    }
});

/**
 * GET /api/leaderboard/test-data
 * 生成测试数据（开发用）
 */
router.post('/leaderboard/test-data', async (req, res) => {
    try {
        const count = req.body.count || 50;
        const departments = ['技术部', '产品部', '市场部', '销售部', '运营部'];
        const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];

        for (let i = 0; i < count; i++) {
            const userId = `test_user_${i}`;
            const username = names[i % names.length] + (Math.floor(i / names.length) + 1);
            const department = departments[i % departments.length];
            
            await userProgressModel.getUserProgress(userId, username, department);
            
            // 随机生成学习进度
            const updates = {
                totalProgress: Math.floor(Math.random() * 100),
                completedHabits: Math.floor(Math.random() * 8),
                practiceScores: {
                    habit_1: Math.floor(Math.random() * 3) + 7,
                    habit_2: Math.floor(Math.random() * 3) + 7,
                    habit_3: Math.floor(Math.random() * 3) + 7
                },
                streakDays: Math.floor(Math.random() * 30),
                lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            await userProgressModel.updateProgress(userId, updates);
        }

        res.json({
            success: true,
            message: `已生成 ${count} 条测试数据`
        });

    } catch (error) {
        console.error('生成测试数据失败:', error);
        res.status(500).json({
            success: false,
            error: '生成测试数据失败',
            details: error.message
        });
    }
});

/**
 * 辅助函数：获取用户排名位置
 */
async function getUserRankPosition(userId) {
    try {
        const leaderboard = await userProgressModel.getLeaderboard({ limit: 10000 });
        const rank = leaderboard.findIndex(u => u.userId === userId) + 1;
        return rank > 0 ? rank : null;
    } catch (error) {
        console.error('获取用户排名位置失败:', error);
        return null;
    }
}

module.exports = router;