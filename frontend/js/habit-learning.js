// 习惯学习页面的具体功能
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
        loadModuleContent('concept');
        
        // 更新进度
        updateProgress();
    } catch (error) {
        console.error('初始化学习页面失败:', error);
        
        // 尝试使用默认数据
        habitData = getHabitData(currentHabit);
        document.getElementById('habitNumber').textContent = currentHabit;
        document.getElementById('habitTitle').textContent = habitData.habitName;
        document.getElementById('habitSubtitle').textContent = habitData.description;
        
        console.log('使用默认习惯数据继续加载');
    }
}

async function loadHabitData(habitNumber) {
    try {
        const response = await fetch('content/seven_habits.json');
        if (!response.ok) {
            throw new Error('无法加载习惯数据');
        }
        
        const data = await response.json();
        const habitKey = `habit_${habitNumber}`;
        
        if (!data.habits[habitKey]) {
            throw new Error(`习惯 ${habitNumber} 的数据不存在`);
        }
        
        habitData = data.habits[habitKey];
        console.log('习惯数据加载成功:', habitData);
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

function loadModuleContent(module) {
    console.log('加载模块内容:', module);
    
    // 隐藏所有内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // 显示当前模块内容
    const currentSection = document.getElementById(module + 'Content');
    if (currentSection) {
        currentSection.classList.remove('hidden');
        
        // 特殊处理实战模拟模块
        if (module === 'practice') {
            loadPracticeModule();
        } else {
            // 加载其他模块的内容（理念导入、导师采撷等）
            loadStaticModuleContent(module);
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
}

function loadStaticModuleContent(module) {
    // 为理念导入和导师采撷等模块加载静态内容
    const textElement = document.getElementById(module + 'Text');
    if (!textElement) return;
    
    if (module === 'concept') {
        // 加载理念导入内容
        if (habitData.units && habitData.units.unit_1_1) {
            const unit = habitData.units.unit_1_1;
            textElement.innerHTML = `
                <h3>核心理念</h3>
                <p><strong>专业层面：</strong>${unit.sections.why_it_matters.professional}</p>
                <p><strong>简单理解：</strong>${unit.sections.why_it_matters.simple}</p>
                
                <h3>学习目标</h3>
                <p>${unit.description}</p>
                
                <h3>核心哲学</h3>
                <p>${habitData.corePhilosophy}</p>
            `;
        }
    } else if (module === 'mentor') {
        // 加载导师采撷内容
        if (habitData.units && habitData.units.unit_1_1) {
            const unit = habitData.units.unit_1_1;
            textElement.innerHTML = `
                <h3>${unit.sections.leon_perspective.videoTitle}</h3>
                <p>${unit.sections.leon_perspective.videoDescription}</p>
                
                <div class="mentor-video-placeholder">
                    <p>📹 视频内容将在这里展示</p>
                    <p>Leon导师将分享关于"${unit.unitName}"的实战经验和深度见解</p>
                </div>
            `;
        }
    }
}

function bindModuleEvents() {
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            loadModuleContent(module);
        });
    });
}

function nextModule() {
    const modules = ['concept', 'mentor', 'practice'];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex < modules.length - 1) {
        const nextModule = modules[currentIndex + 1];
        loadModuleContent(nextModule);
        
        // 更新进度
        progress = Math.min(progress + 33, 100);
        updateProgress();
    }
}

function prevModule() {
    const modules = ['concept', 'mentor', 'practice'];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex > 0) {
        const prevModule = modules[currentIndex - 1];
        loadModuleContent(prevModule);
        
        // 更新进度
        progress = Math.max(progress - 33, 0);
        updateProgress();
    }
}

function completeHabit() {
    progress = 100;
    updateProgress();
    
    alert(`恭喜！你已经完成了习惯${currentHabit}的学习！`);
    
    // 保存学习进度到localStorage
    saveProgress();
    
    // 返回七个习惯页面
    window.location.href = 'seven-habits.html';
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
        localStorage.setItem(progressKey, progress.toString());
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
    
    // 获取所有练习数据
    const practices = [];
    Object.values(habitData.units).forEach(unit => {
        if (unit.sections && unit.sections.practice_arena) {
            practices.push(...unit.sections.practice_arena);
        }
    });
    
    if (practices.length === 0) {
        document.getElementById('practiceList').innerHTML = '<p>暂无实战练习</p>';
        return;
    }
    
    // 渲染练习列表
    renderPracticeList(practices);
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
        const submitBtn = document.querySelector('#practiceWorkspace .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'AI分析中...';
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
        
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('提交练习失败:', error);
        alert('AI评估失败，请稍后重试');
        
        // 恢复按钮状态
        const submitBtn = document.querySelector('#practiceWorkspace .btn-primary');
        submitBtn.textContent = '提交回复';
        submitBtn.disabled = false;
    }
}

async function callAIEvaluation(userInput, practice) {
    const response = await fetch('/api/ai/evaluate-practice', {
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