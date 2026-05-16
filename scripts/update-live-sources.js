const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/quicktv.db');
const db = new sqlite3.Database(dbPath);

const realLiveSources = [
  { name: 'CCTV-1 综合', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0001_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV1.png' },
  { name: 'CCTV-2 财经', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0002_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV2.png' },
  { name: 'CCTV-3 综艺', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0003_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV3.png' },
  { name: 'CCTV-4 中文国际', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0004_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV4.png' },
  { name: 'CCTV-5 体育', category: '央视', url: 'http://221.13.235.3:9901/tsfile/live/0005_1.m3u8?key=txiptv&playlive=1&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV5.png' },
  { name: 'CCTV-5+ 体育赛事', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0006_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV5+.png' },
  { name: 'CCTV-6 电影', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0007_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV6.png' },
  { name: 'CCTV-7 国防军事', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0008_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV7.png' },
  { name: 'CCTV-8 电视剧', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0009_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV8.png' },
  { name: 'CCTV-9 纪录', category: '央视', url: 'http://183.129.255.66:8480/hls/10/index.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV9.png' },
  { name: 'CCTV-10 科教', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0011_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV10.png' },
  { name: 'CCTV-11 戏曲', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0012_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV11.png' },
  { name: 'CCTV-12 社会与法', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0013_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV12.png' },
  { name: 'CCTV-13 新闻', category: '央视', url: 'http://221.13.235.3:9901/tsfile/live/0013_1.m3u8?key=txiptv&playlive=1&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV13.png' },
  { name: 'CCTV-14 少儿', category: '央视', url: 'http://112.123.243.37:50085/tsfile/live/0015_1.m3u8?key=txiptv&playlive=0&authid=0', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV14.png' },
  
  { name: '湖南卫视', category: '卫视', url: 'http://222.169.85.8:9901/tsfile/live/0128_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/湖南卫视.png' },
  { name: '浙江卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0124_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/浙江卫视.png' },
  { name: '江苏卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0127_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/江苏卫视.png' },
  { name: '东方卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0107_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/东方卫视.png' },
  { name: '北京卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0122_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/北京卫视.png' },
  { name: '广东卫视', category: '卫视', url: 'http://222.169.85.8:9901/tsfile/live/0125_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/广东卫视.png' },
  { name: '深圳卫视', category: '卫视', url: 'http://112.27.235.94:8000/hls/33/index.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/深圳卫视.png' },
  { name: '天津卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0135_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/天津卫视.png' },
  { name: '山东卫视', category: '卫视', url: 'http://222.169.85.8:9901/tsfile/live/0131_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/山东卫视.png' },
  { name: '安徽卫视', category: '卫视', url: 'http://123.129.70.178:9901/tsfile/live/0130_1.m3u8', logo: 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/安徽卫视.png' }
];

console.log('开始更新直播源...');

db.serialize(() => {
  db.run('DELETE FROM live_channels', (err) => {
    if (err) {
      console.error('清空表失败:', err);
      return;
    }
    console.log('已清空旧数据');

    const stmt = db.prepare('INSERT INTO live_channels (name, logo, stream_url, category, status) VALUES (?, ?, ?, ?, ?)');
    
    realLiveSources.forEach((channel, index) => {
      stmt.run(channel.name, channel.logo, channel.url, channel.category, 'active', (err) => {
        if (err) {
          console.error(`插入 ${channel.name} 失败:`, err);
        } else {
          console.log(`✓ ${index + 1}/${realLiveSources.length} ${channel.name}`);
        }
      });
    });

    stmt.finalize(() => {
      console.log(`\n✅ 成功更新 ${realLiveSources.length} 个直播频道！`);
      db.close();
    });
  });
});
