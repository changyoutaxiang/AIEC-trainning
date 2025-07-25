// 习惯学习页面的具体功能

// API基础URL配置 - 支持云端部署
function getAPIBaseURL() {
    // 云端部署时使用相对路径
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        return window.location.origin;
    }
    // 本地开发使用固定端口
    return 'http://localhost:3000';
}

const API_BASE = getAPIBaseURL();

let currentHabit = 1;
let currentModule = 'concept';
let progress = 0;
let habitData = null;
let currentPractice = null;
let practiceProgress = {
    completed: [],
    current: null
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('习惯学习页面加载完成');
    
    // 添加CSS动画
    if (!document.getElementById('pulseAnimation')) {
        const style = document.createElement('style');
        style.id = 'pulseAnimation';
        style.textContent = `
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(0, 122, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 检查身份验证
    const user = checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // 从URL参数获取习惯编号
    const urlParams = new URLSearchParams(window.location.search);
    const habitParam = urlParams.get('habit');
    
    if (habitParam) {
        currentHabit = parseInt(habitParam);
    }
    
    // 初始化页面
    initializeLearningPage();
    
    // 绑定模块切换事件
    bindModuleEvents();
});

async function initializeLearningPage() {
    console.log('初始化习惯', currentHabit, '的学习页面');
    
    try {
        // 加载习惯数据
        await loadHabitData(currentHabit);
        
        // 更新页面内容
        document.getElementById('habitNumber').textContent = currentHabit;
        document.getElementById('habitTitle').textContent = habitData.habitName;
        document.getElementById('habitSubtitle').textContent = habitData.description;
        
        // 加载具体内容
        loadModuleContent('concept').catch(error => {
            console.error('模块内容加载失败:', error);
        });
        
        // 更新进度
        updateProgress();
    } catch (error) {
        console.error('初始化学习页面失败:', error);
        
        // 尝试使用默认数据
        const fallbackData = getHabitData(currentHabit);
        // 转换为统一的数据结构
        habitData = {
            habitName: fallbackData.title,
            description: fallbackData.subtitle,
            corePhilosophy: "在外部刺激和我们的回应之间，存在一个空间，这个空间里有我们选择回应方式的权利与自由",
            units: {} // 空的units，这样不会报错
        };
        document.getElementById('habitNumber').textContent = currentHabit;
        document.getElementById('habitTitle').textContent = habitData.habitName;
        document.getElementById('habitSubtitle').textContent = habitData.description;
        
        console.log('使用默认习惯数据继续加载');
    }
}

async function loadHabitData(habitNumber) {
    try {
        console.log('开始加载习惯数据，习惯编号:', habitNumber);
        const response = await fetch('content/seven_habits.json');
        console.log('Fetch响应状态:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`无法加载习惯数据，状态码: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('JSON数据解析成功，数据结构:', Object.keys(data));
        
        const habitKey = `habit_${habitNumber}`;
        console.log('查找习惯键:', habitKey, '可用的习惯:', Object.keys(data.habits || {}));
        
        if (!data.habits || !data.habits[habitKey]) {
            throw new Error(`习惯 ${habitNumber} 的数据不存在`);
        }
        
        habitData = data.habits[habitKey];
        console.log('习惯数据加载成功:', habitData);
        console.log('习惯数据的units:', habitData.units ? Object.keys(habitData.units) : '无units');
        return habitData;
    } catch (error) {
        console.error('加载习惯数据失败:', error);
        throw error;
    }
}

