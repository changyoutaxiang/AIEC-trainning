/**
 * AIEC 职场软技能 - 新首页交互逻辑
 * 
 * 包含页面滚动、动画、交互和导航功能
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('AIEC Homepage loaded');
    
    // 初始化所有功能
    initializeNavigation();
    initializeAnimations();
    initializeFAQ();
    initializeScrollEffects();
    initializeForms();
});

// 导航功能
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // 滚动时改变导航栏样式
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // 移动端菜单切换
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 动画初始化
function initializeAnimations() {
    // 使用 Intersection Observer 实现滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 为需要动画的元素添加观察
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .habit-mini-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // 添加动画类样式
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// FAQ 折叠功能
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-question i');
        
        // 初始状态
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        
        question.addEventListener('click', function() {
            const isOpen = answer.style.maxHeight !== '0px';
            
            // 关闭所有其他FAQ
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherIcon = otherItem.querySelector('.faq-question i');
                if (otherItem !== item) {
                    otherAnswer.style.maxHeight = '0';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // 切换当前FAQ
            if (isOpen) {
                answer.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
            
            icon.style.transition = 'transform 0.3s ease';
        });
    });
}

// 滚动效果
function initializeScrollEffects() {
    // 进度环动画
    const progressRing = document.querySelector('.progress-ring circle:last-child');
    if (progressRing) {
        const circumference = 2 * Math.PI * 50;
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = circumference;
        
        const progressObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        progressRing.style.strokeDashoffset = '134';
                        progressRing.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
                    }, 500);
                }
            });
        });
        
        progressObserver.observe(progressRing);
    }
    
    // 数字增长动画
    const animateNumbers = function() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach(number => {
            const target = number.textContent;
            const numericValue = parseInt(target.replace(/\D/g, ''));
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                if (target.includes('%')) {
                    number.textContent = Math.floor(current) + '%';
                } else if (target.includes('+')) {
                    number.textContent = Math.floor(current).toLocaleString() + '+';
                } else if (target.includes('天')) {
                    number.textContent = Math.floor(current) + '天';
                }
            }, 30);
        });
    };
    
    // 当英雄区域可见时触发数字动画
    const heroObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                heroObserver.unobserve(entry.target);
            }
        });
    });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
}

// 表单处理
function initializeForms() {
    // 为所有按钮添加点击效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建涟漪效果
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 导航函数（供HTML调用）
function goToLogin() {
    window.location.href = 'login.html';
}

function goToRegister() {
    window.location.href = 'login.html#register';
}

function startFreeTrial() {
    // 创建注册模态框或跳转到注册页面
    const modal = createModal('开始免费试用', `
        <form id="trial-form">
            <div style="margin-bottom: 1rem;">
                <label>姓名</label>
                <input type="text" name="name" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem;">
            </div>
            <div style="margin-bottom: 1rem;">
                <label>邮箱</label>
                <input type="email" name="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem;">
            </div>
            <div style="margin-bottom: 1rem;">
                <label>职位</label>
                <select name="position" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem;">
                    <option>产品经理</option>
                    <option>工程师</option>
                    <option>设计师</option>
                    <option>销售</option>
                    <option>其他</option>
                </select>
            </div>
            <button type="submit" style="width: 100%; padding: 1rem; background: #007AFF; color: white; border: none; border-radius: 0.5rem; font-weight: 600;">
                立即开始7天免费试用
            </button>
        </form>
    `);
    
    document.body.appendChild(modal);
    
    // 处理表单提交
    const form = modal.querySelector('#trial-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // 保存用户信息并跳转到注册页面
        localStorage.setItem('trial_registration', JSON.stringify(data));
        window.location.href = 'login.html?trial=1';
    });
}

function watchDemo() {
    // 创建演示视频模态框
    const modal = createModal('演示视频', `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
            <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                allowfullscreen>
            </iframe>
        </div>
        <p style="margin-top: 1rem; color: #666; text-align: center;">
            观看我们的演示视频，了解AIEC如何帮助你提升职场软技能
        </p>
    `, 'large');
    
    document.body.appendChild(modal);
}

function upgradeToPro() {
    window.location.href = 'pricing.html';
}

// 创建模态框工具函数
function createModal(title, content, size = 'medium') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
            <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 1rem; padding: 2rem; max-width: ${size === 'large' ? '800px' : '400px'}; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #1a1a1a;">${title}</h3>
                    <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        </div>
    `;
    
    // 关闭模态框
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) closeModal();
    });
    
    // 按ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    return modal;
}

// 添加涟漪效果样式
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        padding: 1rem;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
        
        .nav-links.active {
            display: flex;
        }
    }
`;
document.head.appendChild(rippleStyle);