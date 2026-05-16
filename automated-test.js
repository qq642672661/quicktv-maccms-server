const http = require('http');
const https = require('https');

console.log('🚀 开始自动化测试 HelloTV 管理后台\n');
console.log('='.repeat(60));

const tests = [];
let passedTests = 0;
let failedTests = 0;

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  console.log(`${icons[type]} ${message}`);
}

function addTest(name, passed, details = '') {
  tests.push({ name, passed, details });
  if (passed) {
    passedTests++;
    log(`${name} - 通过`, 'success');
  } else {
    failedTests++;
    log(`${name} - 失败${details ? ': ' + details : ''}`, 'error');
  }
}

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testServerConnection() {
  console.log('\n📡 测试1: 服务器连接');
  console.log('-'.repeat(60));
  
  try {
    const result = await fetchPage('http://localhost:3000/api/admin/stats/dashboard');
    addTest('服务器响应', result.statusCode === 200);
    
    const data = JSON.parse(result.data);
    addTest('API返回JSON格式', data.code === 200);
    addTest('仪表盘数据完整', data.data && data.data.overview);
    
    if (data.data && data.data.overview) {
      log(`  - 总视频数: ${data.data.overview.totalVideos}`, 'info');
      log(`  - 直播频道: ${data.data.overview.totalLiveChannels}`, 'info');
      log(`  - 分类数量: ${data.data.overview.totalCategories}`, 'info');
    }
  } catch (error) {
    addTest('服务器连接', false, error.message);
  }
}

async function testHTMLStructure() {
  console.log('\n📄 测试2: HTML结构完整性');
  console.log('-'.repeat(60));
  
  try {
    const result = await fetchPage('http://localhost:3000/admin-dashboard.html');
    addTest('HTML文件可访问', result.statusCode === 200);
    
    const html = result.data;
    
    const menuItems = [
      'data-page="dashboard"',
      'data-page="categories"',
      'data-page="videos"',
      'data-page="live"',
      'data-page="sources"',
      'data-page="migration"',
      'data-page="settings"'
    ];
    
    const pageContainers = [
      'id="dashboard-page"',
      'id="categories-page"',
      'id="videos-page"',
      'id="live-page"',
      'id="sources-page"',
      'id="migration-page"',
      'id="settings-page"'
    ];
    
    let allMenuItemsFound = true;
    let allPagesFound = true;
    
    menuItems.forEach((item, index) => {
      const found = html.includes(item);
      if (!found) {
        allMenuItemsFound = false;
        log(`  缺少菜单项: ${item}`, 'error');
      }
    });
    
    pageContainers.forEach((page, index) => {
      const found = html.includes(page);
      if (!found) {
        allPagesFound = false;
        log(`  缺少页面容器: ${page}`, 'error');
      }
    });
    
    addTest('所有菜单项存在', allMenuItemsFound, `${menuItems.length}个菜单项`);
    addTest('所有页面容器存在', allPagesFound, `${pageContainers.length}个页面`);
    
    if (allMenuItemsFound && allPagesFound) {
      log(`  菜单项和页面容器数量匹配: ${menuItems.length}`, 'info');
    }
    
  } catch (error) {
    addTest('HTML结构检查', false, error.message);
  }
}