function getHabitData(habitNumber) {
    const habitsData = {
        1: {
            title: '积极主动',
            subtitle: '掌握主动权，对自己的行为和选择负责',
            concept: `
                <h3>什么是积极主动？</h3>
                <p>积极主动是指在任何环境中都能够主动选择自己的回应方式，而不是被动地受环境影响。</p>
                
                <h3>核心原则</h3>
                <ul>
                    <li><strong>刺激与回应之间存在选择空间</strong> - 我们可以选择如何回应任何情况</li>
                    <li><strong>关注影响圈而非关注圈</strong> - 专注于我们能够控制和影响的事情</li>
                    <li><strong>成为变化的推动者</strong> - 主动创造机会，而不是等待机会</li>
                </ul>
                
                <h3>积极主动的表现</h3>
                <p>积极主动的人会说："我可以..."、"我选择..."、"我更愿意..."</p>
                <p>消极被动的人会说："我不能..."、"我必须..."、"如果..."</p>
            `,
            mentor: `
                <h3>Leon导师的经验分享</h3>
                <p>在我20多年的职场生涯中，我发现最成功的人都有一个共同特点：他们从不抱怨环境，而是主动适应和改变环境。</p>
                
                <h3>实际案例</h3>
                <div class="case-study">
                    <h4>案例1：项目延期危机</h4>
                    <p><strong>情况：</strong>项目因为外部因素面临延期风险</p>
                    <p><strong>消极回应：</strong>"这不是我的错，是客户需求变更导致的"</p>
                    <p><strong>积极回应：</strong>"我来分析一下哪些部分可以并行处理，如何重新安排优先级"</p>
                </div>
                
                <h3>实践建议</h3>
                <ol>
                    <li>每天早上问自己："今天我可以主动做什么来改善情况？"</li>
                    <li>遇到问题时，先思考解决方案，再讨论问题</li>
                    <li>定期审视自己的影响圈，持续扩大影响力</li>
                </ol>
            `,
            practice: `
                <h3>实战模拟练习</h3>
                <p>请选择一个你最近遇到的挑战性情况，运用积极主动的原则来重新分析和应对。</p>
                
                <div class="practice-exercise">
                    <h4>练习1：影响圈分析</h4>
                    <p>列出你当前工作中的3个主要挑战，对每个挑战分析：</p>
                    <ul>
                        <li>哪些因素在你的控制范围内？</li>
                        <li>哪些因素在你的影响范围内？</li>
                        <li>哪些因素超出了你的控制和影响范围？</li>
                    </ul>
                </div>
                
                <div class="practice-exercise">
                    <h4>练习2：语言转换</h4>
                    <p>将以下消极语言转换为积极语言：</p>
                    <ul>
                        <li>"我没有时间" → "这件事不是我的优先级"</li>
                        <li>"我必须这样做" → "我选择这样做"</li>
                        <li>"他让我很生气" → "我选择如何回应他的行为"</li>
                    </ul>
                </div>
                
                <div class="reflection">
                    <h4>反思问题</h4>
                    <p>1. 在过去的一周中，有哪些时候你表现出了积极主动？</p>
                    <p>2. 有哪些时候你表现得比较被动？如何改进？</p>
                    <p>3. 你的影响圈中最重要的三个领域是什么？</p>
                </div>
            `
        },
        2: {
            title: '以终为始',
            subtitle: '明确目标和价值观，以清晰的愿景指导日常行为',
            concept: `
                <h3>什么是以终为始？</h3>
                <p>以终为始意味着在做任何事情之前，先明确最终想要达到的目标和结果。</p>
                
                <h3>核心原则</h3>
                <ul>
                    <li><strong>愿景导向</strong> - 用清晰的愿景指导日常行为</li>
                    <li><strong>价值观驱动</strong> - 基于核心价值观做出决策</li>
                    <li><strong>目标明确</strong> - 设定具体、可衡量的目标</li>
                </ul>
            `,
            mentor: `
                <h3>Leon导师的经验分享</h3>
                <p>我见过太多人忙忙碌碌，但最终发现自己走错了方向。以终为始让我们避免在错误的道路上越走越远。</p>
            `,
            practice: `
                <h3>实战练习</h3>
                <p>制定你的个人使命宣言，明确你的核心价值观和长期目标。</p>
            `
        }
        // 可以继续添加其他习惯的数据...
    };
    
    return habitsData[habitNumber] || habitsData[1];
}

