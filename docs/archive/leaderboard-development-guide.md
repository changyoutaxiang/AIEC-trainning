# 🏆 AIEC学习排行榜开发指南

**文档版本**: v1.0  
**创建日期**: 2025年7月23日  
**开发周期**: 7-9天  
**技术负责人**: Claude Code Assistant

## 📋 项目概述

为AIEC七个习惯学习系统增加学习进度排行榜功能，通过社交化学习提升用户参与度和完课率。

## 🎯 开发目标

### 核心目标
- ✅ 提升用户学习积极性
- ✅ 建立学习社区氛围
- ✅ 提供学习成就可视化
- ✅ 支持企业培训效果追踪

### 具体指标
- 用户活跃度提升30%
- 课程完成率提升25%
- 平均学习时长增加40%

## 🏗️ 技术架构

### 系统架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端页面       │    │   后端API       │    │   数据存储       │
│ leaderboard.html │◄──►│ leaderboard.js  │◄──►│ Redis + MySQL   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────────┐              ┌────────┐              ┌────────┐
    │实时更新│              │缓存策略│              │定时任务│
    └────────┘              └────────┘              └────────┘
```

### 数据流设计
```
用户学习行为 → 进度更新 → 排行榜计算 → 缓存更新 → 前端展示
     │            │           │           │           │
   localStorage   API调用   定时任务    Redis缓存   实时推送
```

## 📊 数据模型设计

### 用户进度表 (user_progress)
```sql
CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    total_progress INT DEFAULT 0,           -- 总进度 0-100
    completed_habits INT DEFAULT 0,         -- 完成习惯数 0-7
    practice_scores JSON,                   -- 各维度平均分
    streak_days INT DEFAULT 0,              -- 连续学习天数
    total_score INT DEFAULT 0,              -- 综合得分
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    privacy_setting ENUM('public', 'friends', 'private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_total_score (total_score),
    INDEX idx_department (department),
    INDEX idx_last_activity (last_activity)
);
```

### 成就徽章表 (user_badges)
```sql
CREATE TABLE user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_progress(user_id)
);
```

### 排行榜缓存结构 (Redis)
```javascript
// 排行榜缓存键
const CACHE_KEYS = {
  GLOBAL_TOTAL: 'leaderboard:global:total',
  GLOBAL_TODAY: 'leaderboard:global:today',
  GLOBAL_WEEK: 'leaderboard:global:week',
  GLOBAL_MONTH: 'leaderboard:global:month',
  DEPARTMENT: (dept) => `leaderboard:dept:${dept}`,
  FRIENDS: (userId) => `leaderboard:friends:${userId}`,
  USER_RANK: (userId) => `leaderboard:user:${userId}`
};

// 缓存数据格式
{
  "rankings": [
    {
      "user_id": "user123",
      "username": "张三",
      "department": "技术部",
      "total_progress": 95,
      "completed_habits": 7,
      "total_score": 2850,
      "badges": ["🔥", "🎯", "💡"],
      "rank": 1
    }
  ],
  "lastUpdated": "2025-07-23T16:30:00Z",
  "totalUsers": 156
}
```

## 🔧 API接口设计

### 1. 获取排行榜
```javascript
GET /api/leaderboard
Query参数:
- type: 'global' | 'department' | 'friends'  (默认: 'global')
- period: 'today' | 'week' | 'month' | 'total' (默认: 'total')
- limit: number (默认: 100)
- department: string (当type='department'时必需)
- userId: string (当type='friends'时必需)

