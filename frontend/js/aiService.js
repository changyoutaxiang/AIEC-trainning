/**
 * AIEC 七个习惯系统 - 前端 AI 服务
 * 
 * 封装与后端 AI API 的交互
 */

class FrontendAIService {
    constructor() {
        this.baseURL = '/api/ai';
        this.defaultTimeout = 30000; // 30秒超时
    }

    /**
     * 基础HTTP请求封装
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} API响应
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.method !== 'GET' && options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * 基础聊天功能
     * @param {string} message - 用户消息
     * @param {Array} messageHistory - 消息历史
     * @param {Object} options - 额外选项
     * @returns {Promise<string>} AI回复
     */
    async chat(message, messageHistory = [], options = {}) {
        try {
            const response = await this.makeRequest('/chat', {
                method: 'POST',
                body: {
                    message,
                    messageHistory,
                    options
                }
            });

            return response.data.response;
        } catch (error) {
            throw new Error(`聊天失败: ${error.message}`);
        }
    }

    /**
     * 实战模拟评估
     * @param {string} userInput - 用户输入
     * @param {string} scenario - 场景描述
     * @param {Array} evaluationDimensions - 评估维度
     * @returns {Promise<Object>} 评估结果
     */
    async evaluatePracticeResponse(userInput, scenario, evaluationDimensions) {
        try {
            const response = await this.makeRequest('/evaluate-practice', {
                method: 'POST',
                body: {
                    userInput,
                    scenario,
                    evaluationDimensions
                }
            });

            return response.data.evaluation;
        } catch (error) {
            throw new Error(`评估失败: ${error.message}`);
        }
    }

    /**
     * 难题思辨引导
     * @param {Object} dilemma - 难题信息
     * @param {string} userThought - 用户想法
     * @param {Array} conversationHistory - 对话历史
     * @returns {Promise<string>} AI引导回复
     */
    async guideDilemmaDiscussion(dilemma, userThought, conversationHistory = []) {
        try {
            const response = await this.makeRequest('/guide-dilemma', {
                method: 'POST',
                body: {
                    dilemma,
                    userThought,
                    conversationHistory
                }
            });

            return response.data.guidance;
        } catch (error) {
            throw new Error(`引导失败: ${error.message}`);
        }
    }

    /**
     * 生成学习总结
     * @param {Object} learningData - 学习数据
     * @returns {Promise<string>} 学习总结
     */
    async generateLearningSummary(learningData) {
        try {
            const response = await this.makeRequest('/generate-summary', {
                method: 'POST',
                body: {
                    learningData
                }
            });

            return response.data.summary;
        } catch (error) {
            throw new Error(`总结生成失败: ${error.message}`);
        }
    }

    /**
     * AI服务健康检查
     * @returns {Promise<boolean>} 服务是否健康
     */
    async healthCheck() {
        try {
            const response = await this.makeRequest('/health');
            return response.data.healthy;
        } catch (error) {
            console.error('AI健康检查失败:', error);
            return false;
        }
    }
}

// 创建全局实例
const frontendAIService = new FrontendAIService();

// 聊天会话管理
class ChatSession {
    constructor() {
        this.messages = [];
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addMessage(role, content) {
        const message = {
            role,
            content,
            timestamp: new Date().toISOString()
        };
        this.messages.push(message);
        return message;
    }

    getHistory() {
        return this.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    clear() {
        this.messages = [];
        this.sessionId = this.generateSessionId();
    }
}

// 实战模拟管理器
class PracticeManager {
    constructor() {
        this.currentPractice = null;
        this.userResponse = '';
        this.evaluation = null;
    }

    startPractice(practiceData) {
        this.currentPractice = practiceData;
        this.userResponse = '';
        this.evaluation = null;
    }

    async submitResponse(userInput) {
        if (!this.currentPractice) {
            throw new Error('没有正在进行的实战模拟');
        }

        this.userResponse = userInput;
        
        try {
            this.evaluation = await frontendAIService.evaluatePracticeResponse(
                userInput,
                this.currentPractice.scenario,
                this.currentPractice.evaluationDimensions
            );
            
            return this.evaluation;
        } catch (error) {
            throw new Error(`提交回复失败: ${error.message}`);
        }
    }

    getResults() {
        return {
            practice: this.currentPractice,
            response: this.userResponse,
            evaluation: this.evaluation
        };
    }
}

// 难题思辨管理器
class DilemmaManager {
    constructor() {
        this.currentDilemma = null;
        this.session = new ChatSession();
    }

    startDilemma(dilemmaData) {
        this.currentDilemma = dilemmaData;
        this.session.clear();
    }

    async submitThought(userThought) {
        if (!this.currentDilemma) {
            throw new Error('没有正在进行的难题思辨');
        }

        // 添加用户消息到会话
        this.session.addMessage('user', userThought);

        try {
            const guidance = await frontendAIService.guideDilemmaDiscussion(
                this.currentDilemma,
                userThought,
                this.session.getHistory()
            );

            // 添加AI回复到会话
            this.session.addMessage('assistant', guidance);

            return guidance;
        } catch (error) {
            throw new Error(`提交想法失败: ${error.message}`);
        }
    }

    getConversationHistory() {
        return this.session.messages;
    }
}

// 导出全局实例
window.frontendAIService = frontendAIService;
window.ChatSession = ChatSession;
window.PracticeManager = PracticeManager;
window.DilemmaManager = DilemmaManager; 