async function loadModuleContent(module) {
    console.log('加载模块内容:', module);
    
    // 隐藏所有内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // 显示当前模块内容
    const currentSection = document.getElementById(module + 'Content');
    if (currentSection) {
        currentSection.classList.remove('hidden');
        
        // 特殊处理实战模拟和应用难题模块
        if (module === 'practice') {
            loadPracticeModule();
        } else if (module === 'dilemma') {
            loadDilemmaModule();
        } else {
            // 加载其他模块的内容（理念导入、导师采撷等）
            await loadStaticModuleContent(module);
        }
    }
    
    // 更新模块卡片状态
    document.querySelectorAll('.module-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCard = document.querySelector(`[data-module="${module}"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
    
    currentModule = module;
    
    // 更新按钮状态
    updateModuleButtons();
}

async function loadStaticModuleContent(module) {
    // 为理念导入和导师采撷等模块加载静态内容
    console.log('加载静态模块内容:', module);
    console.log('habitData状态:', habitData ? '已加载' : '未加载');
    console.log('habitData.units状态:', habitData?.units ? Object.keys(habitData.units) : '无units');
    
    const textElement = document.getElementById(module + 'Text');
    if (!textElement) {
        console.error('找不到文本元素:', module + 'Text');
        return;
    }
    
    if (module === 'concept') {
        // 加载理念导入内容 - 展示所有训练单元的概念 (支持SVG)
        if (habitData.units) {
            // 先显示加载状态
            textElement.innerHTML = '<div class="loading-state">🎨 正在加载视觉内容...</div>';
            
            let conceptContent = '';
            
            // 加载核心哲学的SVG
            const corePhilosophySVGPath = window.AIEC.Utils.getConceptSVGPath(habitData.habitId, 'core-philosophy');
            const corePhilosophySVG = await window.AIEC.Utils.loadSVG(corePhilosophySVGPath);
            
            conceptContent += window.AIEC.Utils.createVisualContent(
                '核心哲学',
                `<p>${habitData.corePhilosophy}</p>`,
                corePhilosophySVG,
                'core-philosophy'
            );
            
            conceptContent += '<div class="units-section"><h3>训练单元概览</h3>';
            
            // 遍历所有训练单元，显示核心理念 (支持SVG)
            const units = Object.values(habitData.units);
            for (let index = 0; index < units.length; index++) {
                const unit = units[index];
                if (unit.sections && unit.sections.why_it_matters) {
                    // 构造单元SVG路径
                    const unitSVGPath = window.AIEC.Utils.getConceptSVGPath(habitData.habitId, unit.unitId);
                    const unitSVG = await window.AIEC.Utils.loadSVG(unitSVGPath);
                    
                    const unitContent = `
                        <p><strong>专业理解：</strong>${unit.sections.why_it_matters.professional}</p>
                        <p><strong>简单理解：</strong>${unit.sections.why_it_matters.simple}</p>
                    `;
                    
                    conceptContent += window.AIEC.Utils.createVisualContent(
                        `单元 ${index + 1}: ${unit.unitName}`,
                        unitContent,
                        unitSVG,
                        'unit-concept'
                    );
                }
            }
            
            conceptContent += '</div>';
            textElement.innerHTML = conceptContent;
            
            console.log('✅ 理念导入内容加载完成 (含SVG)');
        }
    } else if (module === 'mentor') {
        // 加载导师采撷内容 - 展示所有Leon的视频内容
        if (habitData.units) {
            let mentorContent = `
                <h3>Leon导师的经验分享</h3>
                <p>Leon导师将通过一系列视频，分享关于"积极主动"的实战经验和深度见解</p>
            `;
            
            // 遍历所有训练单元，显示Leon的视频内容
            Object.values(habitData.units).forEach((unit, index) => {
                if (unit.sections && unit.sections.leon_perspective) {
                    mentorContent += `
                        <div class="mentor-video-section" style="margin: 30px 0; padding: 20px; background: #fff8e1; border-radius: 12px; border-left: 4px solid #ffa726;">
                            <h4>视频 ${index + 1}: ${unit.sections.leon_perspective.videoTitle}</h4>
                            <p>${unit.sections.leon_perspective.videoDescription}</p>
                            <div class="mentor-video-placeholder" style="margin-top: 15px; padding: 20px; background: rgba(0,0,0,0.05); border-radius: 8px; text-align: center;">
                                <p>📹 视频内容将在这里展示</p>
                                <button class="btn btn-secondary btn-small" onclick="alert('视频功能开发中')">播放视频</button>
                            </div>
                        </div>
                    `;
                }
            });
            
            textElement.innerHTML = mentorContent;
        }
    }
}

function bindModuleEvents() {
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            loadModuleContent(module).catch(error => {
                console.error('模块内容加载失败:', error);
            });
        });
    });
}

function nextModule() {
    const modules = ['concept', 'mentor', 'practice', 'dilemma'];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex < modules.length - 1) {
        const nextModule = modules[currentIndex + 1];
        loadModuleContent(nextModule).catch(error => {
            console.error('模块内容加载失败:', error);
        });
        
        // 更新进度
        if (currentIndex === 0) {
            progress = 25; // 理念导入完成
        } else if (currentIndex === 1) {
            progress = 50; // 导师采撷完成
        } else if (currentIndex === 2) {
            progress = 75; // 实战模拟完成
        }
        updateProgress();
    } else if (currentIndex === modules.length - 1) {
        // 已经在应用难题中，检查完成学习
        checkAndCompleteHabit();
    }
}

function prevModule() {
    const modules = ['concept', 'mentor', 'practice', 'dilemma'];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex > 0) {
        const prevModule = modules[currentIndex - 1];
        loadModuleContent(prevModule).catch(error => {
            console.error('模块内容加载失败:', error);
        });
        
        // 更新进度
        progress = Math.max(progress - 33, 0);
        updateProgress();
    }
}

function checkAndCompleteHabit() {
    // 检查是否所有实战练习都已完成
    const allPractices = [];
    if (habitData && habitData.units) {
        Object.values(habitData.units).forEach(unit => {
            if (unit.sections && unit.sections.practice_arena) {
                allPractices.push(...unit.sections.practice_arena);
            }
        });
    }
    
    const completedCount = allPractices.filter(practice => 
        practiceProgress.completed.includes(practice.practiceId)
    ).length;
    
    console.log(`练习完成情况: ${completedCount}/${allPractices.length}`);
    
    if (completedCount === allPractices.length && allPractices.length > 0) {
        // 所有练习完成，真正完成学习
        completeHabit();
    } else {
        // 还有练习未完成
        
        // 检查是否当前在练习详情页面（practiceWorkspace可见）
        const practiceWorkspace = document.getElementById('practiceWorkspace');
        const practiceSelector = document.getElementById('practiceSelector');
        
        console.log('practiceWorkspace显示状态:', practiceWorkspace && !practiceWorkspace.classList.contains('hidden'));
        console.log('practiceSelector显示状态:', practiceSelector && !practiceSelector.classList.contains('hidden'));
        
        if (practiceWorkspace && !practiceWorkspace.classList.contains('hidden')) {
            // 当前在练习详情页面，返回练习列表
            console.log('当前在练习详情页面，返回练习列表');
            backToPracticeList();
            
            // 高亮显示未完成的练习
            setTimeout(() => {
                highlightIncompletesPractices();
            }, 300);
            
            // 简单提示
            alert(`还有 ${allPractices.length - completedCount} 个实战练习需要完成。已返回练习列表，请选择其他练习。`);
            
        } else {
            // 不在练习页面或在练习列表页面，确保在实战模拟模块并滚动到练习列表
            console.log('确保在实战模拟模块');
            
            if (currentModule !== 'practice') {
                loadModuleContent('practice').catch(error => {
                    console.error('模块内容加载失败:', error);
                });
            }
            
            // 滚动到练习列表并高亮
            setTimeout(() => {
                const practiceList = document.getElementById('practiceList');
                if (practiceList) {
                    practiceList.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center'
                    });
                    
                    setTimeout(() => {
                        highlightIncompletesPractices();
                    }, 500);
                }
            }, 200);
            
            alert(`还有 ${allPractices.length - completedCount} 个实战练习需要完成。请从列表中选择练习开始。`);
        }
    }
}

