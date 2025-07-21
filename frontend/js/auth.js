/**
 * AIEC 职场软技能应用 - 用户认证逻辑
 * 
 * 这个文件包含：
 * 1. 登录/注册表单处理
 * 2. 用户数据验证
 * 3. 本地存储管理
 * 4. 认证状态切换
 */

// =====================
// 认证状态管理
// =====================

class AuthManager {
    constructor() {
        this.users = this.loadUsersFromStorage();
        this.init();
    }
    
    // 初始化认证管理器
    init() {
        this.setupEventListeners();
        console.log('认证管理器已初始化');
    }
    
    // 从本地存储加载用户数据
    loadUsersFromStorage() {
        const savedUsers = localStorage.getItem('aiec_users');
        return savedUsers ? JSON.parse(savedUsers) : [];
    }
    
    // 保存用户数据到本地存储
    saveUsersToStorage() {
        localStorage.setItem('aiec_users', JSON.stringify(this.users));
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
    
    // 处理登录
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        
        // 简单验证
        if (!email || !password) {
            showMessage('请填写完整的登录信息', 'error');
            return;
        }
        
        // 查找用户
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            showMessage('用户不存在，请先注册', 'error');
            return;
        }
        
        if (user.password !== password) {
            showMessage('密码错误，请重试', 'error');
            return;
        }
        
        // 登录成功
        this.loginSuccess(user);
    }
    
    // 处理注册
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // 验证输入
        if (!name || !email || !password || !confirmPassword) {
            showMessage('请填写完整的注册信息', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('两次输入的密码不一致', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('密码至少需要6个字符', 'error');
            return;
        }
        
        // 检查邮箱是否已存在
        if (this.users.find(u => u.email === email)) {
            showMessage('该邮箱已注册，请直接登录', 'error');
            return;
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            progress: {
                skillsCompleted: [],
                totalXP: 0,
                level: 1
            }
        };
        
        this.users.push(newUser);
        this.saveUsersToStorage();
        
        // 注册成功，自动登录
        showMessage('注册成功！欢迎加入AIEC！', 'success');
        setTimeout(() => {
            this.loginSuccess(newUser);
        }, 1500);
    }
    
    // 登录成功处理
    loginSuccess(user) {
        // 移除密码字段（安全考虑）
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            progress: user.progress
        };
        
        // 保存用户状态到localStorage（重要！）
        localStorage.setItem('aiec_current_user', JSON.stringify(safeUser));
        
        // 设置当前用户
        if (window.app) {
            window.app.setUser(safeUser);
        }
        
        showMessage(`欢迎回来，${user.name}！`, 'success');
        
        // 跳转到七个习惯学习页面
        setTimeout(() => {
            window.location.href = 'seven-habits.html';
        }, 1500);
    }
    

}

// =====================
// 页面交互函数
// =====================

// 切换登录/注册选项卡
function switchTab(tabName) {
    // 更新选项卡样式
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // 显示对应表单
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    const targetForm = tabName === 'login' ? 'loginForm' : 'registerForm';
    document.getElementById(targetForm).classList.add('active');
}

// 返回首页
function goHome() {
    window.location.href = 'index.html';
}



// =====================
// 表单验证辅助函数
// =====================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// =====================
// 初始化
// =====================

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 创建认证管理器实例
    window.authManager = new AuthManager();
    
    // 添加输入框焦点效果
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    console.log('认证页面已准备就绪 🔐');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 这里应该调用实际的登录API
            // 目前使用模拟登录
            if (username && password) {
                // 模拟登录成功
                localStorage.setItem('user', JSON.stringify({
                    username: username,
                    loginTime: new Date().toISOString()
                }));
                
                // 跳转到七个习惯学习页面
                window.location.href = 'seven-habits.html';
            } else {
                alert('请输入用户名和密码');
            }
        });
    }

    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 验证密码匹配
            if (password !== confirmPassword) {
                alert('密码不匹配，请重新输入');
                return;
            }
            
            // 这里应该调用实际的注册API
            // 目前使用模拟注册
            if (fullName && email && username && password) {
                // 模拟注册成功
                localStorage.setItem('user', JSON.stringify({
                    fullName: fullName,
                    email: email,
                    username: username,
                    registerTime: new Date().toISOString()
                }));
                
                alert('注册成功！欢迎加入AIEC职场软技能！');
                // 跳转到七个习惯学习页面
                window.location.href = 'seven-habits.html';
            } else {
                alert('请填写所有必填字段');
            }
        });
    }

    // 注册按钮点击 - 跳转到注册页面
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            // 如果当前在登录页面，跳转到注册页面
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'register.html';
            }
        });
    }

    // 登录按钮点击 - 跳转到登录页面
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // 如果当前在注册页面，跳转到登录页面
            if (window.location.pathname.includes('register.html')) {
                window.location.href = 'login.html';
            }
        });
    }

    // 显示注册链接点击
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    // 显示登录链接点击
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
});

// 检查用户是否已登录
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user);
    }
    return null;
}

// 登出功能
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// =====================
// 调试函数
// =====================

function debugUsers() {
    console.log('当前用户列表:', window.authManager.users);
}

function clearUsers() {
    localStorage.removeItem('aiec_users');
    window.authManager.users = [];
    showMessage('用户数据已清空', 'success');
    console.log('用户数据已清空');
} 