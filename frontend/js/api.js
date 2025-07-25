/**
 * AIEC 职场软技能应用 - API调用模块
 * 
 * 这个文件负责：
 * 1. 与后端AI服务通信
 * 2. 处理网络请求和错误
 * 3. 管理Loading状态
 * 4. 提供友好的错误提示
 */

class APIManager {
    constructor() {
        // 根据环境自动配置API基础URL
        this.baseURL = this.detectAPIBaseURL();
        this.timeout = 30000; // 30秒超时
        
        console.log('🔌 API Manager 初始化完成，服务地址:', this.baseURL);
        console.log('🔍 当前页面信息:', {
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            port: window.location.port,
            href: window.location.href
        });
    }
    
    /**
     * 自动检测API服务地址
     */
    detectAPIBaseURL() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // 处理file://协议（用户直接打开HTML文件）
        if (protocol === 'file:') {
            console.log('🔍 检测到file://协议，使用本地后端服务器');
            return 'http://localhost:3000';
        }
        
        // 生产环境（Zeabur或其他云服务）
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // 假设后端和前端部署在同一域名的不同端口或路径
            return `${protocol}//${hostname}:3000`;
        }
        
        // 本地开发环境
        return 'http://localhost:3000';
    }
    
    /**
     * 发送AI评分请求
     * @param {Object} requestData 包含用户回复和练习信息的数据
     * @returns {Promise<Object>} AI评分结果
     */
    async evaluateResponse(requestData) {
        console.log('📤 发送AI评分请求:', requestData);
        
        try {
            // 显示Loading状态
            this.showLoading('AI教练正在分析您的回复...');
            
            // 技能ID映射：前端skillId -> 后端skillId
            const skillIdMapping = {
                '2.1': 'closed-loop',
                '2.2': 'clarification', 
                '2.3': 'cross-department',
                '2.4': 'problem-solving',
                '2.5': 'time-management'
            };
            
            // 转换前端数据格式为后端API期望格式
            const backendData = {
                skillId: skillIdMapping[requestData.skillId] || 'closed-loop',
                step: requestData.stepNumber || 1,
                userAnswer: requestData.userResponse,
                scenarioContext: {
                    background: requestData.scenario?.description || '职场沟通练习场景',
                    task: requestData.stepDescription || requestData.stepTitle || '完成职场沟通任务'
                }
            };
            
            console.log('🔄 转换后的后端请求数据:', backendData);
            
            const response = await this.makeRequest('/api/ai/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendData)
            });
            
            console.log('📥 AI评分响应:', response);
            
            // 检查后端响应结构
            if (response.success && response.data) {
                // 验证响应数据格式
                this.validateAIResponse(response.data);
                return response.data;
            } else {
                throw new Error(response.message || 'AI评分服务返回错误');
            }
            
        } catch (error) {
            AIEC.ErrorHandler.handle(error, 'AI评分');
            throw error;
            
        } finally {
            // 隐藏Loading状态
            this.hideLoading();
        }
    }
    
    /**
     * 检查后端服务健康状态
     * @returns {Promise<boolean>} 服务是否可用
     */
    async checkHealth() {
        try {
            const response = await this.makeRequest('/api/health', {
                method: 'GET',
                timeout: 5000 // 5秒快速检查
            });
            
            console.log('✅ 后端服务状态正常');
            return true;
            
        } catch (error) {
            console.warn('⚠️ 后端服务连接失败:', error.message);
            return false;
        }
    }
    
    /**
     * 通用HTTP请求方法
     * @param {string} endpoint API端点
     * @param {Object} options 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        console.log('🚀 发送HTTP请求:', {
            url: url,
            method: options.method || 'GET',
            baseURL: this.baseURL,
            endpoint: endpoint
        });
        
        try {
            const data = await AIEC.HttpManager.request(url, {
                ...options,
                timeout: options.timeout || this.timeout
            });
            
            console.log('📦 收到HTTP响应:', data);
            return data;
            
        } catch (error) {
            console.error('💥 HTTP请求失败:', {
                url: url,
                error: error.message,
                name: error.name
            });
            throw error;
        }
    }
    
    /**
     * 验证AI响应数据格式
     * @param {Object} response AI服务的响应
     */
    validateAIResponse(response) {
        const required = ['totalScore', 'dimensions', 'feedback'];
        
        for (const field of required) {
            if (!(field in response)) {
                throw new Error(`AI响应缺少必要字段: ${field}`);
            }
        }
        
        // 验证评分范围
        if (response.totalScore < 0 || response.totalScore > 100) {
            throw new Error('AI评分超出有效范围 (0-100)');
        }
        
        // 验证四维度评分
        const dimensions = response.dimensions;
        const dimensionNames = ['timeliness', 'completeness', 'professionalism', 'proactiveness'];
        
        for (const dim of dimensionNames) {
            if (!(dim in dimensions) || dimensions[dim] < 0 || dimensions[dim] > 25) {
                throw new Error(`维度评分无效: ${dim}`);
            }
        }
    }
    
    /**
     * 处理API错误
     * @param {Error} error 错误对象
     */
    handleAPIError(error) {
        console.error('❌ AI服务连接失败:', error);
        
        // 根据错误类型提供不同的提示
        let userMessage = '';
        let solutions = [];
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            userMessage = '🔌 无法连接到AI服务器';
            solutions = [
                '请确保后端服务器已启动（在backend文件夹运行: npm start）',
                '检查服务器地址是否正确：' + this.baseURL,
                '确认网络连接正常'
            ];
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
            userMessage = '⏱️ AI分析请求超时';
            solutions = [
                '请检查网络连接',
                '稍后重试',
                '如果问题持续，请刷新页面'
            ];
        } else if (error.message.includes('CORS')) {
            userMessage = '🚫 跨域请求被阻止';
            solutions = [
                '请使用HTTP服务器访问页面，而不是直接打开HTML文件',
                '建议在frontend文件夹运行: python3 -m http.server 8080',
                '然后访问: http://localhost:8080'
            ];
        } else {
            userMessage = '❌ AI服务暂时不可用';
            solutions = [
                '已自动切换到本地评估模式',
                '如需AI分析，请检查后端服务'
            ];
        }
        
                // 显示详细的错误提示
        this.showDetailedErrorMessage(userMessage, solutions, error);
        
        // 直接抛出错误，不再提供降级方案
        throw new Error('AI不在线，稍后再试');
    }

    /**
     * 显示详细错误提示信息
     * @param {string} userMessage 用户友好的错误信息
     * @param {Array} solutions 解决方案列表
     * @param {Error} error 原始错误对象
     */
    showDetailedErrorMessage(userMessage, solutions, error) {
        // 创建详细错误提示界面
        const solutionsHTML = solutions.map(solution => 
            `<li class="solution-item">💡 ${solution}</li>`
        ).join('');
        
        const errorHTML = `
            <div class="error-container">
                <div class="error-icon">🤖</div>
                <div class="error-content">
                    <h4>${userMessage}</h4>
                    <div class="error-solutions">
                        <p><strong>解决方案：</strong></p>
                        <ul class="solutions-list">
                            ${solutionsHTML}
                        </ul>
                    </div>
                    <details class="error-details">
                        <summary>技术详情</summary>
                        <p class="error-detail">${error.message}</p>
                        <p class="api-url">API地址: ${this.baseURL}</p>
                    </details>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="retry-btn">
                            🔄 刷新页面
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">
                            知道了
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加错误提示样式
        this.addErrorStyles();
        
        // 显示错误提示
        const container = document.createElement('div');
        container.className = 'api-error-overlay';
        container.innerHTML = errorHTML;
        document.body.appendChild(container);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (container.parentNode) {
                container.remove();
            }
        }, 15000);
    }

    /**
     * 添加错误提示样式
     */
    addErrorStyles() {
        if (document.getElementById('api-error-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'api-error-styles';
        style.textContent = `
            .api-error-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                backdrop-filter: blur(4px);
            }
            
            .error-container {
                background: white;
                padding: 24px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .error-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 16px;
            }
            
            .error-content h4 {
                color: #333;
                margin: 0 0 16px 0;
                font-size: 18px;
                text-align: center;
            }
            
            .error-solutions {
                margin: 16px 0;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #007AFF;
            }
            
            .solutions-list {
                margin: 8px 0;
                padding-left: 0;
                list-style: none;
            }
            
            .solution-item {
                margin: 8px 0;
                padding: 8px;
                background: white;
                border-radius: 6px;
                border: 1px solid #e9ecef;
            }
            
            .error-details {
                margin: 16px 0;
                padding: 12px;
                background: #f1f3f4;
                border-radius: 6px;
            }
            
            .error-details summary {
                cursor: pointer;
                font-weight: 500;
                color: #666;
            }
            
            .error-detail, .api-url {
                margin: 8px 0;
                font-family: monospace;
                font-size: 12px;
                color: #666;
                word-break: break-all;
            }
            
            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .retry-btn, .close-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .retry-btn {
                background: #007AFF;
                color: white;
            }
            
            .retry-btn:hover {
                background: #0056CC;
            }
            
            .close-btn {
                background: #6c757d;
                color: white;
            }
            
            .close-btn:hover {
                background: #5a6268;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 显示Loading状态
     * @param {string} message 加载提示信息
     */
    showLoading(message = 'AI分析中...') {
        // 移除已存在的loading
        this.hideLoading();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'api-loading';
        loadingDiv.className = 'ai-loading-overlay';
        loadingDiv.innerHTML = `
            <div class="ai-loading-content">
                <div class="ai-loading-spinner"></div>
                <div class="ai-loading-text">${message}</div>
                <div class="ai-loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加CSS样式
        this.addLoadingStyles();
        
        document.body.appendChild(loadingDiv);
        
        // 启动进度条动画
        setTimeout(() => {
            const progressFill = loadingDiv.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
        }, 100);
    }
    
    /**
     * 隐藏Loading状态
     */
    hideLoading() {
        const loading = document.getElementById('api-loading');
        if (loading) {
            loading.remove();
        }
    }
    
    /**
     * 添加Loading样式
     */
    addLoadingStyles() {
        if (document.getElementById('api-loading-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'api-loading-styles';
        style.textContent = `
            .ai-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            
            .ai-loading-content {
                background: white;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 300px;
                width: 90%;
            }
            
            .ai-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #007AFF;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .ai-loading-text {
                font-size: 16px;
                color: #333;
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .ai-loading-progress .progress-bar {
                width: 100%;
                height: 4px;
                background: #f0f0f0;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .ai-loading-progress .progress-fill {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #007AFF, #34C759);
                border-radius: 2px;
                transition: width 3s ease-out;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 显示错误提示信息
     * @param {Error} error 错误对象
     */
    showErrorMessage(error) {
        const message = 'AI不在线，稍后再试';
        
        // 使用现有的showMessage函数显示提示
        if (typeof showMessage === 'function') {
            showMessage(message, 'error');
        } else {
            console.warn('提示:', message);
        }
    }
}

// 创建全局API管理器实例
window.apiManager = new APIManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIManager;
} 