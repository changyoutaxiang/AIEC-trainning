/**
 * AIEC 企业邮箱认证系统
 * 
 * 功能：
 * 1. 企业邮箱白名单验证
 * 2. 用户注册/登录
 * 3. 学习记录管理
 * 4. 用户状态管理
 */

class EnterpriseAuthManager {
    constructor() {
        this.apiBase = this.getAPIBaseURL() + '/api/auth';
        this.currentUser = null;
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
    
    // 初始化认证管理器
    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
        console.log('🔐 企业邮箱认证管理器已初始化');
    }
    
    // 从localStorage加载当前用户
    loadCurrentUser() {
        const userData = localStorage.getItem('aiec_current_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('用户状态已恢复:', this.currentUser.email);
            } catch (error) {
                console.error('用户数据解析失败:', error);
                localStorage.removeItem('aiec_current_user');
            }
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 登录表单
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // 注册表单
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }
    
    // 处理企业邮箱登录
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email').trim().toLowerCase();
        const password = formData.get('password').trim();
        
        // 输入验证
        if (!email || !password) {
            AIEC.MessageHandler.error('请输入企业邮箱和密码');
            return;
        }
        
        if (!this.validateEmail(email)) {
            AIEC.MessageHandler.error('邮箱格式不正确');
            return;
        }
        
        if (!this.validatePassword(password)) {
            AIEC.MessageHandler.error('密码必须为6位数字');
            return;
        }
        
        try {
            // 显示加载状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '登录中...';
            submitBtn.disabled = true;
            
            // 调用登录API
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loginSuccess(result.user);
            } else {
                AIEC.MessageHandler.error(result.message);
            }
            
        } catch (error) {
            console.error('登录请求失败:', error);
            AIEC.MessageHandler.error('网络连接失败，请检查后端服务是否启动');
        } finally {
            // 恢复按钮状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.textContent = '登录';
            submitBtn.disabled = false;
        }
    }
    
    // 处理企业邮箱注册
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email').trim().toLowerCase();
        const name = formData.get('name').trim();
        const department = formData.get('department').trim();
        const position = formData.get('position').trim();
        const password = formData.get('password').trim();
        const confirmPassword = formData.get('confirmPassword').trim();
        
        // 输入验证
        if (!email || !name || !password || !confirmPassword) {
            AIEC.MessageHandler.error('企业邮箱、姓名和密码为必填项');
            return;
        }
        
        if (!this.validateEmail(email)) {
            AIEC.MessageHandler.error('邮箱格式不正确');
            return;
        }
        
        if (!this.validatePassword(password)) {
            AIEC.MessageHandler.error('密码必须为6位数字');
            return;
        }
        
        if (password !== confirmPassword) {
            AIEC.MessageHandler.error('两次输入的密码不一致');
            return;
        }
        
        try {
            // 显示加载状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '注册中...';
            submitBtn.disabled = true;
            
            // 调用注册API
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    department: department || null,
                    position: position || null,
                    password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                AIEC.MessageHandler.success(result.message);
                
                // 注册成功后自动登录
                setTimeout(() => {
                    this.loginSuccess(result.user);
                }, 1500);
            } else {
                AIEC.MessageHandler.error(result.message);
            }
            
        } catch (error) {
            console.error('注册请求失败:', error);
            AIEC.MessageHandler.error('网络连接失败，请检查后端服务是否启动');
        } finally {
            // 恢复按钮状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.textContent = '创建账户';
            submitBtn.disabled = false;
        }
    }
    
    // 登录成功处理
    loginSuccess(user) {
        // 保存用户状态
        this.currentUser = user;
        localStorage.setItem('aiec_current_user', JSON.stringify(user));
        
        // 设置全局用户状态
        if (window.AIEC && window.AIEC.UserManager) {
            window.AIEC.UserManager.setUser(user);
        }
        
        AIEC.MessageHandler.success(`欢迎回来，${user.name}！`);
        
        // 跳转到首页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // 保存学习记录
    async saveLearningRecord(recordData) {
        if (!this.currentUser) {
            console.error('用户未登录，无法保存学习记录');
            return false;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/save-learning-record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    ...recordData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('学习记录保存成功:', result.recordId);
                return true;
            } else {
                console.error('学习记录保存失败:', result.message);
                return false;
            }
            
        } catch (error) {
            console.error('保存学习记录时发生错误:', error);
            return false;
        }
    }
    
    // 获取学习历史
    async getLearningHistory(habitId = null, limit = 50) {
        if (!this.currentUser) {
            console.error('用户未登录，无法获取学习历史');
            return [];
        }
        
        try {
            let url = `${this.apiBase}/learning-history/${this.currentUser.id}?limit=${limit}`;
            if (habitId) {
                url += `&habitId=${habitId}`;
            }
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success) {
                return result.records;
            } else {
                console.error('获取学习历史失败:', result.message);
                return [];
            }
            
        } catch (error) {
            console.error('获取学习历史时发生错误:', error);
            return [];
        }
    }
    
    // 邮箱格式验证
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 6位数字密码验证
    validatePassword(password) {
        return /^[0-9]{6}$/.test(password);
    }
    
    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }
    
    // 检查用户是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // 登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('aiec_current_user');
        
        if (window.AIEC && window.AIEC.UserManager) {
            window.AIEC.UserManager.clearUser();
        }
        
        window.location.href = 'login.html';
    }
}

// 全局实例
let enterpriseAuth = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 创建企业认证管理器实例
    enterpriseAuth = new EnterpriseAuthManager();
    
    // 将实例挂载到全局对象
    if (window.AIEC) {
        window.AIEC.EnterpriseAuth = enterpriseAuth;
    } else {
        window.AIEC = { EnterpriseAuth: enterpriseAuth };
    }
    
    console.log('🎉 企业邮箱认证系统已准备就绪');
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnterpriseAuthManager;
}