响应示例:
{
  "success": true,
  "data": {
    "rankings": [
      {
        "userId": "user123",
        "username": "张三",
        "avatar": "/avatars/user123.jpg",
        "department": "技术部",
        "totalProgress": 95,
        "completedHabits": 7,
        "practiceAverage": 8.7,
        "streakDays": 15,
        "totalScore": 2850,
        "badges": ["🔥", "🎯", "💡"],
        "rank": 1,
        "change": 2  // 排名变化：+2上升，-1下降，0不变
      }
    ],
    "userRank": {
      "position": 42,
      "total": 156,
      "score": 1750
    },
    "lastUpdated": "2025-07-23T16:30:00Z",
    "nextUpdate": "2025-07-23T16:35:00Z"
  }
}
```

### 2. 获取用户排名
```javascript
GET /api/leaderboard/user/:userId
响应示例:
{
  "success": true,
  "data": {
    "globalRank": {
      "position": 42,
      "total": 156,
      "percentile": 73.1
    },
    "departmentRank": {
      "position": 5,
      "total": 23,
      "department": "技术部"
    },
    "weeklyProgress": {
      "gained": 150,
      "rankChange": 3
    },
    "badges": [
      {
        "type": "streak",
        "name": "连续学习7天",
        "icon": "🔥",
        "earnedAt": "2025-07-20T10:00:00Z"
      }
    ]
  }
}
```

### 3. 更新用户进度
```javascript
POST /api/leaderboard/update-progress
请求体:
{
  "userId": "user123",
  "habitNumber": 1,
  "progress": 25,
  "practiceScore": 8.5,
  "activityType": "practice_completed"
}

响应:
{
  "success": true,
  "data": {
    "newTotalScore": 1800,
    "newRank": 41,
    "newBadges": ["🎯"],
    "streakExtended": true
  }
}
```

## 🎨 前端设计规范

### 页面布局 (leaderboard.html)
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏆 学习排行榜 - AIEC七个习惯</title>
    <link rel="stylesheet" href="css/leaderboard.css">
</head>
<body>
    <div class="container">
        <header class="leaderboard-header">
            <h1>🏆 学习排行榜</h1>
            <div class="filter-controls">
                <select id="periodFilter">
                    <option value="total">总榜</option>
                    <option value="today">今日</option>
                    <option value="week">本周</option>
                    <option value="month">本月</option>
                </select>
                <select id="typeFilter">
                    <option value="global">全局</option>
                    <option value="department">部门</option>
                    <option value="friends">好友</option>
                </select>
            </div>
        </header>

        <div class="user-rank-card">
            <h3>我的排名</h3>
            <div class="rank-info">
                <span class="position">#42</span>
                <span class="total">/ 156人</span>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: 65%"></div>
            </div>
        </div>

        <div class="leaderboard-list" id="leaderboardList">
            <!-- 排行榜内容将通过JS动态加载 -->
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>加载排行榜中...</p>
        </div>
    </div>

    <script src="js/leaderboard.js"></script>
</body>
</html>
```

### CSS样式 (leaderboard.css)
```css
:root {
    --primary-color: #007AFF;
    --success-color: #34C759;
    --warning-color: #FF9500;
    --background-color: #f5f5f7;
    --card-background: #ffffff;
    --text-primary: #1d1d1f;
    --text-secondary: #86868b;
    --border-color: #d2d2d7;
}

.leaderboard-header {
    text-align: center;
    margin-bottom: 2rem;
}

.filter-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
}

.leaderboard-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: var(--card-background);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.leaderboard-item:hover {
    transform: translateY(-2px);
}

.rank-badge {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
}

.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); }
.rank-2 { background: linear-gradient(135deg, #C0C0C0, #808080); }
.rank-3 { background: linear-gradient(135deg, #CD7F32, #8B4513); }
```

## ⚙️ 后端实现细节

### 1. 排行榜计算服务 (leaderboardService.js)
```javascript
class LeaderboardService {
    constructor() {
        this.cache = new Map();
        this.updateInterval = 5 * 60 * 1000; // 5分钟
    }

    async calculateScore(userId) {
        const user = await UserProgress.findOne({ user_id: userId });
        if (!user) return 0;

        const score = (
            user.total_progress * 20 +           // 进度权重 20%
            user.completed_habits * 100 +        // 习惯完成 30%
            user.practice_scores?.average * 50 + // 练习得分 25%
            user.streak_days * 10 +              // 连续学习 15%
            user.badges?.length * 50             // 成就徽章 10%
        );

        return Math.round(score);
    }

    async updateLeaderboard(type = 'global', period = 'total') {
        const cacheKey = `leaderboard:${type}:${period}`;
        const users = await this.getUsersByType(type);
        const rankings = [];

        for (const user of users) {
            const totalScore = await this.calculateScore(user.user_id);
            rankings.push({
                userId: user.user_id,
                username: user.username,
                department: user.department,
                totalProgress: user.total_progress,
                completedHabits: user.completed_habits,
                totalScore,
                badges: await this.getUserBadges(user.user_id)
            });
        }

        rankings.sort((a, b) => b.totalScore - a.totalScore);
        rankings.forEach((item, index) => {
            item.rank = index + 1;
        });

        // 缓存结果
        await redis.setex(cacheKey, 300, JSON.stringify({
            rankings: rankings.slice(0, 100),
            lastUpdated: new Date().toISOString(),
            totalUsers: rankings.length
        }));

        return rankings.slice(0, 100);
    }
}
```

