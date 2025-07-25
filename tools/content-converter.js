#!/usr/bin/env node

/**
 * AIEC 内容管理工具
 * 将 Markdown 源文件转换为 JSON 格式
 * 
 * 使用方法：
 * node content-converter.js [选项]
 * 
 * 选项：
 * --input <path>   指定输入的MD文件目录 (默认: 内容生产专用文件夹)
 * --output <path>  指定输出的JSON文件路径 (默认: frontend/content/seven_habits.json)
 * --habit <number> 只转换指定习惯的内容 (1-7)
 * --dry-run       预览模式，不实际写入文件
 * --help          显示帮助信息
 */

const fs = require('fs');
const path = require('path');

class ContentConverter {
    constructor() {
        this.inputDir = path.join(__dirname, '../内容生产专用文件夹');
        this.outputFile = path.join(__dirname, '../frontend/content/seven_habits.json');
        this.dryRun = false;
        this.habitFilter = null;
    }

    /**
     * 解析命令行参数
     */
    parseArgs(args) {
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '--input':
                    this.inputDir = args[++i];
                    break;
                case '--output':
                    this.outputFile = args[++i];
                    break;
                case '--habit':
                    this.habitFilter = parseInt(args[++i]);
                    break;
                case '--dry-run':
                    this.dryRun = true;
                    break;
                case '--help':
                    this.showHelp();
                    return false;
                default:
                    if (args[i].startsWith('--')) {
                        console.error(`❌ 未知选项: ${args[i]}`);
                        return false;
                    }
            }
        }
        return true;
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
🔧 AIEC 内容管理工具 - MD转JSON转换器

📖 使用方法:
  node content-converter.js [选项]

⚙️  选项:
  --input <path>   指定输入的MD文件目录
  --output <path>  指定输出的JSON文件路径  
  --habit <number> 只转换指定习惯的内容 (1-7)
  --dry-run       预览模式，不实际写入文件
  --help          显示此帮助信息