function completeHabit() {
    progress = 100;
    updateProgress();
    
    alert(`恭喜！你已经完成了习惯${currentHabit}的学习！包括理念导入、导师采撷和所有实战练习。`);
    
    // 保存学习进度到localStorage
    saveProgress();
    
    // 返回七个习惯页面
    window.location.href = 'seven-habits.html';
}

// 动态更新按钮文本
function updateModuleButtons() {
    const modules = ['concept', 'mentor', 'practice'];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex === modules.length - 1) {
        // 在实战模拟中，检查完成状态
        const allPractices = [];
        if (habitData && habitData.units) {
            Object.values(habitData.units).forEach(unit => {
                if (unit.sections && unit.sections.practice_arena) {
                    allPractices.push(...unit.sections.practice_arena);
                }
            });
        }
        
        const completedCount = allPractices.filter(practice => 
            practiceProgress.completed.includes(practice.practiceId)
        ).length;
        
        // 更新实战模拟的按钮
        const practiceButton = document.querySelector('#practiceContent .content-actions .btn-primary');
        if (practiceButton) {
            if (completedCount === allPractices.length && allPractices.length > 0) {
                practiceButton.textContent = '🎉 完成学习';
                practiceButton.onclick = () => completeHabit();
            } else {
                practiceButton.textContent = `继续练习 (${completedCount}/${allPractices.length})`;
                practiceButton.onclick = () => checkAndCompleteHabit();
            }
        }
    }
}

// 高亮显示未完成的练习
function highlightIncompletesPractices() {
    console.log('开始高亮未完成的练习');
    const practiceItems = document.querySelectorAll('.practice-item');
    console.log('找到练习项数量:', practiceItems.length);
    
    let highlightedCount = 0;
    practiceItems.forEach((item, index) => {
        // 检查是否有"开始练习"标签（未完成）
        const startTag = item.querySelector('span[style*="background: #007AFF"]');
        console.log(`练习项${index}:`, startTag ? '未完成' : '已完成');
        
        if (startTag) {
            highlightedCount++;
            console.log(`高亮练习项${index}`);
            
            // 添加更明显的高亮效果
            item.style.animation = 'pulse 1.5s ease-in-out infinite';
            item.style.border = '3px solid #007AFF';
            item.style.borderRadius = '12px';
            item.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
            item.style.transform = 'scale(1.02)';
            
            // 10秒后移除高亮
            setTimeout(() => {
                item.style.animation = '';
                item.style.border = '';
                item.style.borderRadius = '';
                item.style.backgroundColor = '';
                item.style.transform = '';
            }, 10000);
        }
    });
    
    console.log(`高亮了${highlightedCount}个未完成的练习`);
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = progress + '% 完成';
    }
}

function saveProgress() {
    const user = checkAuth();
    if (user) {
        const progressKey = `habit_${currentHabit}_progress`;
        StorageManager.set(progressKey, progress.toString());
    }
}

// checkAuth 函数现在使用 app.js 中的全局版本

// ==================== 实战模拟功能 ====================

function loadPracticeModule() {
    console.log('加载实战模拟模块');
    
    if (!habitData || !habitData.units) {
        console.error('习惯数据未加载或结构不正确');
        return;
    }
    
    // 加载练习进度
    loadPracticeProgress();
    
    // 获取所有练习数据，按训练单元分组
    const practicesByUnit = [];
    Object.values(habitData.units).forEach((unit, unitIndex) => {
        if (unit.sections && unit.sections.practice_arena && unit.sections.practice_arena.length > 0) {
            practicesByUnit.push({
                unitName: unit.unitName,
                unitSubtitle: unit.subtitle,
                practices: unit.sections.practice_arena
            });
        }
    });
    
    if (practicesByUnit.length === 0) {
        document.getElementById('practiceList').innerHTML = '<p>暂无实战练习</p>';
        return;
    }
    
    // 渲染按单元分组的练习列表
    renderPracticeListByUnit(practicesByUnit);
}

