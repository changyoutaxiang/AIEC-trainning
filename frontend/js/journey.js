/**
 * 我的旅程页面 - JavaScript逻辑
 * 负责数据加载、可视化渲染和用户交互
 */

class JourneyManager {
    constructor() {
        this.currentUser = null;
        this.learningData = null;
        this.habitData = null;
        this.apiBase = this.getAPIBaseURL();
        
        this.init();
    }

    // 获取API基础URL - 支持云端部署
    getAPIBaseURL() {
        // 云端部署时使用相对路径
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            return window.location.origin;
        }
        // 本地开发使用固定端口
        return 'http://localhost:3000';
    }
    
    async init() {
        try {
            // 检查用户认证状态
            await this.checkAuthentication();
            
            // 加载用户数据
            await this.loadUserData();
            
            // 加载学习数据
            await this.loadLearningData();
            
            // 渲染页面内容
            this.renderUserProfile();
            this.renderDashboard();
            
            // 隐藏加载状态，显示内容
            this.showContent();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            console.log('我的旅程页面初始化完成 🌟');
            
        } catch (error) {
            console.error('页面初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }
    
    // 检查用户认证状态
    async checkAuthentication() {
        const user = localStorage.getItem('aiec_current_user');
        if (!user) {
            window.location.href = 'login.html';
            throw new Error('用户未登录');
        }
        
        this.currentUser = JSON.parse(user);
        console.log('当前用户:', this.currentUser);
    }
    
    // 加载用户数据
    async loadUserData() {
        try {
            // 首先尝试从企业认证系统获取用户详细信息
            const userResponse = await fetch(`${this.apiBase}/api/auth/user/${this.currentUser.id || 'current'}`);
            let enterpriseUserData = null;
            
            if (userResponse.ok) {
                const result = await userResponse.json();
                if (result.success) {
                    enterpriseUserData = result.user;
                    console.log('从企业系统获取用户数据:', enterpriseUserData);
                }
            }
            
            // 获取学习统计数据
            const statsResponse = await fetch(`${this.apiBase}/api/journey/stats/${this.currentUser.id || 1}`);
            let learningStats = {
                totalStudyHours: 0,
                completedExercises: 0,
                averageScore: 0,
                habitsCompleted: 0,
                currentLevel: "新手学习者"
            };
            
            if (statsResponse.ok) {
                const result = await statsResponse.json();
                if (result.success) {
                    learningStats = result.stats;
                }
            } else {
                // 如果API不存在，使用模拟数据
                learningStats = await this.calculateLearningStats();
            }
            
            // 组合用户数据
            this.userData = {
                userInfo: {
                    name: enterpriseUserData?.name || this.currentUser.name || "学习者",
                    email: enterpriseUserData?.email || this.currentUser.email || "user@company.com",
                    department: enterpriseUserData?.department || "未设置",
                    position: enterpriseUserData?.position || "员工",
                    avatar: enterpriseUserData?.avatar || this.getUserAvatar(enterpriseUserData?.email || this.currentUser.email),
                    joinDays: this.calculateJoinDays(enterpriseUserData?.created_at || this.currentUser.createdAt),
                    lastLogin: this.formatLastLogin(enterpriseUserData?.last_login ? new Date(enterpriseUserData.last_login) : new Date())
                },
                stats: learningStats
            };
            
            console.log('最终用户数据:', this.userData);
            
        } catch (error) {
            console.error('加载用户数据失败:', error);
            
            // 降级处理：使用localStorage数据
            this.userData = {
                userInfo: {
                    name: this.currentUser.name || "学习者",
                    email: this.currentUser.email || "user@company.com", 
                    department: "未设置",
                    position: "员工",
                    avatar: this.getUserAvatar(this.currentUser.email),
                    joinDays: this.calculateJoinDays(this.currentUser.createdAt),
                    lastLogin: "今天"
                },
                stats: {
                    totalStudyHours: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    habitsCompleted: 0,
                    currentLevel: "新手学习者"
                }
            };
        }
    }
    
    // 计算学习统计数据
    async calculateLearningStats() {
        try {
            // 尝试从学习记录计算统计数据
            const recordsResponse = await fetch(`${this.apiBase}/api/auth/learning-history/${this.currentUser.id || 1}?limit=100`);
            
            if (recordsResponse.ok) {
                const result = await recordsResponse.json();
                if (result.success && result.records) {
                    const records = result.records;
                    
                    // 计算统计数据
                    const completedExercises = records.length;
                    const totalScore = records.reduce((sum, record) => sum + (record.score || 0), 0);
                    const averageScore = completedExercises > 0 ? Math.round(totalScore / completedExercises * 10) / 10 : 0;
                    
                    // 估算学习时长（每个练习平均15分钟）
                    const totalStudyHours = Math.round(completedExercises * 0.25 * 10) / 10;
                    
                    // 计算掌握的习惯数（基于不同habit_id的数量）
                    const uniqueHabits = new Set(records.map(r => r.habit_id)).size;
                    const habitsCompleted = uniqueHabits;
                    
                    // 根据完成情况确定等级
                    let currentLevel = "新手学习者";
                    if (completedExercises >= 50) currentLevel = "高级学习者";
                    else if (completedExercises >= 20) currentLevel = "中级学习者";
                    else if (completedExercises >= 5) currentLevel = "初级学习者";
                    
                    return {
                        totalStudyHours,
                        completedExercises,
                        averageScore,
                        habitsCompleted,
                        currentLevel
                    };
                }
            }
        } catch (error) {
            console.error('计算学习统计失败:', error);
        }
        
        // 返回默认数据
        return {
            totalStudyHours: 0,
            completedExercises: 0,
            averageScore: 0,
            habitsCompleted: 0,
            currentLevel: "新手学习者"
        };
    }
    
    // 加载学习数据
    async loadLearningData() {
        try {
            // 尝试从后端获取真实的习惯进度数据
            const habitsProgress = await this.calculateHabitsProgress();
            const overallProgress = await this.calculateOverallProgress(habitsProgress);
            
            this.habitData = {
                habitsProgress,
                overallProgress
            };
            
        } catch (error) {
            console.error('加载学习数据失败:', error);
            throw error;
        }
    }
    
    // 计算各个习惯的掌握度
    async calculateHabitsProgress() {
        try {
            // 七个习惯的基础配置
            const habitsConfig = [
                { habitId: 1, name: "积极主动", color: "#FF6B6B" },
                { habitId: 2, name: "以终为始", color: "#4ECDC4" },
                { habitId: 3, name: "要事第一", color: "#45B7D1" },
                { habitId: 4, name: "双赢思维", color: "#96CEB4" },
                { habitId: 5, name: "知彼解己", color: "#FFEAA7" },
                { habitId: 6, name: "统合综效", color: "#DDA0DD" },
                { habitId: 7, name: "不断更新", color: "#98D8C8" }
            ];
            
            // 获取所有学习记录
            const recordsResponse = await fetch(`${this.apiBase}/api/auth/learning-history/${this.currentUser.id || 1}?limit=200`);
            
            if (recordsResponse.ok) {
                const result = await recordsResponse.json();
                if (result.success && result.records) {
                    const records = result.records;
                    
                    // 按习惯分组计算进度
                    return habitsConfig.map(habit => {
                        const habitRecords = records.filter(r => r.habit_id === habit.habitId);
                        
                        if (habitRecords.length === 0) {
                            return { ...habit, progress: 0 };
                        }
                        
                        // 计算该习惯的平均分数
                        const totalScore = habitRecords.reduce((sum, record) => sum + (record.score || 0), 0);
                        const averageScore = totalScore / habitRecords.length;
                        
                        // 将分数转换为进度百分比（假设满分100）
                        const progress = Math.min(Math.round(averageScore), 100);
                        
                        return { ...habit, progress };
                    });
                }
            }
            
            // 如果获取失败，使用模拟数据
            return habitsConfig.map(habit => ({ ...habit, progress: Math.floor(Math.random() * 40) + 30 }));
            
        } catch (error) {
            console.error('计算习惯进度失败:', error);
            
            // 返回默认数据
            return [
                { habitId: 1, name: "积极主动", progress: 0, color: "#FF6B6B" },
                { habitId: 2, name: "以终为始", progress: 0, color: "#4ECDC4" },
                { habitId: 3, name: "要事第一", progress: 0, color: "#45B7D1" },
                { habitId: 4, name: "双赢思维", progress: 0, color: "#96CEB4" },
                { habitId: 5, name: "知彼解己", progress: 0, color: "#FFEAA7" },
                { habitId: 6, name: "统合综效", progress: 0, color: "#DDA0DD" },
                { habitId: 7, name: "不断更新", progress: 0, color: "#98D8C8" }
            ];
        }
    }
    
    // 计算整体进度
    async calculateOverallProgress(habitsProgress) {
        try {
            // 计算平均进度
            const totalProgress = habitsProgress.reduce((sum, habit) => sum + habit.progress, 0);
            const averageProgress = Math.round(totalProgress / habitsProgress.length);
            
            // 计算完成的单元数（基于进度）
            const completedUnits = Math.round((averageProgress / 100) * 21); // 总共21个单元
            const totalUnits = 21;
            
            // 计算下个里程碑
            let nextMilestone = "100%";
            if (averageProgress < 80) nextMilestone = "80%";
            else if (averageProgress < 90) nextMilestone = "90%";
            
            // 估算完成时间
            let estimatedCompletion = "已完成";
            if (averageProgress < 100) {
                const remainingProgress = 100 - averageProgress;
                const daysToComplete = Math.ceil(remainingProgress / 5); // 假设每天提升5%
                estimatedCompletion = `${daysToComplete}天后`;
            }
            
            return {
                percentage: averageProgress,
                completedUnits,
                totalUnits,
                nextMilestone,
                estimatedCompletion
            };
            
        } catch (error) {
            console.error('计算整体进度失败:', error);
            
            return {
                percentage: 0,
                completedUnits: 0,
                totalUnits: 21,
                nextMilestone: "20%",
                estimatedCompletion: "开始学习"
            };
        }
    }
    
    
    // 渲染用户档案
    renderUserProfile() {
        const { stats } = this.userData;
        
        // 更新统计数据（使用习惯进度数据重新计算掌握习惯数）
        const completedHabitsCount = this.habitData ? 
            this.habitData.habitsProgress.filter(habit => habit.progress >= 80).length : 0;
        
        document.getElementById('totalStudyHours').textContent = stats.totalStudyHours;
        document.getElementById('completedExercises').textContent = stats.completedExercises;
        document.getElementById('averageScore').textContent = stats.averageScore;
        document.getElementById('habitsCompleted').textContent = completedHabitsCount;
    }
    
    // 渲染仪表盘
    renderDashboard() {
        this.renderRadarChart();
        this.renderProgressCircle();
    }
    
    // 渲染雷达图
    renderRadarChart() {
        const canvas = document.getElementById('radarChart');
        const ctx = canvas.getContext('2d');
        const { habitsProgress } = this.habitData;
        
        // 设置画布尺寸
        const size = 300;
        const center = size / 2;
        const radius = 100;
        
        canvas.width = size;
        canvas.height = size;
        
        // 清空画布
        ctx.clearRect(0, 0, size, size);
        
        // 绘制网格
        this.drawRadarGrid(ctx, center, radius, habitsProgress.length);
        
        // 绘制数据区域
        this.drawRadarData(ctx, center, radius, habitsProgress);
        
        // 绘制标签
        this.drawRadarLabels(ctx, center, radius, habitsProgress);
        
        // 生成图例
        this.generateRadarLegend(habitsProgress);
    }
    
    // 绘制雷达图网格
    drawRadarGrid(ctx, center, radius, segments) {
        ctx.strokeStyle = '#e5e5e7';
        ctx.lineWidth = 1;
        
        // 绘制同心圆
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(center, center, (radius / 5) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // 绘制辐射线
        for (let i = 0; i < segments; i++) {
            const angle = (i * 2 * Math.PI) / segments - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    // 绘制雷达图数据
    drawRadarData(ctx, center, radius, data) {
        ctx.fillStyle = 'rgba(0, 122, 255, 0.2)';
        ctx.strokeStyle = 'rgba(0, 122, 255, 0.8)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        
        data.forEach((item, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const distance = (item.progress / 100) * radius;
            const x = center + Math.cos(angle) * distance;
            const y = center + Math.sin(angle) * distance;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 绘制数据点
        data.forEach((item, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const distance = (item.progress / 100) * radius;
            const x = center + Math.cos(angle) * distance;
            const y = center + Math.sin(angle) * distance;
            
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    // 绘制雷达图标签
    drawRadarLabels(ctx, center, radius, data) {
        ctx.fillStyle = '#1d1d1f';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        data.forEach((item, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            
            ctx.fillText(item.name, x, y);
        });
    }
    
    // 生成雷达图图例
    generateRadarLegend(data) {
        const legendContainer = document.getElementById('radarLegend');
        legendContainer.innerHTML = '';
        
        data.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <span>${item.name}: ${item.progress}%</span>
            `;
            legendContainer.appendChild(legendItem);
        });
    }
    
    // 渲染进度环图
    renderProgressCircle() {
        const { overallProgress } = this.habitData;
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const completedUnits = document.getElementById('completedUnits');
        const totalUnits = document.getElementById('totalUnits');
        const nextMilestone = document.getElementById('nextMilestone');
        const estimatedCompletion = document.getElementById('estimatedCompletion');
        
        // 计算进度环的stroke-dashoffset
        const circumference = 2 * Math.PI * 80; // r = 80
        const offset = circumference - (overallProgress.percentage / 100) * circumference;
        
        // 动画更新进度环
        setTimeout(() => {
            progressBar.style.strokeDashoffset = offset;
            progressPercentage.textContent = overallProgress.percentage + '%';
        }, 500);
        
        // 更新详细信息
        completedUnits.textContent = overallProgress.completedUnits;
        totalUnits.textContent = overallProgress.totalUnits;
        nextMilestone.textContent = overallProgress.nextMilestone;
        estimatedCompletion.textContent = overallProgress.estimatedCompletion;
    }
    
    
    
    
    
    // 显示页面内容
    showContent() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('journeyContent').style.display = 'block';
    }
    
    // 显示错误信息
    showError(message) {
        const loadingState = document.getElementById('loadingState');
        loadingState.innerHTML = `
            <div style="text-align: center; color: var(--error);">
                <h3>加载失败</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: var(--primary-blue); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    重新加载
                </button>
            </div>
        `;
    }
    
    // 绑定事件监听器
    bindEventListeners() {
        // 移除头像相关事件监听器
    }
    
    // 显示消息提示
    showMessage(message, type = 'info') {
        // 创建消息提示元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast message-${type}`;
        messageDiv.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageDiv);
        
        // 显示动画
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);
        
        // 3秒后自动消失
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
    
    // 工具方法：计算加入天数
    calculateJoinDays(createdAt) {
        if (!createdAt) return 1;
        const joinDate = new Date(createdAt);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    // 工具方法：格式化最后登录时间
    formatLastLogin(date) {
        const today = new Date();
        const diffTime = today - date;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        if (diffHours < 1) return '刚刚';
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffHours < 48) return '昨天';
        return date.toLocaleDateString('zh-CN');
    }
    
    // 工具方法：根据用户邮箱获取头像
    getUserAvatar(email) {
        // 根据邮箱匹配对应的头像
        const avatarMap = {
            'wangdong@company.com': '/assets/avatars/wangdong.png',
            'wangdong@51talk.com': '/assets/avatars/wangdong.png',
        };
        
        // 如果邮箱包含wangdong，使用王东头像
        if (email && email.toLowerCase().includes('wangdong')) {
            return '/assets/avatars/wangdong.png';
        }
        
        // 否则根据邮箱映射或使用默认头像
        return avatarMap[email] || '/assets/avatars/default.png';
    }
    
    // 模拟API调用
    async mockApiCall(url, mockData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Mock API Call: ${url}`);
                resolve(mockData);
            }, Math.random() * 1000 + 500); // 模拟网络延迟
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.journeyManager = new JourneyManager();
});

// 全局退出函数（供HTML调用）
function logout() {
    console.log('用户从我的旅程页面登出');
    AIEC.UserManager.clearUser();
    window.location.href = 'login.html';
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JourneyManager;
}