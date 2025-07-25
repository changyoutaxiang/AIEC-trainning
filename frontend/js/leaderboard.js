/**
 * AIEC学习排行榜前端逻辑
 * 负责排行榜数据加载、展示和交互
 */

class LeaderboardManager {
    constructor() {
        this.currentUserId = this.getCurrentUserId();
        this.API_BASE = this.getAPIBaseURL() + '/api';
        this.cache = new Map();
        this.loading = false;
        
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

    /**
     * 初始化
     */
    async init() {
        this.setupEventListeners();
        this.loadDepartments();
        await this.loadLeaderboard();
        await this.loadUserRank();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        const periodFilter = document.getElementById('periodFilter');
        const typeFilter = document.getElementById('typeFilter');
        const departmentFilter = document.getElementById('departmentFilter');

        if (periodFilter) {
            periodFilter.addEventListener('change', () => this.loadLeaderboard());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.handleTypeFilterChange();
                this.loadLeaderboard();
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => this.loadLeaderboard());
        }

        // 实时更新（每30秒）
        setInterval(() => this.loadLeaderboard(), 30000);
    }

    /**
     * 处理类型筛选变化
     */
    handleTypeFilterChange() {
        const typeFilter = document.getElementById('typeFilter');
        const departmentFilter = document.getElementById('departmentFilter');

        if (!typeFilter || !departmentFilter) return;

        const selectedType = typeFilter.value;
        
        if (selectedType === 'department') {
            departmentFilter.style.display = 'block';
        } else {
            departmentFilter.style.display = 'none';
        }
    }

    /**
     * 加载部门列表
     */
    async loadDepartments() {
        try {
            const response = await fetch(`${this.API_BASE}/leaderboard/departments`);
            const data = await response.json();

            if (data.success) {
                this.populateDepartments(data.data);
            }
        } catch (error) {
            console.error('加载部门列表失败:', error);
        }
    }

    /**
     * 填充部门选择器
     */
    populateDepartments(departments) {
        const departmentFilter = document.getElementById('departmentFilter');
        if (!departmentFilter) return;

        departmentFilter.innerHTML = '<option value="">选择部门</option>';
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
    }

    /**
     * 加载排行榜数据
     */
    async loadLeaderboard() {
        if (this.loading) return;

        this.loading = true;
        this.showLoading();

        try {
            const params = this.getFilterParams();
            const cacheKey = this.getCacheKey(params);
            
            // 检查缓存
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < 30000) { // 30秒缓存
                    this.renderLeaderboard(cached.data);
                    this.loading = false;
                    return;
                }
            }

            const response = await this.fetchLeaderboard(params);
            const data = await response.json();

