const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 启动浏览器测试选项卡切换功能...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('DevTools')) {
      console.log('浏览器控制台:', text);
    }
  });

  page.on('pageerror', error => {
    console.error('❌ 页面错误:', error.message);
  });

  try {
    console.log('📍 访问管理后台...');
    await page.goto('http://localhost:3000/admin-dashboard.html', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n✅ 页面加载完成\n');

    const menuItems = await page.$$('.sidebar-menu li');
    console.log(`找到 ${menuItems.length} 个菜单项\n`);

    const menuTexts = await page.$$eval('.sidebar-menu li', items =>
      items.map(item => ({
        text: item.textContent.trim(),
        dataPage: item.getAttribute('data-page'),
        isActive: item.classList.contains('active')
      }))
    );

    console.log('菜单项列表:');
    menuTexts.forEach((item, index) => {
      const activeIcon = item.isActive ? '✓' : ' ';
      console.log(`  [${activeIcon}] ${index + 1}. ${item.text} (${item.dataPage})`);
    });

    console.log('\n🧪 开始测试选项卡切换...\n');

    for (let i = 0; i < Math.min(menuTexts.length, 7); i++) {
      const menuItem = menuTexts[i];

      console.log(`\n[测试 ${i + 1}/${menuTexts.length}] 点击: ${menuItem.text}`);

      await page.click(`.sidebar-menu li:nth-child(${i + 1})`);

      await new Promise(resolve => setTimeout(resolve, 500));

      const activeMenu = await page.$eval('.sidebar-menu li.active', el => el.textContent.trim());
      console.log(`  ✓ 激活的菜单: ${activeMenu}`);

      const visiblePages = await page.$$eval('.page', pages =>
        pages.filter(p => {
          const style = window.getComputedStyle(p);
          return style.display !== 'none';
        }).map(p => p.id)
      );

      const expectedPageId = `${menuItem.dataPage}-page`;

      if (visiblePages.length === 1 && visiblePages[0] === expectedPageId) {
        console.log(`  ✅ 页面切换成功: ${expectedPageId}`);
      } else if (visiblePages.length === 0) {
        console.log(`  ❌ 错误: 没有可见的页面！`);
      } else if (visiblePages.length > 1) {
        console.log(`  ❌ 错误: 多个页面同时显示: ${visiblePages.join(', ')}`);
      } else {
        console.log(`  ❌ 错误: 显示了错误的页面`);
        console.log(`     期望: ${expectedPageId}`);
        console.log(`     实际: ${visiblePages[0]}`);
      }
    }

    console.log('\n\n📊 测试完成！');
    console.log('浏览器将保持打开，请手动检查...');
    console.log('按 Ctrl+C 关闭浏览器\n');

    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