async function testJavaScriptCode() {
  console.log('\n🔧 测试3: JavaScript代码完整性');
  console.log('-'.repeat(60));
  
  try {
    const result = await fetchPage('http://localhost:3000/admin-dashboard.html');
    const html = result.data;
    
    const requiredCode = [
      { name: 'DOMContentLoaded事件', pattern: 'DOMContentLoaded' },
      { name: 'showPage函数', pattern: 'function showPage' },
      { name: 'loadDashboard函数', pattern: 'function loadDashboard' },
      { name: 'loadCategories函数', pattern: 'function loadCategories' },
      { name: 'loadVideos函数', pattern: 'function loadVideos' },
      { name: 'loadChannels函数', pattern: 'function loadChannels' },
      { name: '错误处理(targetPage检查)', pattern: 'const targetPage' },
      { name: '调试日志', pattern: "console.log('DOM加载完成" }
    ];
    
    requiredCode.forEach(({ name, pattern }) => {
      const found = html.includes(pattern);
      addTest(name, found);
    });
    
  } catch (error) {
    addTest('JavaScript代码检查', false, error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 测试4: API端点可用性');
  console.log('-'.repeat(60));
  
  const endpoints = [
    { name: '仪表盘API', url: '/api/admin/stats/dashboard' },
    { name: '分类API', url: '/api/admin/categories' },
    { name: '视频API', url: '/api/admin/videos' },
    { name: '直播频道API', url: '/api/admin/live/channels' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await fetchPage(`http://localhost:3000${endpoint.url}`);
      const data = JSON.parse(result.data);
      addTest(endpoint.name, data.code === 200);
      
      if (data.data && data.data.items) {
        log(`  - 返回 ${data.data.items.length} 条记录`, 'info');
      }
    } catch (error) {
      addTest(endpoint.name, false, error.message);
    }
  }
}

async function testStaticFiles() {
  console.log('\n📁 测试5: 静态文件可访问性');
  console.log('-'.repeat(60));
  
  const files = [
    { name: '管理后台', url: '/admin-dashboard.html' },
    { name: '管理后台v2', url: '/admin-dashboard-v2.html' },
    { name: '调试页面', url: '/debug.html' },
    { name: '选项卡测试', url: '/test-tabs.html' },
    { name: '测试仪表盘', url: '/test-dashboard.html' }
  ];
  
  for (const file of files) {
    try {
      const result = await fetchPage(`http://localhost:3000${file.url}`);
      addTest(file.name, result.statusCode === 200);
    } catch (error) {
      addTest(file.name, false, '文件不存在');
    }
  }
}

async function testDataIntegrity() {
  console.log('\n💾 测试6: 数据完整性');
  console.log('-'.repeat(60));
  
  try {
    const dashboard = await fetchPage('http://localhost:3000/api/admin/stats/dashboard');
    const dashboardData = JSON.parse(dashboard.data);
    
    const categories = await fetchPage('http://localhost:3000/api/admin/categories');
    const categoriesData = JSON.parse(categories.data);
    
    const videos = await fetchPage('http://localhost:3000/api/admin/videos');
    const videosData = JSON.parse(videos.data);
    
    const channels = await fetchPage('http://localhost:3000/api/admin/live/channels');
    const channelsData = JSON.parse(channels.data);
    
    addTest('仪表盘统计数据一致', 
      dashboardData.data.overview.totalCategories === categoriesData.data.total &&
      dashboardData.data.overview.totalVideos === videosData.data.total &&
      dashboardData.data.overview.totalLiveChannels === channelsData.data.total
    );
    
    addTest('分类数据存在', categoriesData.data.total > 0);
    addTest('视频数据存在', videosData.data.total > 0);
    addTest('直播频道数据存在', channelsData.data.total > 0);
    
    log(`  - 分类: ${categoriesData.data.total}个`, 'info');
    log(`  - 视频: ${videosData.data.total}个`, 'info');
    log(`  - 直播频道: ${channelsData.data.total}个`, 'info');
    
  } catch (error) {
    addTest('数据完整性检查', false, error.message);
  }
}

async function runAllTests() {
  const startTime = Date.now();
  
  await testServerConnection();
  await testHTMLStructure();
  await testJavaScriptCode();
  await testAPIEndpoints();
  await testStaticFiles();
  await testDataIntegrity();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`总测试数: ${tests.length}`);
  console.log(`✅ 通过: ${passedTests}`);
  console.log(`❌ 失败: ${failedTests}`);
  console.log(`⏱️  耗时: ${duration}秒`);
  console.log(`📈 通过率: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！管理后台功能正常。');
    console.log('\n💡 如果浏览器中仍然无法切换选项卡，请尝试：');
    console.log('   1. 按 Ctrl + Shift + R 硬刷新浏览器');
    console.log('   2. 或访问: http://localhost:3000/admin-dashboard-v2.html');
  } else {
    console.log('\n⚠️  部分测试失败，请检查上述错误信息。');
  }
  
  console.log('\n' + '='.repeat(60));
  
  process.exit(failedTests > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});
