#!/usr/bin/env node

/**
 * AIEC 企业邮箱白名单批量管理工具
 * 
 * 使用方法：
 * node batch-whitelist.js add email1@company.com email2@company.com email3@company.com
 * node batch-whitelist.js remove email1@company.com email2@company.com
 * node batch-whitelist.js import emails.txt  # 从文件导入
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

// 批量添加邮箱
function batchAddEmails(emails) {
    const config = loadWhitelist();
    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    console.log(`\n🚀 开始批量添加 ${emails.length} 个邮箱...\n`);

    emails.forEach(email => {
        email = email.trim();
        
        if (!email) return;
        
        if (!validateEmail(email)) {
            errors.push(`❌ 邮箱格式不正确: ${email}`);
            return;
        }

        if (config.authorizedEmails.includes(email)) {
            console.log(`⚠️  邮箱已存在: ${email}`);
            skippedCount++;
            return;
        }

        config.authorizedEmails.push(email);
        console.log(`✅ 已添加: ${email}`);
        addedCount++;
    });

    if (addedCount > 0) {
        saveWhitelist(config);
        console.log(`\n🎉 批量添加完成!`);
        console.log(`   ✅ 成功添加: ${addedCount} 个邮箱`);
        console.log(`   ⚠️  跳过重复: ${skippedCount} 个邮箱`);
        console.log(`   📊 当前总数: ${config.authorizedEmails.length}/20`);
    } else {
        console.log('\n⚠️  没有新邮箱被添加');
    }

    if (errors.length > 0) {
        console.log('\n❌ 错误信息:');
        errors.forEach(error => console.log(`   ${error}`));
    }
}

// 批量移除邮箱
function batchRemoveEmails(emails) {
    const config = loadWhitelist();
    let removedCount = 0;
    
    console.log(`\n🗑️  开始批量移除 ${emails.length} 个邮箱...\n`);

    emails.forEach(email => {
        email = email.trim();
        if (!email) return;

        const index = config.authorizedEmails.indexOf(email);
        if (index !== -1) {
            config.authorizedEmails.splice(index, 1);
            console.log(`✅ 已移除: ${email}`);
            removedCount++;
        } else {
            console.log(`⚠️  邮箱不存在: ${email}`);
        }
    });

    if (removedCount > 0) {
        saveWhitelist(config);
        console.log(`\n🎉 批量移除完成!`);
        console.log(`   ✅ 成功移除: ${removedCount} 个邮箱`);
        console.log(`   📊 当前总数: ${config.authorizedEmails.length}/20`);
    } else {
        console.log('\n⚠️  没有邮箱被移除');
    }
}

// 从文件导入邮箱
function importFromFile(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        const emails = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#')); // 忽略空行和注释

        console.log(`📂 从文件 ${filename} 读取到 ${emails.length} 个邮箱`);
        batchAddEmails(emails);
    } catch (error) {
        console.error(`❌ 读取文件失败: ${error.message}`);
    }
}

// 创建邮箱列表模板文件
function createTemplate() {
    const templateContent = `# AIEC团队邮箱白名单模板
# 每行一个邮箱地址，以#开头的行为注释

# 管理层
manager1@51talk.com
manager2@51talk.com

# 技术团队
dev1@51talk.com
dev2@51talk.com
dev3@51talk.com

# 运营团队
ops1@51talk.com
ops2@51talk.com

# HR团队
hr1@51talk.com
hr2@51talk.com
`;

    fs.writeFileSync('emails-template.txt', templateContent);
    console.log('✅ 已创建邮箱模板文件: emails-template.txt');
    console.log('💡 请编辑该文件，然后运行: node batch-whitelist.js import emails-template.txt');
}

// 显示帮助
function showHelp() {
    console.log('🔐 AIEC 企业邮箱白名单批量管理工具\n');
    console.log('使用方法:');
    console.log('  批量添加:');
    console.log('    node batch-whitelist.js add email1@51talk.com email2@51talk.com email3@51talk.com');
    console.log('  批量移除:');
    console.log('    node batch-whitelist.js remove email1@51talk.com email2@51talk.com');
    console.log('  从文件导入:');
    console.log('    node batch-whitelist.js import emails.txt');
    console.log('  创建模板文件:');
    console.log('    node batch-whitelist.js template');
    console.log('');
    console.log('示例:');
    console.log('  node batch-whitelist.js add zhang@51talk.com li@51talk.com wang@51talk.com');
    console.log('  node batch-whitelist.js import team-emails.txt');
}

// 主程序
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showHelp();
        return;
    }
    
    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'add':
            const emailsToAdd = args.slice(1);
            if (emailsToAdd.length === 0) {
                console.error('❌ 请提供要添加的邮箱地址');
                showHelp();
                return;
            }
            batchAddEmails(emailsToAdd);
            break;
            
        case 'remove':
            const emailsToRemove = args.slice(1);
            if (emailsToRemove.length === 0) {
                console.error('❌ 请提供要移除的邮箱地址');
                return;
            }
            batchRemoveEmails(emailsToRemove);
            break;
            
        case 'import':
            const filename = args[1];
            if (!filename) {
                console.error('❌ 请提供要导入的文件名');
                return;
            }
            importFromFile(filename);
            break;
            
        case 'template':
            createTemplate();
            break;
            
        case 'help':
        default:
            showHelp();
            break;
    }
}

// 运行主程序
main();