function renderPracticeListByUnit(practicesByUnit) {
    const practiceList = document.getElementById('practiceList');
    practiceList.innerHTML = '';
    
    practicesByUnit.forEach((unitGroup, unitIndex) => {
        // 创建训练单元标题
        const unitHeader = document.createElement('div');
        unitHeader.className = 'practice-unit-header';
        unitHeader.innerHTML = `
            <h4 style="color: #333; font-size: 18px; font-weight: 600; margin: 20px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #007AFF;">
                ${unitGroup.unitName}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                ${unitGroup.unitSubtitle}
            </p>
        `;
        practiceList.appendChild(unitHeader);
        
        // 创建该单元的练习项
        unitGroup.practices.forEach((practice, practiceIndex) => {
            const practiceItem = document.createElement('div');
            practiceItem.className = 'practice-item';
            practiceItem.style.cursor = 'pointer';
            
            const isCompleted = practiceProgress.completed.includes(practice.practiceId);
            const statusIcon = isCompleted ? '✅' : '🎯';
            
            practiceItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <h4 style="margin: 0; flex: 1;">${statusIcon} ${practice.title}</h4>
                    ${isCompleted ? 
                        '<span style="background: #34C759; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ 已完成</span>' : 
                        '<span style="background: #007AFF; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">开始练习 →</span>'
                    }
                </div>
                <p style="margin: 8px 0;">${practice.scenario.length > 100 ? practice.scenario.substring(0, 100) + '...' : practice.scenario}</p>
                <div style="margin-top: 12px;">
                    <small style="color: #666;">评估维度: ${practice.evaluationDimensions.join(' • ')}</small>
                </div>
            `;
            
            // 点击整个卡片都能开始练习
            practiceItem.onclick = () => startPractice(practice);
            
            practiceList.appendChild(practiceItem);
        });
    });
}

function renderPracticeList(practices) {
    const practiceList = document.getElementById('practiceList');
    practiceList.innerHTML = '';
    
    practices.forEach((practice, index) => {
        const practiceItem = document.createElement('div');
        practiceItem.className = 'practice-item';
        practiceItem.onclick = () => startPractice(practice);
        
        const isCompleted = practiceProgress.completed.includes(practice.practiceId);
        const statusIcon = isCompleted ? '✅' : '🎯';
        
        practiceItem.innerHTML = `
            <h4>${statusIcon} ${practice.title}</h4>
            <p>${practice.scenario.substring(0, 100)}...</p>
            ${isCompleted ? '<small style="color: #34C759;">已完成</small>' : ''}
        `;
        
        practiceList.appendChild(practiceItem);
    });
}

function startPractice(practice) {
    currentPractice = practice;
    
    // 隐藏练习选择器，显示练习工作区
    document.getElementById('practiceSelector').classList.add('hidden');
    document.getElementById('practiceWorkspace').classList.remove('hidden');
    
    // 填充练习内容
    document.getElementById('practiceTitle').textContent = practice.title;
    document.getElementById('scenarioContent').textContent = practice.scenario;
    document.getElementById('taskContent').textContent = practice.task;
    
    // 清空用户输入和评估结果
    document.getElementById('userResponse').value = '';
    document.getElementById('practiceEvaluation').classList.add('hidden');
    
    console.log('开始练习:', practice);
}

function backToPracticeList() {
    // 显示练习选择器，隐藏练习工作区
    document.getElementById('practiceSelector').classList.remove('hidden');
    document.getElementById('practiceWorkspace').classList.add('hidden');
    
    currentPractice = null;
}

function clearResponse() {
    document.getElementById('userResponse').value = '';
}

async function submitPracticeResponse() {
    const userResponse = document.getElementById('userResponse').value.trim();
    
    if (!userResponse) {
        alert('请输入您的回复');
        return;
    }
    
    if (!currentPractice) {
        alert('当前没有选择练习');
        return;
    }
    
    try {
        // 显示加载状态
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>🤖 AI分析中...</span>';
        submitBtn.disabled = true;
        
        // 调用AI评估API
        const evaluation = await callAIEvaluation(userResponse, currentPractice);
        
        // 显示评估结果
        displayEvaluationResult(evaluation);
        
        // 记录完成状态和评估结果
        if (!practiceProgress.completed.includes(currentPractice.practiceId)) {
            practiceProgress.completed.push(currentPractice.practiceId);
        }
        
        // 保存评估结果到进度中
        practiceProgress.scores[currentPractice.practiceId] = {
            overallScore: evaluation.overallScore,
            dimensionScores: evaluation.dimensionScores,
            feedback: evaluation.feedback,
            completedAt: new Date().toISOString()
        };
        
        savePracticeProgress();
        
        // 更新排行榜进度
        await this.updateLeaderboardProgress();
        
        // 更新模块按钮状态
        updateModuleButtons();
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('提交练习失败:', error);
        alert('AI评估失败，请稍后重试');
        
        // 恢复按钮状态
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<span>📤 提交回复</span>';
        submitBtn.disabled = false;
    }
}

async function callAIEvaluation(userInput, practice) {
    const response = await fetch(`${API_BASE}/api/ai/evaluate-practice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userInput: userInput,
            scenario: practice.scenario,
            evaluationDimensions: practice.evaluationDimensions
        })
    });
    
    if (!response.ok) {
        throw new Error('AI评估请求失败');
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || 'AI评估失败');
    }
    
    return result.data.evaluation;
}

