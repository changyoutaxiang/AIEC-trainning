/**
 * AIEC 统一工具模块 v1.0
 * 提供错误处理、消息提示、存储管理等通用功能
 */

// ==================== 错误处理机制 ====================

/**
 * 统一错误处理器
 */
class ErrorHandler {
    static handle(error, context = '操作') {
        console.error(`❌ ${context}失败:`, error);
        
        // 根据错误类型显示不同的用户友好消息
        let userMessage = '操作失败，请重试';
        
        if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
            userMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message?.includes('API')) {
            userMessage = 'AI服务暂时不可用，请稍后重试';
        } else if (error.message?.includes('权限') || error.message?.includes('认证')) {
            userMessage = '登录已过期，请重新登录';
        } else if (error.message) {
            userMessage = error.message;
        }
        
        MessageHandler.error(userMessage);
        return userMessage;
    }
    
    static async withErrorHandling(asyncFn, context = '操作') {
        try {
            return await asyncFn();
        } catch (error) {
            this.handle(error, context);
            throw error;
        }
    }
}

// ==================== 消息提示系统 ====================

/**
 * 统一消息提示处理器
 */
class MessageHandler {
    static show(message, type = 'info', duration = 3000) {
        // 创建消息容器（如果不存在）
        let container = document.getElementById('message-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'message-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            margin-bottom: 10px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            background-color: ${this._getColorByType(type)};
        `;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        // 自动移除
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        container.removeChild(messageEl);
                    }
                }, 300);
            }
        }, duration);
        
        // 添加CSS动画（如果还没有）
        this._addAnimationStyles();
    }
    
    static success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }
    
    static error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }
    
    static warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }
    
    static info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
    
    static _getColorByType(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
    
    static _addAnimationStyles() {
        if (document.getElementById('message-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'message-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== 存储管理器 ====================

/**
 * 统一localStorage管理器
 */
class StorageManager {
    static prefix = 'aiec_';
    
    static set(key, value) {
        try {
            const prefixedKey = this.prefix + key;
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(prefixedKey, serializedValue);
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const prefixedKey = this.prefix + key;
            const value = localStorage.getItem(prefixedKey);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            // 只清除带有前缀的项目
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    }
    
    static has(key) {
        const prefixedKey = this.prefix + key;
        return localStorage.getItem(prefixedKey) !== null;
    }
}

// ==================== 用户状态管理器 ====================

/**
 * 统一用户状态管理器
 */
class UserManager {
    static userKey = 'current_user';
    
    static setUser(userData) {
        return StorageManager.set(this.userKey, userData);
    }
    
    static getUser() {
        return StorageManager.get(this.userKey);
    }
    
    static clearUser() {
        return StorageManager.remove(this.userKey);
    }
    
    static isLoggedIn() {
        const user = this.getUser();
        return user && user.email;
    }
    
    static requireAuth() {
        if (!this.isLoggedIn()) {
            MessageHandler.warning('请先登录');
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
    
    static getUserEmail() {
        const user = this.getUser();
        return user ? user.email : null;
    }
    
    static updateUserData(updatedData) {
        const currentUser = this.getUser();
        if (currentUser) {
            const newUserData = { ...currentUser, ...updatedData };
            return this.setUser(newUserData);
        }
        return false;
    }
}

// ==================== HTTP请求工具 ====================

/**
 * 统一HTTP请求管理器
 */
class HttpManager {
    static async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10秒超时
        };
        
        const config = { ...defaultOptions, ...options };
        
        // 添加超时控制
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), config.timeout);
        });
        
        try {
            const response = await Promise.race([
                fetch(url, config),
                timeoutPromise
            ]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('HTTP请求失败:', { url, error });
            throw error;
        }
    }
    
    static async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }
    
    static async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

// ==================== 工具函数 ====================

/**
 * 通用工具函数
 */
class Utils {
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 深度克隆
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === "object") {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }
    
    // 格式化日期
    static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const map = {
            YYYY: d.getFullYear(),
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            DD: String(d.getDate()).padStart(2, '0'),
            HH: String(d.getHours()).padStart(2, '0'),
            mm: String(d.getMinutes()).padStart(2, '0'),
            ss: String(d.getSeconds()).padStart(2, '0')
        };
        
        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
    }

    // ==================== SVG 工具函数 ====================
    
    /**
     * 检查SVG文件是否存在
     * @param {string} svgPath - SVG文件路径
     * @returns {Promise<boolean>} - 文件是否存在
     */
    static async checkSVGExists(svgPath) {
        try {
            const response = await fetch(svgPath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 加载SVG内容
     * @param {string} svgPath - SVG文件路径
     * @returns {Promise<string|null>} - SVG内容或null
     */
    static async loadSVG(svgPath) {
        try {
            const response = await fetch(svgPath);
            if (response.ok) {
                return await response.text();
            }
            return null;
        } catch (error) {
            console.log(`SVG加载失败: ${svgPath}`);
            return null;
        }
    }

    /**
     * 生成理念导入的SVG路径
     * @param {string} habitId - 习惯ID (如 'habit_1')
     * @param {string} type - 类型: 'core-philosophy' 或 'unit_1_1' 等
     * @returns {string} - SVG文件路径
     */
    static getConceptSVGPath(habitId, type) {
        return `assets/concept-visuals/${habitId}/${type}.svg`;
    }

    /**
     * 创建带SVG的内容HTML
     * @param {string} title - 标题
     * @param {string} content - 文字内容
     * @param {string} svgContent - SVG内容 (可选)
     * @param {string} cssClass - CSS类名 (可选)
     * @returns {string} - 生成的HTML
     */
    static createVisualContent(title, content, svgContent = null, cssClass = '') {
        const hasSVG = svgContent && svgContent.trim();
        
        return `
            <div class="concept-item ${cssClass} ${hasSVG ? 'has-visual' : 'text-only'}">
                ${hasSVG ? `
                    <div class="concept-visual">
                        ${svgContent}
                    </div>
                ` : ''}
                <div class="concept-content">
                    <h4>${title}</h4>
                    <div class="concept-text">${content}</div>
                </div>
            </div>
        `;
    }
}

// ==================== 全局导出 ====================

// 导出到全局对象，便于其他文件使用
window.AIEC = {
    ErrorHandler,
    MessageHandler,
    StorageManager,
    UserManager,
    HttpManager,
    Utils
};

// 为了向后兼容，也导出常用的全局函数
window.showMessage = MessageHandler.show.bind(MessageHandler);
window.showSuccess = MessageHandler.success.bind(MessageHandler);
window.showError = MessageHandler.error.bind(MessageHandler);
window.showWarning = MessageHandler.warning.bind(MessageHandler);

console.log('✅ AIEC工具模块加载完成');