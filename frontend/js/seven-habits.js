/**
 * AIEC 职场软技能应用 - 七个习惯学习系统
 * 
 * 这个文件包含：
 * 1. 七个习惯学习系统
 * 2. 用户状态管理
 * 3. 学习进度展示
 * 4. 习惯解锁逻辑
 * 5. 页面导航功能
 */

// 七个习惯学习系统
class SevenHabitsSystem {
    constructor() {
        this.habits = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('🔄 开始初始化七个习惯学习系统...');
        
        // 检查用户认证
        this.checkUserAuth();
        
        // 加载习惯数据
        await this.loadHabits();
        
        // 加载用户数据
        this.loadUserData();
        
        // 更新界面
        this.updateUI();
        
        console.log('✅ 七个习惯学习系统已初始化完成 🎯');
    }

    // 检查用户认证状态
    checkUserAuth() {
        // 先尝试从localStorage恢复用户状态
        const savedUser = localStorage.getItem('aiec_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                // 更新全局状态
                if (window.app) {
                    window.app.setUser(this.currentUser);
                }
                console.log('用户状态恢复成功:', this.currentUser.name);
                return;
            } catch (error) {
                console.error('用户数据解析失败:', error);
                localStorage.removeItem('aiec_current_user');
            }
        }
        
        // 备选方案：检查全局状态
        if (window.app && window.app.currentUser) {
            this.currentUser = window.app.currentUser;
            // 同步到localStorage
            localStorage.setItem('aiec_current_user', JSON.stringify(this.currentUser));
            return;
        }
        