function displayEvaluationResult(evaluation) {
    // 显示评估区域
    document.getElementById('practiceEvaluation').classList.remove('hidden');
    
    // 填充综合得分
    document.getElementById('overallScore').textContent = evaluation.overallScore + '/10';
    
    // 填充各维度得分
    const dimensionScores = document.getElementById('dimensionScores');
    dimensionScores.innerHTML = '';
    
    Object.entries(evaluation.dimensionScores).forEach(([dimension, score]) => {
        const dimensionItem = document.createElement('div');
        dimensionItem.className = 'dimension-item';
        dimensionItem.innerHTML = `
            <span class="dimension-name">${dimension}</span>
            <span class="dimension-score">${score}/10</span>
        `;
        dimensionScores.appendChild(dimensionItem);
    });
    
    // 填充反馈内容
    document.getElementById('feedbackContent').textContent = evaluation.feedback;
    
    // 填充亮点表现
    const highlightsList = document.getElementById('highlightsList');
    highlightsList.innerHTML = '';
    evaluation.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.textContent = highlight;
        highlightsList.appendChild(li);
    });
    
    // 填充改进建议
    const improvementsList = document.getElementById('improvementsList');
    improvementsList.innerHTML = '';
    evaluation.improvements.forEach(improvement => {
        const li = document.createElement('li');
        li.textContent = improvement;
        improvementsList.appendChild(li);
    });
    
    // 滚动到评估结果
    document.getElementById('practiceEvaluation').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function retryPractice() {
    // 清空用户输入和评估结果
    document.getElementById('userResponse').value = '';
    document.getElementById('practiceEvaluation').classList.add('hidden');
    
    // 滚动到输入区域
    document.getElementById('userResponse').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function nextPractice() {
    // 获取所有练习
    const practices = [];
    Object.values(habitData.units).forEach(unit => {
        if (unit.sections && unit.sections.practice_arena) {
            practices.push(...unit.sections.practice_arena);
        }
    });
    
    // 找到当前练习的索引
    const currentIndex = practices.findIndex(p => p.practiceId === currentPractice.practiceId);
    
    if (currentIndex < practices.length - 1) {
        // 开始下一个练习
        startPractice(practices[currentIndex + 1]);
    } else {
        // 所有练习完成，返回列表
        backToPracticeList();
        alert('恭喜！您已完成所有实战练习！');
    }
}

function savePracticeProgress() {
    try {
        const progressKey = `practice_progress_habit_${currentHabit}`;
        
        // 更新最后访问时间
        practiceProgress.lastAccessed = new Date().toISOString();
        
        // 保存到localStorage
        localStorage.setItem(progressKey, JSON.stringify(practiceProgress));
        
        // 同时保存到后端（如果用户已登录）
        if (typeof window.currentUser !== 'undefined' && window.currentUser) {
            savePracticeProgressToServer();
        }
        
        console.log('练习进度已保存');
    } catch (error) {
        console.error('保存练习进度失败:', error);
    }
}

function loadPracticeProgress() {
    try {
        const progressKey = `practice_progress_habit_${currentHabit}`;
        const saved = localStorage.getItem(progressKey);
        
        if (saved) {
            practiceProgress = JSON.parse(saved);
            // 确保有scores字段
            if (!practiceProgress.scores) {
                practiceProgress.scores = {};
            }
        } else {
            // 初始化默认进度
            practiceProgress = {
                currentHabit: currentHabit,
                completed: [],
                scores: {},
                lastAccessed: new Date().toISOString()
            };
        }
        
        // 如果用户已登录，尝试从服务器加载最新进度
        if (typeof window.currentUser !== 'undefined' && window.currentUser) {
            loadPracticeProgressFromServer();
        }
        
        console.log('练习进度已加载:', practiceProgress);
    } catch (error) {
        console.error('加载练习进度失败:', error);
        // 如果加载失败，使用默认值
        practiceProgress = {
            currentHabit: currentHabit,
            completed: [],
            scores: {},
            lastAccessed: new Date().toISOString()
        };
    }
}

async function savePracticeProgressToServer() {
    try {
        const response = await fetch('/api/progress/practice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: window.currentUser.id,
                habitNumber: currentHabit,
                progress: practiceProgress
            })
        });
        
        if (!response.ok) {
            console.warn('服务器保存进度失败');
        }
    } catch (error) {
        console.warn('无法连接到服务器保存进度:', error);
    }
}

async function loadPracticeProgressFromServer() {
    try {
        const response = await fetch(`/api/progress/practice/${window.currentUser.id}/${currentHabit}`);
        
        if (response.ok) {
            const serverProgress = await response.json();
            if (serverProgress.success && serverProgress.data) {
                // 合并本地和服务器进度，以最新的为准
                const localTime = new Date(practiceProgress.lastAccessed || 0);
                const serverTime = new Date(serverProgress.data.lastAccessed || 0);
                
                if (serverTime > localTime) {
                    practiceProgress = serverProgress.data;
                    const progressKey = `practice_progress_habit_${currentHabit}`;
                    localStorage.setItem(progressKey, JSON.stringify(practiceProgress));
                    console.log('从服务器同步了最新进度');
                }
            }
        }
    } catch (error) {
        console.warn('无法从服务器加载进度:', error);
    }
}

