/**
 * AIEC 七个习惯系统 - AI 服务封装
 * 
 * 封装 OpenRouter API 调用，提供统一的 AI 交互接口
 */

const axios = require('axios');
const config = require('../config/config');

class AIService {
    constructor() {
        this.baseUrl = config.openRouter.baseUrl;
        this.apiKey = config.openRouter.apiKey;
        this.model = config.openRouter.model;
        this.timeout = config.openRouter.timeout;
        this.maxRetries = config.openRouter.maxRetries;
        this.retryDelay = config.openRouter.retryDelay;
        
        // 初始化 axios 实例
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': config.openRouter.headers['HTTP-Referer'],
                'X-Title': config.openRouter.headers['X-Title']
            }
        });
    }

    /**
     * 基础的 AI 聊天调用
     * @param {string} message - 用户消息
     * @param {Array} messageHistory - 消息历史 (可选)
     * @param {Object} options - 额外配置选项
     * @returns {Promise<string>} AI 回复
     */
    async chat(message, messageHistory = [], options = {}) {
        const messages = [
            ...messageHistory,
            { role: 'user', content: message }
        ];

        const requestData = {
            model: options.model || this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000,
            top_p: options.topP || 0.9,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0
        };

        try {
            const response = await this.makeRequest('/chat/completions', requestData);
            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI 聊天调用失败:', error.message);
            throw error;
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
        const prompt = `
你是一位专业的职场软技能导师，请评估学员在以下场景中的回复：

**场景背景：**
${scenario}

**学员回复：**
${userInput}

**评估维度：**
${evaluationDimensions.join(', ')}

请按以下格式返回评估结果（使用JSON格式）：
{
  "overallScore": 8.5,
  "dimensionScores": {
    "${evaluationDimensions[0]}": 8,
    "${evaluationDimensions[1]}": 9,
    "${evaluationDimensions[2]}": 8
  },
  "feedback": "整体表现不错，在承担责任方面表现突出...",
  "improvements": [
    "建议在表达时更加直接和具体",
    "可以提供更多的解决方案"
  ],
  "highlights": [
    "很好地承担了责任",
    "表达态度积极主动"
  ]
}

请确保返回的是有效的JSON格式，分数范围为1-10分。
        `;

        try {
            const response = await this.chat(prompt, [], {
                temperature: 0.3, // 较低温度确保一致性
                maxTokens: 800
            });
            
            // 解析JSON响应
            const evaluation = JSON.parse(response);
            return evaluation;
        } catch (error) {
            console.error('实战模拟评估失败:', error.message);
            throw new Error(`评估失败: ${error.message}`);
        }
    }

    /**
     * 难题思辨引导
     * @param {Object} dilemma - 难题信息
     * @param {string} userThought - 用户想法
     * @param {Array} conversationHistory - 对话历史
     * @returns {Promise<string>} AI 引导回复
     */
    async guideDilemmaDiscussion(dilemma, userThought, conversationHistory = []) {
        const systemPrompt = `
你是一位采用苏格拉底式教学法的职场导师。你的任务是通过提问引导学员深入思考，而不是直接给出答案。

**当前讨论的难题：**
${dilemma.question}

**指导逻辑：**
${dilemma.coachingLogic}

**引导原则：**
1. 提出开放性问题，引发深层思考
2. 不要直接给出答案，而是启发学员自己得出结论
3. 关注学员的思维过程，而非答案本身
4. 保持温和、鼓励的语调
5. 每次回复1-2个精心设计的问题

请基于学员的想法，提出引导性问题。
        `;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userThought }
        ];

        try {
            const response = await this.chat(userThought, messages, {
                temperature: 0.8, // 稍高温度增加创造性
                maxTokens: 600
            });
            
            return response;
        } catch (error) {
            console.error('难题思辨引导失败:', error.message);
            throw new Error(`引导失败: ${error.message}`);
        }
    }

    /**
     * 生成学习总结
     * @param {Object} learningData - 学习数据
     * @returns {Promise<string>} 学习总结
     */
    async generateLearningSummary(learningData) {
        const prompt = `
请为学员生成一份个性化的学习总结：

**学习内容：**
${learningData.habitName} - ${learningData.description}

**学习成果：**
- 完成的训练单元：${learningData.completedUnits}
- 实战模拟得分：${learningData.practiceScores}
- 思辨讨论参与：${learningData.dilemmaParticipation}

请生成一份鼓励性的学习总结，包含：
1. 主要收获
2. 表现亮点
3. 后续建议
4. 激励话语

语调要温暖、专业，篇幅控制在200-300字。
        `;

        try {
            const response = await this.chat(prompt, [], {
                temperature: 0.6,
                maxTokens: 500
            });
            
            return response;
        } catch (error) {
            console.error('学习总结生成失败:', error.message);
            throw new Error(`总结生成失败: ${error.message}`);
        }
    }

    /**
     * 带重试的 API 请求
     * @param {string} endpoint - API 端点
     * @param {Object} data - 请求数据
     * @param {number} retryCount - 当前重试次数
     * @returns {Promise<Object>} API 响应
     */
    async makeRequest(endpoint, data, retryCount = 0) {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;
        } catch (error) {
            // 记录错误
            console.error(`API 请求失败 (尝试 ${retryCount + 1}/${this.maxRetries + 1}):`, error.message);
            
            // 判断是否需要重试
            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                console.log(`${this.retryDelay}ms 后重试...`);
                await this.delay(this.retryDelay);
                return this.makeRequest(endpoint, data, retryCount + 1);
            }
            
            // 抛出格式化错误
            throw this.formatError(error);
        }
    }

    /**
     * 判断是否应该重试
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否重试
     */
    shouldRetry(error) {
        // 网络错误或服务器错误可以重试
        if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
            return true;
        }
        
        // HTTP 状态码 500+ 可以重试
        if (error.response && error.response.status >= 500) {
            return true;
        }
        
        // 429 限流错误可以重试
        if (error.response && error.response.status === 429) {
            return true;
        }
        
        return false;
    }

    /**
     * 格式化错误信息
     * @param {Error} error - 原始错误
     * @returns {Error} 格式化后的错误
     */
    formatError(error) {
        if (error.response) {
            // API 返回的错误
            const status = error.response.status;
            const message = error.response.data?.error?.message || error.message;
            
            switch (status) {
                case 401:
                    return new Error('API 密钥无效或已过期');
                case 429:
                    return new Error('API 调用频率超限，请稍后重试');
                case 500:
                    return new Error('AI 服务暂时不可用，请稍后重试');
                default:
                    return new Error(`AI 服务错误 (${status}): ${message}`);
            }
        } else if (error.code === 'ECONNABORTED') {
            return new Error('AI 服务响应超时，请重试');
        } else {
            return new Error(`网络错误: ${error.message}`);
        }
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} 延迟 Promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 健康检查
     * @returns {Promise<boolean>} 服务是否可用
     */
    async healthCheck() {
        try {
            const response = await this.chat('Hello', [], {
                maxTokens: 10,
                temperature: 0
            });
            
            return response && response.length > 0;
        } catch (error) {
            console.error('AI 服务健康检查失败:', error.message);
            return false;
        }
    }
}

module.exports = new AIService(); 