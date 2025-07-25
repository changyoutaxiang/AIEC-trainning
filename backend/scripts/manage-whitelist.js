#!/usr/bin/env node

/**
 * AIEC 企业邮箱白名单管理工具
 * 
 * 使用方法：
 * node manage-whitelist.js add email@company.com     # 添加邮箱到白名单
 * node manage-whitelist.js remove email@company.com  # 从白名单移除邮箱
 * node manage-whitelist.js list                      # 显示当前白名单
 * node manage-whitelist.js check email@company.com   # 检查邮箱是否在白名单中
 */

const fs = require('fs');
const path = require('path');

const WHITELIST_PATH = path.join(__dirname, '../config/authorized-users.json');

// 读取白名单配置
function loadWhitelist() {
    try {
        const data = fs.readFileSync(WHITELIST_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 读取白名单配置失败:', error.message);
        process.exit(1);
    }
}

// 保存白名单配置
function saveWhitelist(config) {
    try {
        config.lastUpdated = new Date().toISOString().split('T')[0];
        fs.writeFileSync(WHITELIST_PATH, JSON.stringify(config, null, 2));
        console.log('✅ 白名单配置已保存');
    } catch (error) {
        console.error('❌ 保存白名单配置失败:', error.message);
        process.exit(1);
    }
}

// 验证邮箱格式
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 添加邮箱到白名单
function addEmail(email) {
    if (!validateEmail(email)) {
        console.error('❌ 邮箱格式不正确:', email);
        return;
    }
    
    const config = loadWhitelist();
    
    if (config.authorizedEmails.includes(email)) {
        console.log('⚠️  邮箱已在白名单中:', email);
        return;
    }
    
    config.authorizedEmails.push(email);
    saveWhitelist(config);
    console.log('✅ 邮箱已添加到白名单:', email);
    console.log(`📊 当前白名单用户数: ${config.authorizedEmails.length}/${config.settings.maxUsersLimit}`);
}

// 从白名单移除邮箱
function removeEmail(email) {
    const config = loadWhitelist();
    const index = config.authorizedEmails.indexOf(email);
    
    if (index === -1) {
        console.log('⚠️  邮箱不在白名单中:', email);
        return;
    }
    
    // 检查是否是管理员邮箱
    if (config.adminEmails.includes(email)) {
        console.error('❌ 无法移除管理员邮箱:', email);
        return;
    }
    
    config.authorizedEmails.splice(index, 1);
    saveWhitelist(config);
    console.log('✅ 邮箱已从白名单移除:', email);
    console.log(`📊 当前白名单用户数: ${config.authorizedEmails.length}/${config.settings.maxUsersLimit}`);
}

// 显示白名单
function listEmails() {
    const config = loadWhitelist();
    
    console.log('📋 AIEC团队企业邮箱白名单');
    console.log('='.repeat(50));
    console.log(`📅 最后更新: ${config.lastUpdated}`);
    console.log(`🏢 企业域名: ${config.companyDomain}`);
    console.log(`👥 用户限制: ${config.authorizedEmails.length}/${config.settings.maxUsersLimit}`);
    console.log('');
    
    console.log('👑 管理员邮箱:');
    config.adminEmails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
    });
    console.log('');
    
    console.log('👤 授权用户邮箱:');
    config.authorizedEmails.forEach((email, index) => {
        const isAdmin = config.adminEmails.includes(email);
        const marker = isAdmin ? '👑' : '  ';
        console.log(`${marker} ${index + 1}. ${email}`);
    });
    
    console.log('');
    console.log(`📊 总计: ${config.authorizedEmails.length} 个授权邮箱`);
}

// 检查邮箱是否在白名单中
function checkEmail(email) {
    const config = loadWhitelist();
    const isAuthorized = config.authorizedEmails.includes(email);
    const isAdmin = config.adminEmails.includes(email);
    
    console.log('🔍 邮箱检查结果:');
    console.log(`   邮箱: ${email}`);
    console.log(`   格式: ${validateEmail(email) ? '✅ 正确' : '❌ 错误'}`);
    console.log(`   授权: ${isAuthorized ? '✅ 已授权' : '❌ 未授权'}`);
    console.log(`   管理员: ${isAdmin ? '✅ 是' : '❌ 否'}`);
    
    if (isAuthorized) {
        console.log('🎉 该邮箱可以注册和登录AIEC学习系统');
    } else {
        console.log('⚠️  该邮箱无法注册和登录，请联系管理员添加');
    }
}

// 显示使用帮助
function showHelp() {
    console.log('🔐 AIEC 企业邮箱白名单管理工具');
    console.log('');
    console.log('使用方法:');
    console.log('  node manage-whitelist.js add <email>     # 添加邮箱到白名单');
    console.log('  node manage-whitelist.js remove <email>  # 从白名单移除邮箱');
    console.log('  node manage-whitelist.js list            # 显示当前白名单');
    console.log('  node manage-whitelist.js check <email>   # 检查邮箱授权状态');
    console.log('  node manage-whitelist.js help            # 显示帮助信息');
    console.log('');
    console.log('示例:');
    console.log('  node manage-whitelist.js add newuser@company.com');
    console.log('  node manage-whitelist.js check wangdong@company.com');
    console.log('  node manage-whitelist.js list');
}

// 主程序
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showHelp();
        return;
    }
    
    const command = args[0].toLowerCase();
    const email = args[1];
    
    switch (command) {
        case 'add':
            if (!email) {
                console.error('❌ 请提供要添加的邮箱地址');
                return;
            }
            addEmail(email.toLowerCase());
            break;
            
        case 'remove':
            if (!email) {
                console.error('❌ 请提供要移除的邮箱地址');
                return;
            }
            removeEmail(email.toLowerCase());
            break;
            
        case 'list':
            listEmails();
            break;
            
        case 'check':
            if (!email) {
                console.error('❌ 请提供要检查的邮箱地址');
                return;
            }
            checkEmail(email.toLowerCase());
            break;
            
        case 'help':
            showHelp();
            break;
            
        default:
            console.error('❌ 未知命令:', command);
            showHelp();
    }
}

// 运行主程序
main();