// ===== 应用难题模块相关函数 =====

let currentDilemma = null;
let dilemmaProgress = {
    completed: [],
    current: null,
    conversations: {}
};

function loadDilemmaModule() {
    console.log('加载应用难题模块');
    
    if (!habitData || !habitData.units) {
        console.error('习惯数据未加载或结构不正确');
        return;
    }
    
    // 加载难题进度
    loadDilemmaProgress();
    
    // 收集所有训练单元的难题
    const allDilemmas = [];
    Object.values(habitData.units).forEach(unit => {
        if (unit.sections && unit.sections.dilemma_zone && unit.sections.dilemma_zone.length > 0) {
            unit.sections.dilemma_zone.forEach(dilemma => {
                allDilemmas.push({
                    ...dilemma,
                    unitName: unit.unitName,
                    unitId: unit.unitId
                });
            });
        }
    });
    
    console.log('找到难题数量:', allDilemmas.length);
    
    // 渲染难题列表
    renderDilemmaList(allDilemmas);
    
    // 显示难题选择器
    document.getElementById('dilemmaSelector').classList.remove('hidden');
    document.getElementById('dilemmaWorkspace').classList.add('hidden');
}

function renderDilemmaList(dilemmas) {
    const dilemmaList = document.getElementById('dilemmaList');
    if (!dilemmaList) return;
    
    let html = '';
    dilemmas.forEach((dilemma, index) => {
        const isCompleted = dilemmaProgress.completed.includes(dilemma.dilemmaId);
        const hasConversation = dilemmaProgress.conversations[dilemma.dilemmaId] && 
                               dilemmaProgress.conversations[dilemma.dilemmaId].length > 0;
        const completedClass = isCompleted ? 'completed' : (hasConversation ? 'in-progress' : '');
        const completedIcon = isCompleted ? '✅' : (hasConversation ? '💬' : '🤔');
        
        html += `
            <div class="dilemma-item ${completedClass}" onclick="startDilemma('${dilemma.dilemmaId}')">
                <div class="dilemma-icon">${completedIcon}</div>
                <div class="dilemma-content">
                    <h4>${dilemma.title}</h4>
                    <p class="dilemma-unit">${dilemma.unitName}</p>
                    <p class="dilemma-preview">${dilemma.question.substring(0, 100)}...</p>
                </div>
                <div class="dilemma-arrow">→</div>
            </div>
        `;
    });
    
    dilemmaList.innerHTML = html;
}

function startDilemma(dilemmaId) {
    console.log('开始难题讨论:', dilemmaId);
    
    // 从所有难题中找到当前难题
    let foundDilemma = null;
    Object.values(habitData.units).forEach(unit => {
        if (unit.sections && unit.sections.dilemma_zone) {
            unit.sections.dilemma_zone.forEach(dilemma => {
                if (dilemma.dilemmaId === dilemmaId) {
                    foundDilemma = {
                        ...dilemma,
                        unitName: unit.unitName,
                        unitId: unit.unitId
                    };
                }
            });
        }
    });
    
    if (!foundDilemma) {
        console.error('未找到难题:', dilemmaId);
        return;
    }
    
    currentDilemma = foundDilemma;
    
    // 更新难题讨论界面
    document.getElementById('dilemmaTitle').textContent = foundDilemma.title;
    document.getElementById('questionContent').textContent = foundDilemma.question;
    
    // 初始化对话历史
    const conversationHistory = dilemmaProgress.conversations[dilemmaId] || [];
    renderDilemmaConversation(conversationHistory);
    
    // 显示难题讨论界面
    document.getElementById('dilemmaSelector').classList.add('hidden');
    document.getElementById('dilemmaWorkspace').classList.remove('hidden');
    
    // 清空输入框
    document.getElementById('dilemmaThought').value = '';
}