### 2. 定时任务 (leaderboardScheduler.js)
```javascript
const cron = require('node-cron');

class LeaderboardScheduler {
    constructor(leaderboardService) {
        this.service = leaderboardService;
        this.setupJobs();
    }

    setupJobs() {
        // 每5分钟更新全局排行榜
        cron.schedule('*/5 * * * *', async () => {
            console.log('🔄 更新全局排行榜...');
            await this.service.updateLeaderboard('global', 'total');
        });

        // 每小时更新今日排行榜
        cron.schedule('0 * * * *', async () => {
            console.log('🔄 更新今日排行榜...');
            await this.service.updateLeaderboard('global', 'today');
        });

        // 每天0点更新周榜和月榜
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 更新周榜和月榜...');
            await this.service.updateLeaderboard('global', 'week');
            await this.service.updateLeaderboard('global', 'month');
        });
    }
}
```

## 📅 开发里程碑

### Phase 1: 基础框架 (2-3天)
- [ ] 创建数据库表结构
- [ ] 实现基础API接口
- [ ] 创建leaderboard.html页面框架
- [ ] 实现全局总榜功能

### Phase 2: 数据更新机制 (2天)
- [ ] 实现进度更新API
- [ ] 添加Redis缓存
- [ ] 设置定时任务
- [ ] 完善错误处理

### Phase 3: 多维度排行 (2天)
- [ ] 实现时间维度筛选
- [ ] 添加部门排行
- [ ] 实现好友排行
- [ ] 优化响应速度

### Phase 4: 用户体验优化 (1-2天)
- [ ] 添加成就徽章系统
- [ ] 实现实时更新通知
- [ ] 移动端适配
- [ ] 性能优化

## 🧪 测试策略

### 单元测试
```javascript
describe('LeaderboardService', () => {
    describe('calculateScore', () => {
        it('应该正确计算用户综合得分', async () => {
            const mockUser = {
                total_progress: 85,
                completed_habits: 5,
                practice_scores: { average: 8.5 },
                streak_days: 10,
                badges: ['🔥', '🎯']
            };
            
            const score = await service.calculateScore('user123');
            expect(score).toBe(2850);
        });
    });
});
```

### 集成测试
- API响应时间 < 200ms
- 并发用户支持 > 1000
- 缓存命中率 > 90%
- 数据一致性验证

## 📊 性能优化

### 1. 缓存策略
- Redis缓存：5分钟TTL
- CDN缓存：静态资源1小时
- 浏览器缓存：1小时

### 2. 数据库优化
- 索引优化：user_id, total_score, department
- 分页查询：LIMIT 100
- 连接池配置：max 20 connections

### 3. 前端优化
- 虚拟滚动：大数据列表
- 图片懒加载：头像和徽章
- 防抖处理：筛选操作

## 🔒 安全考虑

### 1. 数据保护
- 用户隐私设置支持
- 敏感数据脱敏
- GDPR合规性

### 2. API安全
- 速率限制：100请求/分钟/IP
- 输入验证：所有参数验证
- SQL注入防护：使用ORM

## 📈 监控与报警

### 关键指标
- API响应时间
- 缓存命中率
- 错误率
- 用户参与度

### 报警规则
- API错误率 > 5%
- 响应时间 > 500ms
- 缓存miss率 > 20%

---

**下一步**: 开始Phase 1 - 基础排行榜实现