            if (data.success) {
                this.cache.set(cacheKey, {
                    data: data.data,
                    timestamp: Date.now()
                });
                this.renderLeaderboard(data.data);
                this.updateLastUpdated(data.data.lastUpdated);
            } else {
                throw new Error(data.error || '获取数据失败');
            }

        } catch (error) {
            console.error('加载排行榜失败:', error);
            this.showError('加载排行榜失败，请稍后重试');
        } finally {
            this.loading = false;
        }
    }

    /**
     * 获取筛选参数
     */
    getFilterParams() {
        const period = document.getElementById('periodFilter')?.value || 'total';
        const type = document.getElementById('typeFilter')?.value || 'global';
        const department = document.getElementById('departmentFilter')?.value || '';

        const params = { period, type, limit: 100 };
        
        if (type === 'department' && department) {
            params.department = department;
        }
        
        if (type === 'friends' && this.currentUserId) {
            params.userId = this.currentUserId;
        }

        return params;
    }

    /**
     * 获取缓存键
     */
    getCacheKey(params) {
        return JSON.stringify(params);
    }

    /**
     * 获取排行榜API数据
     */
    async fetchLeaderboard(params) {
        const queryString = new URLSearchParams(params).toString();
        return fetch(`${this.API_BASE}/leaderboard?${queryString}`);
    }

    /**
     * 加载用户个人排名
     */
    async loadUserRank() {
        if (!this.currentUserId) {
            this.hideUserRankLoading();
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/leaderboard/user/${this.currentUserId}`);
            const data = await response.json();

            if (data.success) {
                this.renderUserRank(data.data);
            }
        } catch (error) {
            console.error('加载用户排名失败:', error);
        } finally {
            this.hideUserRankLoading();
        }
    }

    /**
     * 渲染排行榜
     */
    renderLeaderboard(data) {
        const leaderboardList = document.getElementById('leaderboardList');
        const emptyState = document.getElementById('emptyState');
        const loading = document.getElementById('leaderboardLoading');

        if (!leaderboardList || !emptyState || !loading) return;

        this.hideLoading();

        if (!data.rankings || data.rankings.length === 0) {
            emptyState.style.display = 'block';
            leaderboardList.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        leaderboardList.style.display = 'block';

        leaderboardList.innerHTML = data.rankings
            .map((user, index) => this.createLeaderboardItem(user, index))
            .join('');

        // 添加动画
        this.addAnimationEffects(leaderboardList);
    }

    /**
     * 创建排行榜项目HTML
     */
    createLeaderboardItem(user, index) {
        const rank = user.rank || index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
        const rankText = rank;

        return `
            <div class="leaderboard-item" data-user-id="${user.userId}">
                <div class="rank-badge ${rankClass}">${rankText}</div>
                <div class="user-info">
                    <div class="user-avatar">${user.username.charAt(0)}</div>
                    <div class="user-details">
                        <div class="user-name">${this.escapeHtml(user.username)}</div>
                        <div class="user-department">${this.escapeHtml(user.department)}</div>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat">
                        <div class="stat-number">${user.totalProgress}%</div>
                        <div class="stat-label">进度</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${user.completedHabits}/7</div>
                        <div class="stat-label">习惯</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${user.streakDays}</div>
                        <div class="stat-label">连续</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${user.totalScore}</div>
                        <div class="stat-label">得分</div>
                    </div>
                </div>
                <div class="user-badges">
                    ${user.badges.map(badge => `<span class="badge-tooltip" data-tooltip="成就徽章">${badge}</span>`).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染用户个人排名
     */
    renderUserRank(data) {
        const positionEl = document.getElementById('userPosition');
        const totalEl = document.getElementById('userTotal');
        const progressEl = document.getElementById('userProgress');
        const progressFillEl = document.getElementById('userProgressFill');
        const completedEl = document.getElementById('userCompleted');
        const streakEl = document.getElementById('userStreak');
        const scoreEl = document.getElementById('userScore');

        if (!positionEl || !totalEl || !progressEl || !progressFillEl || 
            !completedEl || !streakEl || !scoreEl) return;

        positionEl.textContent = `#${data.globalRank.position}`;
        totalEl.textContent = `/ ${data.globalRank.total}`;
        progressEl.textContent = `${data.userData.totalProgress}%`;
        progressFillEl.style.width = `${data.userData.totalProgress}%`;
        completedEl.textContent = data.userData.completedHabits;
        streakEl.textContent = data.userData.streakDays;
        scoreEl.textContent = data.userData.totalScore;
    }

    /**
     * 更新最后更新时间
     */
    updateLastUpdated(timestamp) {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (!lastUpdatedEl) return;

        const date = new Date(timestamp);
        const formatted = date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdatedEl.textContent = formatted;
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const loading = document.getElementById('leaderboardLoading');
        const list = document.getElementById('leaderboardList');
        const emptyState = document.getElementById('emptyState');

        if (loading) loading.style.display = 'flex';
        if (list) list.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = document.getElementById('leaderboardLoading');
        if (loading) loading.style.display = 'none';
    }

    /**
     * 隐藏用户排名加载
     */
    hideUserRankLoading() {
        const loading = document.getElementById('userRankLoading');
        if (loading) loading.style.display = 'none';
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>出错了</h4>
                    <p>${message}</p>
                </div>
            `;
            leaderboardList.style.display = 'block';
        }
    }

    /**
     * 添加动画效果
     */
    addAnimationEffects(container) {
        const items = container.querySelectorAll('.leaderboard-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    /**
     * 获取当前用户ID
     */
    getCurrentUserId() {
        // 从本地存储获取用户ID
        const user = localStorage.getItem('currentUser');
        if (user) {
            try {
                return JSON.parse(user).id;
            } catch (error) {
                console.error('解析用户信息失败:', error);
            }
        }
        return null;
    }

    /**
     * HTML转义
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * 生成测试数据（开发用）
     */
    async generateTestData() {
        try {
            const response = await fetch(`${this.API_BASE}/leaderboard/test-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ count: 50 })
            });

            const data = await response.json();
            if (data.success) {
                console.log('测试数据生成成功');
                await this.loadLeaderboard();
            }
        } catch (error) {
            console.error('生成测试数据失败:', error);
        }
    }

    /**
     * 更新用户进度（用于测试）
     */
    async updateUserProgress(habitNumber, progress, practiceScore) {
        if (!this.currentUserId) {
            console.warn('未登录用户，无法更新进度');
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/leaderboard/update-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.currentUserId,
                    habitNumber,
                    progress,
                    practiceScore,
                    activityType: 'habit_progress'
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('用户进度更新成功:', data.data);
                await this.loadLeaderboard();
                await this.loadUserRank();
            }
        } catch (error) {
            console.error('更新用户进度失败:', error);
        }
    }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboardManager = new LeaderboardManager();
    
    // 添加开发用快捷命令
    if (window.location.search.includes('dev=true')) {
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'g') {
                console.log('🔄 生成测试数据...');
                window.leaderboardManager.generateTestData();
            }
        });
        console.log('📋 开发模式已启用：按 Ctrl+G 生成测试数据');
    }
});

/**
 * 工具函数：从学习页面更新进度
 */
function updateLeaderboardProgress(habitNumber, progress, practiceScore) {
    if (window.leaderboardManager) {
        window.leaderboardManager.updateUserProgress(habitNumber, progress, practiceScore);
    }
}