function renderDilemmaConversation(conversationHistory) {
    const conversationDiv = document.getElementById('dilemmaConversation');
    if (!conversationDiv) return;
    
    let html = '';
    
    if (conversationHistory.length === 0) {
        html = `
            <div class="conversation-intro">
                <p>💭 这是一个思辨性难题，没有标准答案。请分享你的想法，AI导师将与你进行苏格拉底式的对话，帮助你深入思考。</p>
            </div>
        `;
    } else {
        conversationHistory.forEach(message => {
            const isUser = message.role === 'user';
            const roleClass = isUser ? 'user-message' : 'ai-message';
            const roleIcon = isUser ? '👤' : '🤖';
            const roleName = isUser ? '你' : 'AI导师';
            
            html += `
                <div class="conversation-message ${roleClass}">
                    <div class="message-header">
                        <span class="message-icon">${roleIcon}</span>
                        <span class="message-role">${roleName}</span>
                    </div>
                    <div class="message-content">${message.content}</div>
                </div>
            `;
        });
    }
    
    conversationDiv.innerHTML = html;
    
    // 滚动到底部
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

async function submitDilemmaThought() {
    if (!currentDilemma) {
        console.error('没有当前难题');
        return;
    }
    
    const thoughtText = document.getElementById('dilemmaThought').value.trim();
    if (!thoughtText) {
        alert('请输入你的思考');
        return;
    }
    
    const submitBtn = document.getElementById('dilemmaSubmitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        // 显示加载状态
        submitBtn.innerHTML = '<span>🤔 AI思考中...</span>';
        submitBtn.disabled = true;
        
        // 获取当前对话历史
        const conversationHistory = dilemmaProgress.conversations[currentDilemma.dilemmaId] || [];
        
        // 添加用户的思考到对话历史
        conversationHistory.push({
            role: 'user',
            content: thoughtText,
            timestamp: new Date().toISOString()
        });
        
        // 调用AI服务获取引导
        console.log('🔍 准备创建AIService实例...');
        console.log('🔍 AIService类型:', typeof AIService);
        console.log('🔍 window.AIService类型:', typeof window.AIService);
        console.log('🔍 DilemmaManager类型:', typeof DilemmaManager);
        console.log('🔍 window.DilemmaManager类型:', typeof window.DilemmaManager);
        
        if (typeof AIService === 'undefined') {
            throw new Error('AIService未定义，请检查aiService.js是否正确加载');
        }
        
        const aiService = new AIService();
        const guidance = await aiService.guideDilemmaDiscussion(
            currentDilemma,
            thoughtText,
            conversationHistory
        );
        
        // 添加AI的引导到对话历史
        // 处理不同的AI回复数据结构
        let aiContent = '';
        if (typeof guidance === 'string') {
            aiContent = guidance;
        } else if (guidance && guidance.guidance) {
            aiContent = guidance.guidance;
        } else if (guidance && guidance.data && guidance.data.guidance) {
            aiContent = guidance.data.guidance;
        } else {
            aiContent = guidance || '抱歉，我没有收到有效的回复';
        }
        
        console.log('📄 处理后的AI内容:', aiContent);
        
        conversationHistory.push({
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString()
        });
        
        // 保存对话历史
        dilemmaProgress.conversations[currentDilemma.dilemmaId] = conversationHistory;
        saveDilemmaProgress();
        
        // 更新界面
        renderDilemmaConversation(conversationHistory);
        
        // 清空输入框
        document.getElementById('dilemmaThought').value = '';
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('提交思考失败:', error);
        alert('AI引导失败，请稍后重试');
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function clearDilemmaThought() {
    document.getElementById('dilemmaThought').value = '';
}

function backToDilemmaList() {
    document.getElementById('dilemmaSelector').classList.remove('hidden');
    document.getElementById('dilemmaWorkspace').classList.add('hidden');
    currentDilemma = null;
}

function saveDilemmaProgress() {
    const progressKey = `dilemma_progress_habit_${currentHabit}`;
    dilemmaProgress.lastAccessed = new Date().toISOString();
    localStorage.setItem(progressKey, JSON.stringify(dilemmaProgress));
}

/**
 * 更新排行榜进度
 */
async function updateLeaderboardProgress() {
    try {
        const user = checkAuth();
        if (!user) return;

        // 计算总进度
        const totalPractices = [];
        if (habitData && habitData.units) {
            Object.values(habitData.units).forEach(unit => {
                if (unit.sections && unit.sections.practice_arena) {
                    totalPractices.push(...unit.sections.practice_arena);
                }
            });
        }

        const completedCount = totalPractices.filter(practice => 
            practiceProgress.completed.includes(practice.practiceId)
        ).length;

        const totalProgress = Math.round((completedCount / Math.max(totalPractices.length, 1)) * 100);
        
        // 计算平均分
        const scores = Object.values(practiceProgress.scores || {});
        const averageScore = scores.length > 0 
            ? scores.reduce((sum, s) => sum + (s.overallScore || 0), 0) / scores.length 
            : 0;

        // 发送到排行榜API
        const response = await fetch(`${API_BASE}/api/leaderboard/update-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                username: user.username,
                totalProgress,
                completedHabits: Math.floor(totalProgress / 100 * 7),
                practiceScore: averageScore,
                activityType: 'practice_completed'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('排行榜进度更新成功:', data.data);
        }
    } catch (error) {
        console.error('更新排行榜进度失败:', error);
    }
}

/**
 * 工具函数：从学习页面更新进度
 */
function updateLeaderboardProgress(habitNumber, progress, practiceScore) {
    if (window.leaderboardManager) {
        window.leaderboardManager.updateUserProgress(habitNumber, progress, practiceScore);
    }
}

function loadDilemmaProgress() {
    const progressKey = `dilemma_progress_habit_${currentHabit}`;
    const saved = localStorage.getItem(progressKey);
    if (saved) {
        try {
            dilemmaProgress = JSON.parse(saved);
        } catch (error) {
            console.error('加载难题进度失败:', error);
            dilemmaProgress = {
                completed: [],
                current: null,
                conversations: {}
            };
        }
    }
}