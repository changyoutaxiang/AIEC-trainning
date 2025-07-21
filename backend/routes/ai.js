/**
 * AIEC 七个习惯系统 - AI 相关路由
 * 
 * 提供 AI 功能的 HTTP 接口
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// 基础聊天接口
router.post('/chat', async (req, res) => {
    try {
        const { message, messageHistory = [], options = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: '消息内容不能为空'
            });
        }

        const response = await aiService.chat(message, messageHistory, options);
        
        res.json({
            success: true,
            data: {
                response: response,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('聊天接口错误:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 实战模拟评估接口
router.post('/evaluate-practice', async (req, res) => {
    try {
        const { userInput, scenario, evaluationDimensions } = req.body;
        
        if (!userInput || !scenario || !evaluationDimensions) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：userInput, scenario, evaluationDimensions'
            });
        }

        const evaluation = await aiService.evaluatePracticeResponse(
            userInput, 
            scenario, 
            evaluationDimensions
        );
        
        res.json({
            success: true,
            data: {
                evaluation: evaluation,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('实战模拟评估错误:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 难题思辨引导接口
router.post('/guide-dilemma', async (req, res) => {
    try {
        const { dilemma, userThought, conversationHistory = [] } = req.body;
        
        if (!dilemma || !userThought) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：dilemma, userThought'
            });
        }

        const guidance = await aiService.guideDilemmaDiscussion(
            dilemma, 
            userThought, 
            conversationHistory
        );
        
        res.json({
            success: true,
            data: {
                guidance: guidance,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('难题思辨引导错误:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 生成学习总结接口
router.post('/generate-summary', async (req, res) => {
    try {
        const { learningData } = req.body;
        
        if (!learningData) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：learningData'
            });
        }

        const summary = await aiService.generateLearningSummary(learningData);
        
        res.json({
            success: true,
            data: {
                summary: summary,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('学习总结生成错误:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// AI 服务健康检查
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await aiService.healthCheck();
        
        res.json({
            success: true,
            data: {
                healthy: isHealthy,
                timestamp: new Date().toISOString(),
                message: isHealthy ? 'AI 服务正常' : 'AI 服务异常'
            }
        });
    } catch (error) {
        console.error('AI 健康检查错误:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 