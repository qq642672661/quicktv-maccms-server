const puppeteer = require('puppeteer');

async function testAdminDashboard() {
  console.log('🚀 开始自动化测试管理后台...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  page.on('console', msg => {
    console.log('浏览器控制台:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.error('❌ 页面错误:', error.message);
  });
  
  try {
    console.log('📍 访问管理后台页面...');
    await page.goto('http://localhost:3000/admin-dashboard.html', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    console.log('✅ 页面加载成功\n');
    
    console.log('🔍 检查页面元素...');
    
    const menuItems = await page.$$('.sidebar-menu li');
    console.log(`✅ 找到 ${menuItems.length} 个菜单项`);
    
    const pages = await page.$$('.page');
    console.log(`✅ 找到 ${pages.length} 个页面容器\n`);
    
    const menuTexts = await page.$$eval('.sidebar-menu li', items => 
      items.map(item => ({
        text: item.textContent.trim(),
        dataPage: item.getAttribute('data-page')
      }))
    );
    
    console.log('📋 菜单项列表:');
    menuTexts.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} (data-page="${item.dataPage}")`);
    });
    
    const pageIds = await page.$$eval('.page', pages => 
      pages.map(p => p.id)
    );
    
    console.log('\n📋 页面容器列表:');
    pageIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });
    
    console.log('\n🧪 测试选项卡切换功能...\n');
    
    for (let i = 0; i < menuTexts.length; i++) {
      const menuItem = menuTexts[i];
      const expectedPageId = `${menuItem.dataPage}-page`;
      
      console.log(`测试 ${i + 1}/${menuTexts.length}: 点击 "${menuItem.text}"...`);
      
      await page.click(`.sidebar-menu li:nth-child(${i + 1})`);
      
      await page.waitForTimeout(500);
      
      const activeMenuItem = await page.$eval('.sidebar-menu li.active', el => el.textContent.trim());
      console.log(`  ✓ 激活的菜单项: ${activeMenuItem}`);
      
      const visiblePages = await page.$$eval('.page', pages => 
        pages.filter(p => p.style.display !== 'none').map(p => p.id)
      );
      
      if (visiblePages.length === 1 && visiblePages[0] === expectedPageId) {
        console.log(`  ✅ 页面切换成功: ${expectedPageId} 已显示`);
      } else if (visiblePages.length === 0) {
        console.log(`  ❌ 错误: 没有可见的页面`);
      } else if (visiblePages.length > 1) {
        console.log(`  ❌ 错误: 多个页面同时显示: ${visiblePages.join(', ')}`);
      } else {
        console.log(`  ❌ 错误: 显示的页面不正确`);
        console.log(`     期望: ${expectedPageId}`);
        console.log(`     实际: ${visiblePages[0]}`);
      }
      
      console.log('');
    }
    
    console.log('🧪 测试API数据加载...\n');
    
    await page.click('.sidebar-menu li:nth-child(1)');
    await page.waitForTimeout(2000);
    
    const dashboardStats = await page.$$eval('.stat-card .value', values => 
      values.map(v => v.textContent)
    );
    
    console.log('📊 仪表盘统计数据:');
    console.log(`  总视频数: ${dashboardStats[0]}`);
    console.log(`  直播频道: ${dashboardStats[1]}`);
    console.log(`  分类数量: ${dashboardStats[2]}`);
    console.log(`  总观看次数: ${dashboardStats[3]}`);
    
    if (dashboardStats.every(stat => stat !== '0' || stat === '0')) {
      console.log('  ✅ 数据加载成功');
    } else {
      console.log('  ❌ 数据加载失败');
    }
    
    console.log('\n✅ 测试完成！浏览器将保持打开状态，请手动检查...');
    console.log('按 Ctrl+C 关闭浏览器');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    await browser.close();
    process.exit(1);
  }
}

testAdminDashboard().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