        // 未登录，重定向到登录页
        console.log('用户未登录，重定向到登录页面');
        if (typeof showMessage === 'function') {
            showMessage('请先登录', 'error');
        }
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    }

    // 加载用户数据
    loadUserData() {
        if (!this.currentUser) return;
        
        const userData = localStorage.getItem(`aiec_user_${this.currentUser.id}`);
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                this.currentUser = { ...this.currentUser, ...parsedData };
            } catch (error) {
                console.error('用户数据解析失败:', error);
            }
        }
        
        // 确保用户数据包含必要字段
        if (!this.currentUser.habitsProgress) {
            this.currentUser.habitsProgress = {};
        }
        if (!this.currentUser.totalXP) {
            this.currentUser.totalXP = 0;
        }
        if (!this.currentUser.level) {
            this.currentUser.level = 1;
        }
    }

    // 保存用户数据
    saveUserData() {
        if (!this.currentUser) return;
        
        localStorage.setItem(`aiec_user_${this.currentUser.id}`, JSON.stringify(this.currentUser));
        localStorage.setItem('aiec_current_user', JSON.stringify(this.currentUser));
    }

    async loadHabits() {
        try {
            const response = await fetch('../content/seven_habits.json');
            const data = await response.json();
            this.habits = data.habits;
            
            // 根据用户进度更新习惯状态
            this.updateHabitsStatus();
            
        } catch (error) {
            console.error('加载习惯数据失败:', error);
            this.habits = this.getDefaultHabits();
        }
    }

    // 根据用户进度更新习惯状态
    updateHabitsStatus() {
        if (!this.currentUser || !this.currentUser.habitsProgress) return;
        
        Object.keys(this.habits).forEach(habitId => {
            const habit = this.habits[habitId];
            const userProgress = this.currentUser.habitsProgress[habitId];
            
            if (userProgress) {
                if (userProgress.completed) {
                    habit.status = 'completed';
                    habit.progress = 100;
                } else if (userProgress.started) {
                    habit.status = 'in_progress';
                    habit.progress = userProgress.progress || 0;
                } else {
                    habit.status = this.isHabitUnlocked(habitId) ? 'available' : 'locked';
                    habit.progress = 0;
                }
            } else {
                habit.status = this.isHabitUnlocked(habitId) ? 'available' : 'locked';
                habit.progress = 0;
            }
        });
    }

    // 检查习惯是否解锁
    isHabitUnlocked(habitId) {
        const habit = this.habits[habitId];
        if (!habit.prerequisite) return true;
        
        const prerequisiteProgress = this.currentUser.habitsProgress[habit.prerequisite];
        return prerequisiteProgress && prerequisiteProgress.completed;
    }

    getDefaultHabits() {
        return {
            habit_1: {
                habitId: "habit_1",
                habitName: "积极主动",
                habitNameEn: "Be Proactive",
                description: "从被动响应者到主动价值创造者的关键身份转变",
                status: "available",
                prerequisite: null,
                estimatedTime: "4-6周",
                progress: 0
            },
            habit_2: {
                habitId: "habit_2",
                habitName: "以终为始",
                habitNameEn: "Begin with the End in Mind",
                description: "培养先看靶再拉弓的战略性工作习惯",
                status: "locked",
                prerequisite: "habit_1",
                estimatedTime: "3-4周",
                progress: 0
            },
            habit_3: {
                habitId: "habit_3",
                habitName: "要事第一",
                habitNameEn: "Put First Things First",
                description: "掌握高效能人士的核心组织方法",
                status: "locked",
                prerequisite: "habit_2",
                estimatedTime: "3-4周",
                progress: 0
            },
            habit_4: {
                habitId: "habit_4",
                habitName: "双赢思维",
                habitNameEn: "Think Win-Win",
                description: "建立合作共赢的思维模式",
                status: "locked",
                prerequisite: "habit_3",
                estimatedTime: "3-4周",
                progress: 0
            },
            habit_5: {
                habitId: "habit_5",
                habitName: "知彼解己",
                habitNameEn: "Seek First to Understand",
                description: "掌握深度沟通的核心技能",
                status: "locked",
                prerequisite: "habit_4",
                estimatedTime: "3-4周",
                progress: 0
            },
            habit_6: {
                habitId: "habit_6",
                habitName: "统合综效",
                habitNameEn: "Synergize",
                description: "创造性地解决问题和产生第三选择",
                status: "locked",
                prerequisite: "habit_5",
                estimatedTime: "3-4周",
                progress: 0
            },
            habit_7: {
                habitId: "habit_7",
                habitName: "不断更新",
                habitNameEn: "Sharpen the Saw",
                description: "建立可持续的个人成长系统",
                status: "locked",
                prerequisite: "habit_6",
                estimatedTime: "4-5周",
                progress: 0
            }
        };
    }

    // 更新界面
    updateUI() {
        this.updateUserInfo();
        this.updateProgress();
        this.renderHabits();
    }

    // 更新用户信息
    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (this.currentUser && userNameElement) {
            userNameElement.textContent = this.currentUser.name || this.currentUser.username;
        }
    }

    // 更新进度信息
    updateProgress() {
        if (!this.currentUser || !this.habits) return;
        
        const completedHabits = Object.values(this.habits).filter(habit => habit.status === 'completed').length;
        const totalHabits = Object.keys(this.habits).length;
        const progressPercentage = (completedHabits / totalHabits) * 100;
        
        // 更新进度条
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = `${completedHabits}/${totalHabits} 习惯完成`;
        }
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // 更新经验值和等级
        const totalXPElement = document.getElementById('totalXP');
        const userLevelElement = document.getElementById('userLevel');
        
        if (totalXPElement) {
            totalXPElement.textContent = this.currentUser.totalXP || 0;
        }
        if (userLevelElement) {
            userLevelElement.textContent = this.currentUser.level || 1;
        }
    }

    renderHabits() {
        const habitsGrid = document.getElementById('habitsGrid');
        if (!habitsGrid || !this.habits) return;
        
        habitsGrid.innerHTML = '';

        Object.values(this.habits).forEach((habit, index) => {
            const habitCard = this.createHabitCard(habit, index + 1);
            habitsGrid.appendChild(habitCard);
        });
    }

    createHabitCard(habit, number) {
        const card = document.createElement('div');
        card.className = `habit-card ${habit.status}`;
        
        const statusIcon = this.getStatusIcon(habit.status);
        const progressWidth = habit.progress || 0;
        
        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-number">${number}</div>
                <div class="habit-status">${statusIcon}</div>
            </div>
            <div class="habit-content">
                <h3 class="habit-title">${habit.habitName}</h3>
                <p class="habit-title-en">${habit.habitNameEn}</p>
                <p class="habit-description">${habit.description}</p>
                <div class="habit-meta">
                    <span class="estimated-time">⏱️ ${habit.estimatedTime}</span>
                </div>
                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    </div>
                    <span class="progress-text">${progressWidth}%</span>
                </div>
            </div>
            <div class="habit-actions">
                ${this.getActionButtons(habit)}
            </div>
        `;

        // 添加点击事件
        if (habit.status === 'available' || habit.status === 'in_progress') {
            card.addEventListener('click', () => this.openHabitModal(habit));
        }

        return card;
    }

    getStatusIcon(status) {
        const icons = {
            'available': '🟢',
            'in_progress': '🟡',
            'completed': '✅',
            'locked': '🔒'
        };
        return icons[status] || '🔒';
    }

    getActionButtons(habit) {
        switch (habit.status) {
            case 'available':
                return `<button class="action-btn primary" onclick="startHabit('${habit.habitId}')">开始学习</button>`;
            case 'in_progress':
                return `<button class="action-btn secondary" onclick="continueHabit('${habit.habitId}')">继续学习</button>`;
            case 'completed':
                return `<button class="action-btn success" onclick="reviewHabit('${habit.habitId}')">复习回顾</button>`;
            case 'locked':
                return `<button class="action-btn disabled" disabled>待解锁</button>`;
            default:
                return '';
        }
    }

    openHabitModal(habit) {
        const modal = document.getElementById('habitModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = `${habit.habitName} - ${habit.habitNameEn}`;
            modalBody.innerHTML = this.generateHabitModalContent(habit);
            modal.style.display = 'block';
        }
    }

    generateHabitModalContent(habit) {
        return `
            <div class="habit-modal-content">
                <div class="habit-overview">
                    <h3>习惯概览</h3>
                    <p>${habit.description}</p>
                    <div class="habit-details">
                        <div class="detail-item">
                            <strong>预计学习时间:</strong> ${habit.estimatedTime}
                        </div>
                        <div class="detail-item">
                            <strong>前置要求:</strong> ${habit.prerequisite ? '需要完成前一个习惯' : '无'}
                        </div>
                        <div class="detail-item">
                            <strong>当前进度:</strong> ${habit.progress}%
                        </div>
                    </div>
                </div>
                
                <div class="learning-structure">
                    <h3>学习结构</h3>
                    <div class="structure-grid">
                        <div class="structure-item">
                            <div class="structure-icon">💡</div>
                            <h4>理念导入</h4>
                            <p>深入理解习惯的核心价值和重要性</p>
                        </div>
                        <div class="structure-item">
                            <div class="structure-icon">🎯</div>
                            <h4>导师亲授</h4>
                            <p>Leon导师的实战经验分享</p>
                        </div>
                        <div class="structure-item">
                            <div class="structure-icon">🔥</div>
                            <h4>实战模拟</h4>
                            <p>真实场景中的技能练习</p>
                        </div>
                        <div class="structure-item">
                            <div class="structure-icon">🤔</div>
                            <h4>难题思辨</h4>
                            <p>复杂情境下的深度思考</p>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="action-btn secondary" onclick="closeHabitModal()">关闭</button>
                    <button class="action-btn primary" onclick="startHabit('${habit.habitId}')">开始学习</button>
                </div>
            </div>
        `;
    }

    // 开始学习习惯
    startHabit(habitId) {
        if (!this.currentUser || !this.habits[habitId]) return;
        
        const habit = this.habits[habitId];
        if (habit.status !== 'available') return;
        
        // 更新用户进度
        if (!this.currentUser.habitsProgress) {
            this.currentUser.habitsProgress = {};
        }
        
        this.currentUser.habitsProgress[habitId] = {
            started: true,
            progress: 10,
            startTime: new Date().toISOString()
        };
        
        // 保存数据
        this.saveUserData();
        
        // 更新界面
        this.updateHabitsStatus();
        this.updateUI();
        
        // 关闭模态框
        this.closeHabitModal();
        
        // 显示成功消息
        if (typeof showMessage === 'function') {
            showMessage(`开始学习"${habit.habitName}"`, 'success');
        }
    }

    // 继续学习习惯
    continueHabit(habitId) {
        if (typeof showMessage === 'function') {
            showMessage('继续学习功能即将推出', 'info');
        }
    }

    // 复习习惯
    reviewHabit(habitId) {
        if (typeof showMessage === 'function') {
            showMessage('复习功能即将推出', 'info');
        }
    }

    // 关闭模态框
    closeHabitModal() {
        const modal = document.getElementById('habitModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// 全局函数
function goHome() {
    window.location.href = 'index.html';
}

function logout() {
    if (window.app && window.app.logout) {
        window.app.logout();
    } else {
        localStorage.removeItem('aiec_current_user');
        window.location.href = 'login.html';
    }
}

function startHabit(habitId) {
    if (window.sevenHabitsSystem) {
        window.sevenHabitsSystem.startHabit(habitId);
    }
}

function continueHabit(habitId) {
    if (window.sevenHabitsSystem) {
        window.sevenHabitsSystem.continueHabit(habitId);
    }
}

function reviewHabit(habitId) {
    if (window.sevenHabitsSystem) {
        window.sevenHabitsSystem.reviewHabit(habitId);
    }
}

function closeHabitModal() {
    if (window.sevenHabitsSystem) {
        window.sevenHabitsSystem.closeHabitModal();
    }
}

// 七个习惯页面的特定功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('七个习惯页面DOM加载完成');
    
    // 检查身份验证
    const user = checkAuth();
    if (!user) {
        console.log('用户未登录，跳转到登录页面');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('用户已登录，初始化页面功能');
    // 初始化页面功能
    initializeHabitsPage();
});

function initializeHabitsPage() {
    console.log('开始初始化七个习惯页面功能');
    
    // 为所有习惯卡片添加交互功能
    const habitCards = document.querySelectorAll('.habit-card');
    console.log('找到习惯卡片数量:', habitCards.length);
    
    habitCards.forEach((card, index) => {
        console.log('处理第', index + 1, '个习惯卡片');
        
        const habitNumber = card.querySelector('.habit-number');
        const startButton = card.querySelector('.habit-actions .btn-primary');
        const detailButton = card.querySelector('.habit-actions .btn-secondary');
        
        if (habitNumber) {
            console.log('习惯编号:', habitNumber.textContent);
        }
        
        if (startButton && startButton.textContent.includes('开始学习')) {
            console.log('绑定第', index + 1, '个习惯的开始学习按钮');
            startButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('开始学习按钮被点击');
                
                if (habitNumber) {
                    const number = habitNumber.textContent.trim();
                    console.log('开始学习习惯', number);
                    startHabitLearning(number, card);
                } else {
                    console.error('未找到习惯编号元素');
                }
            });
        }
        
        if (detailButton && detailButton.textContent.includes('查看详情')) {
            console.log('绑定第', index + 1, '个习惯的查看详情按钮');
            detailButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('查看详情按钮被点击');
                
                if (habitNumber) {
                    const number = habitNumber.textContent.trim();
                    console.log('查看习惯', number, '详情');
                    showHabitDetail(number);
                } else {
                    console.error('未找到习惯编号元素');
                }
            });
        }
    });
    
    console.log('七个习惯页面功能初始化完成');
}

function startHabitLearning(habitNumber, habitCard) {
    console.log('执行开始学习功能，习惯编号:', habitNumber);
    
    try {
        // 跳转到具体的学习页面
        window.location.href = `habit-learning.html?habit=${habitNumber}`;
    } catch (error) {
        console.error('开始学习功能执行出错:', error);
    }
}

function showHabitDetail(habitNumber) {
    console.log('显示习惯详情，习惯编号:', habitNumber);
    
    try {
        // 显示习惯详情
        alert(`习惯${habitNumber}的详细信息功能正在开发中...`);
    } catch (error) {
        console.error('显示习惯详情出错:', error);
    }
}

// checkAuth 函数现在使用 app.js 中的全局版本

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('habitModal');
    if (event.target === modal) {
        closeHabitModal();
    }
}; 