/**
 * AIEC 职场软技能应用 - 主应用逻辑
 * 
 * 这个文件包含应用的核心功能：
 * 1. 页面导航逻辑
 * 2. 用户状态管理
 * 3. 基础工具函数
 */

// =====================
// 应用状态管理
// =====================

class AppState {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.init();
    }
    
    // 初始化应用状态
    init() {
        this.loadUserFromStorage();
        this.updateUI();
        console.log('应用已初始化');
    }
    
    // 从本地存储加载用户信息
    loadUserFromStorage() {
        const savedUser = localStorage.getItem('aiec_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }
    
    // 保存用户信息到本地存储
    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('aiec_current_user', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('aiec_current_user');
        }
    }
    
    // 设置当前用户
    setUser(user) {
        this.currentUser = user;
        this.saveUserToStorage();
        this.updateUI();
    }
    
    // 清除用户登录状态
    logout() {
        this.currentUser = null;
        this.saveUserToStorage();
        this.updateUI();
        this.navigateTo('home');
    }
    
    // 检查用户是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // 更新UI状态
    updateUI() {
        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            if (this.isLoggedIn()) {
                navButtons.innerHTML = `
                    <div class="user-info">
                        <div class="user-profile">
                            <span class="emoji">🌟</span>
                            <span>${this.currentUser.name}</span>
                        </div>
                        <div class="user-actions">
                            <button class="action-btn secondary" onclick="app.logout()">退出</button>
                            <button class="action-btn primary" onclick="goToHabits()">我的学习</button>
                        </div>
                    </div>
                `;
            } else {
                navButtons.innerHTML = `
                    <div class="user-actions">
                        <button class="action-btn secondary" onclick="goToLogin()">登录</button>
                        <button class="action-btn primary" onclick="goToRegister()">开始学习</button>
                    </div>
                `;
            }
        }
    }
    
    // 页面导航
    navigateTo(page) {
        this.currentPage = page;
        switch(page) {
            case 'home':
                window.location.href = 'index.html';
                break;
            case 'login':
                window.location.href = 'login.html';
                break;
            case 'habits':
                window.location.href = 'skills.html';
                break;
            case 'seven-habits':
                window.location.href = 'seven-habits.html';
                break;
            default:
                console.warn('未知页面:', page);
        }
    }
}

// =====================
// 全局应用实例
// =====================

let app;

// 确保DOM完全加载后再执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // 首先检查身份验证
    checkPageAuth();
    
    // 只在主页初始化按钮事件
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/frontend/') {
        initializeButtons();
    }
});

// 检查页面身份验证
function checkPageAuth() {
    const currentPage = window.location.pathname;
    const protectedPages = ['index.html', 'seven-habits.html', 'skills.html', 'test-ai.html'];
    
    // 如果是受保护的页面，检查身份验证
    if (protectedPages.some(page => currentPage.includes(page)) || currentPage === '/' || currentPage === '/frontend/') {
        const user = checkAuth();
        if (!user) {
            console.log('用户未登录，跳转到登录页面');
            window.location.href = 'login.html';
            return false;
        }
        
        console.log('用户已登录:', user);
        return true;
    }
    return true;
}

// 初始化主页按钮事件
function initializeButtons() {
    console.log('初始化主页按钮事件...');
    

    
    // 主页习惯卡片的"开始学习"按钮
    const startLearningButtons = document.querySelectorAll('.habit-actions .btn-primary');
    console.log('找到', startLearningButtons.length, '个习惯学习按钮');
    
    startLearningButtons.forEach((button, index) => {
        if (button.textContent.includes('开始学习')) {
            console.log('绑定主页习惯学习按钮', index + 1);
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('主页习惯学习按钮被点击');
                
                const user = checkAuth();
                if (user) {
                    const habitCard = this.closest('.habit-card');
                    const habitNumber = habitCard.querySelector('.habit-number').textContent;
                    console.log('从主页开始学习习惯', habitNumber);
                    
                    // 跳转到具体习惯学习页面
                    window.location.href = `habit-learning.html?habit=${habitNumber}`;
                } else {
                    console.log('用户未登录，跳转到登录页面');
                    window.location.href = 'login.html';
                }
            });
        }
    });
    
    // 技能训练的"开始练习"按钮
    const startPracticeButtons = document.querySelectorAll('.skill-card .btn-primary');
    console.log('找到', startPracticeButtons.length, '个技能练习按钮');
    
    startPracticeButtons.forEach((button, index) => {
        if (button.textContent.includes('开始练习')) {
            console.log('绑定技能练习按钮', index + 1);
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('技能练习按钮被点击');
                
                const user = checkAuth();
                if (user) {
                    alert('技能练习功能正在开发中...');
                } else {
                    console.log('用户未登录，跳转到登录页面');
                    window.location.href = 'login.html';
                }
            });
        }
    });
}

// 检查用户是否已登录
function checkAuth() {
    const user = localStorage.getItem('aiec_current_user');
    if (user) {
        try {
            return JSON.parse(user);
        } catch (e) {
            console.log('用户数据解析失败，清除数据');
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
}

// 登出功能
function logout() {
    console.log('用户登出');
    localStorage.removeItem('aiec_current_user');
    window.location.href = 'login.html';
}

// =====================
// 导航函数（供HTML调用）
// =====================

function goToLogin() {
    console.log('跳转到登录页面');
    app.navigateTo('login');
}

function goToRegister() {
    console.log('跳转到注册页面');
    // 目前注册和登录使用同一个页面
    app.navigateTo('login');
}

function goToHabits() {
    console.log('跳转到七个习惯学习页面');
    if (!app.isLoggedIn()) {
        alert('请先登录');
        app.navigateTo('login');
        return;
    }
    app.navigateTo('habits');
}

// 为了向后兼容，保留goToSkills函数
function goToSkills() {
    console.log('跳转到七个习惯学习页面');
    goToHabits();
}

// =====================
// 页面动画和交互增强
// =====================

function addPageAnimations() {
    // 添加按钮点击动画
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建涟漪效果
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 页面淡入动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// =====================
// 工具函数
// =====================

function showMessage(message, type = 'info') {
    // 简单的消息提示函数
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#FF3B30' : '#34C759'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// 调试函数
function debug(message, data = null) {
    console.log(`[AIEC Debug] ${message}`, data || '');
}

// 导出给其他文件使用
window.app = app;
window.showMessage = showMessage;
window.debug = debug; 