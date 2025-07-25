#!/usr/bin/env node

/**
 * 场景内容快速更新工具
 * 专门用于从MD文件中提取并更新场景描述
 */

const fs = require('fs');
const path = require('path');

class ScenarioUpdater {
    constructor() {
        this.mdFile = path.join(__dirname, '../内容生产专用文件夹/习惯一：积极主动/训练单元 1.1：积极主动 _ 训练单元1.1：责任感 (Ownership).md');
        this.jsonFile = path.join(__dirname, '../frontend/content/seven_habits.json');
    }

    /**
     * 从MD文件中提取场景描述
     */
    extractScenarios() {
        const content = fs.readFileSync(this.mdFile, 'utf8');
        const scenarios = [];
        
        // 匹配练习内容的正则表达式
        const practiceRegex = /####\s+\*\*3\.(\d+)\s+练习\s+1\.1\.(\d+)：([^*]+)\*\*([\s\S]*?)(?=####|\n### )/g;
        let match;
        
        while ((match = practiceRegex.exec(content)) !== null) {
            const practiceNum = match[2];
            const title = match[3].trim();
            const practiceContent = match[4];
            
            // 提取场景设定
            const scenarioMatch = practiceContent.match(/\*\s*\*\*场景设定：\*\*\s*([^*]+?)(?=\s*\*\s*\*\*|$)/s);
            
            if (scenarioMatch) {
                const scenario = scenarioMatch[1].trim().replace(/\s+/g, ' ');
                scenarios.push({
                    practiceId: `practice_1_1_${practiceNum}`,
                    title: title,
                    scenario: scenario
                });
            }
        }
        
        return scenarios;
    }

    /**
     * 更新JSON文件中的场景描述
     */
    updateJSON(scenarios) {
        // 读取现有JSON
        const jsonData = JSON.parse(fs.readFileSync(this.jsonFile, 'utf8'));
        
        // 更新场景描述
        const practiceArena = jsonData.habits?.habit_1?.units?.unit_1_1?.sections?.practice_arena;
        
        if (!practiceArena) {
            throw new Error('❌ JSON文件结构不正确，找不到 practice_arena');
        }
        
        let updatedCount = 0;
        scenarios.forEach(scenarioData => {
            const practice = practiceArena.find(p => p.practiceId === scenarioData.practiceId);
            if (practice) {
                if (practice.scenario !== scenarioData.scenario) {
                    console.log(`🔄 更新 ${scenarioData.practiceId}: ${scenarioData.title}`);
                    console.log(`   旧: ${practice.scenario.substring(0, 50)}...`);
                    console.log(`   新: ${scenarioData.scenario.substring(0, 50)}...`);
                    practice.scenario = scenarioData.scenario;
                    updatedCount++;
                } else {
                    console.log(`✅ ${scenarioData.practiceId} 内容已是最新`);
                }
            }
        });
        
        if (updatedCount > 0) {
            // 更新时间戳
            if (jsonData.metadata) {
                jsonData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
                jsonData.metadata.lastScenarioUpdate = new Date().toISOString();
            }
            
            // 写回文件
            fs.writeFileSync(this.jsonFile, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`✅ 已更新 ${updatedCount} 个场景描述`);
        } else {
            console.log('ℹ️  所有场景内容都是最新的，无需更新');
        }
        
        return updatedCount;
    }

    /**
     * 执行更新
     */
    run() {
        console.log('🎯 场景内容更新工具');
        console.log(`📖 MD文件: ${this.mdFile}`);
        console.log(`📝 JSON文件: ${this.jsonFile}`);
        
        try {
            // 检查文件是否存在
            if (!fs.existsSync(this.mdFile)) {
                throw new Error(`❌ MD文件不存在: ${this.mdFile}`);
            }
            if (!fs.existsSync(this.jsonFile)) {
                throw new Error(`❌ JSON文件不存在: ${this.jsonFile}`);
            }
            
            // 提取场景描述
            console.log('🔍 从MD文件中提取场景描述...');
            const scenarios = this.extractScenarios();
            console.log(`📝 提取到 ${scenarios.length} 个场景`);
            
            // 更新JSON文件
            console.log('🔄 更新JSON文件...');
            const updatedCount = this.updateJSON(scenarios);
            
            console.log('🎉 更新完成！');
            
            if (updatedCount > 0) {
                console.log('💡 提示: 请刷新浏览器页面查看更新效果');
            }
            
        } catch (error) {
            console.error('❌ 更新失败:', error.message);
            process.exit(1);
        }
    }
}

// 执行更新
if (require.main === module) {
    const updater = new ScenarioUpdater();
    updater.run();
}

module.exports = ScenarioUpdater;