📝 示例:
  node content-converter.js                    # 转换所有内容
  node content-converter.js --habit 1          # 只转换习惯1
  node content-converter.js --dry-run          # 预览模式
        `);
    }

    /**
     * 解析MD文件中的练习内容
     */
    parsePracticeContent(content) {
        const practices = [];
        
        // 匹配练习标题和内容的正则表达式
        const practiceRegex = /####\s+\*\*3\.(\d+)\s+练习\s+1\.1\.(\d+)：([^*]+)\*\*/g;
        const practiceMatches = [...content.matchAll(practiceRegex)];
        
        practiceMatches.forEach((match, index) => {
            const practiceNum = match[2];
            const title = match[3].trim();
            
            // 获取该练习的完整内容块
            const startIndex = match.index;
            const nextMatch = practiceMatches[index + 1];
            const endIndex = nextMatch ? nextMatch.index : content.indexOf('### **第四步：应用难题');
            
            const practiceContent = content.substring(startIndex, endIndex);
            
            // 解析各个字段
            const scenario = this.extractField(practiceContent, '场景设定');
            const task = this.extractField(practiceContent, '任务要求');
            const evaluationDimensions = this.extractEvaluationDimensions(practiceContent);
            
            if (scenario && task && evaluationDimensions.length > 0) {
                practices.push({
                    practiceId: `practice_1_1_${practiceNum}`,
                    title: title,
                    scenario: scenario,
                    task: task,
                    evaluationDimensions: evaluationDimensions
                });
            }
        });
        
        return practices;
    }

    /**
     * 提取指定字段的内容
     */
    extractField(content, fieldName) {
        const regex = new RegExp(`\\*\\s*\\*\\*${fieldName}：\\*\\*\\s*([^*]+?)(?=\\s*\\*\\s*\\*\\*|$)`, 's');
        const match = content.match(regex);
        return match ? match[1].trim().replace(/\\s+/g, ' ') : null;
    }

    /**
     * 提取评估维度
     */
    extractEvaluationDimensions(content) {
        const dimensions = [];
        const dimensionRegex = /\d+\.\s+\*\*([^:]+?)(?:\s+\([^)]+\))?:\*\*/g;
        let match;
        
        while ((match = dimensionRegex.exec(content)) !== null) {
            dimensions.push(match[1].trim());
        }
        
        return dimensions;
    }

    /**
     * 转换习惯1的内容
     */
    convertHabit1() {
        const habit1File = path.join(this.inputDir, '习惯一：积极主动', '训练单元 1.1：积极主动 _ 训练单元1.1：责任感 (Ownership).md');
        
        if (!fs.existsSync(habit1File)) {
            throw new Error(`❌ 文件不存在: ${habit1File}`);
        }
        
        const content = fs.readFileSync(habit1File, 'utf8');
        const practices = this.parsePracticeContent(content);
        
        console.log(`📝 解析习惯1练习: 找到 ${practices.length} 个练习`);
        practices.forEach(practice => {
            console.log(`  - ${practice.practiceId}: ${practice.title}`);
        });
        
        // 构建习惯1的JSON结构
        const habit1Data = {
            habitId: "habit_1",
            habitName: "积极主动",
            habitNameEn: "Be Proactive",
            description: "从被动响应者到主动价值创造者的关键身份转变",
            corePhilosophy: "在外部刺激和我们的回应之间，存在一个空间，这个空间里有我们选择回应方式的权利与自由",
            status: "available",
            prerequisite: null,
            estimatedTime: "4-6周",
            units: {
                unit_1_1: {
                    unitId: "unit_1_1",
                    unitName: "责任感 (Ownership)",
                    subtitle: "问题到我为止",
                    description: "深刻理解责任感的内核，将问题解决从推诿转向承担",
                    sections: {
                        why_it_matters: {
                            professional: "责任感是积极主动这一习惯的内核。它要求我们对自己的行为、选择及其产生的结果，承担起100%的责任。",
                            simple: "简单来说，责任感就是一种'这事儿我兜了'的心态。"
                        },
                        leon_perspective: {
                            videoTitle: "Leon 谈责任感：我职业生涯中最重要的一堂课",
                            videoDescription: "在这段视频中，我将与大家分享我个人关于责任感的几点真实体会..."
                        },
                        practice_arena: practices
                    }
                }
                // TODO: 添加其他训练单元 (unit_1_2, unit_1_3, unit_1_4)
            }
        };
        
        return habit1Data;
    }

    /**
     * 执行转换
     */
    async convert() {
        console.log('🚀 AIEC 内容转换器启动');
        console.log(`📁 输入目录: ${this.inputDir}`);
        console.log(`📄 输出文件: ${this.outputFile}`);
        
        if (this.dryRun) {
            console.log('🔍 预览模式 (不会实际写入文件)');
        }
        
        try {
            // 读取现有的JSON文件作为基础
            let existingData = {};
            if (fs.existsSync(this.outputFile)) {
                const existingContent = fs.readFileSync(this.outputFile, 'utf8');
                existingData = JSON.parse(existingContent);
                console.log('📖 读取现有JSON文件');
            }
            
            // 转换内容
            const updatedData = { ...existingData };
            
            if (!this.habitFilter || this.habitFilter === 1) {
                console.log('🔄 转换习惯1内容...');
                const habit1Data = this.convertHabit1();
                if (!updatedData.habits) updatedData.habits = {};
                updatedData.habits.habit_1 = habit1Data;
            }
            
            // 更新元数据
            updatedData.metadata = {
                version: "1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                description: "AIEC七个习惯培训体系内容库",
                totalHabits: 7,
                totalUnits: 21,
                lastConversion: new Date().toISOString()
            };
            
            if (!this.dryRun) {
                // 确保输出目录存在
                const outputDir = path.dirname(this.outputFile);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                // 写入文件
                fs.writeFileSync(this.outputFile, JSON.stringify(updatedData, null, 2), 'utf8');
                console.log('✅ 转换完成！');
                console.log(`📝 已写入: ${this.outputFile}`);
            } else {
                console.log('🔍 预览结果:');
                console.log(JSON.stringify(updatedData.habits?.habit_1?.units?.unit_1_1?.sections?.practice_arena, null, 2));
            }
            
        } catch (error) {
            console.error('❌ 转换失败:', error.message);
            process.exit(1);
        }
    }
}

// 主程序
if (require.main === module) {
    const converter = new ContentConverter();
    
    if (converter.parseArgs(process.argv.slice(2))) {
        converter.convert().catch(error => {
            console.error('❌ 程序错误:', error);
            process.exit(1);
        });
    }
}

module.exports = ContentConverter;