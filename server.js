const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 车型搜索API
app.get('/api/search-car', async (req, res) => {
  const keyword = req.query.keyword;
  
  if (!keyword) {
    return res.status(400).json({ error: '请提供搜索关键词' });
  }

  try {
    console.log(`搜索车型: ${keyword}`);
    
    // 使用Puppeteer抓取懂车帝数据
    const cars = await scrapeDongchedi(keyword);
    
    res.json({
      success: true,
      data: cars,
      count: cars.length
    });
    
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      error: '搜索失败，请稍后重试',
      details: error.message
    });
  }
});

// 抓取懂车帝数据的函数
async function scrapeDongchedi(keyword) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // 访问懂车帝搜索页面
    const searchUrl = `https://www.dongchedi.com/search?keyword=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 提取车型数据
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.car-item, .search-result-item, [data-testid*="car"]');
      const results = [];
      
      carElements.forEach((element, index) => {
        try {
          // 尝试多种选择器来获取车型信息
          const nameElement = element.querySelector('.car-name, .name, h3, h4, .title');
          const priceElement = element.querySelector('.price, .car-price, .price-info');
          const imageElement = element.querySelector('img');
          
          if (nameElement) {
            const car = {
              id: index,
              name: nameElement.textContent.trim(),
              price: priceElement ? priceElement.textContent.trim() : '暂无报价',
              image: imageElement ? imageElement.src : null,
              url: element.querySelector('a') ? element.querySelector('a').href : null
            };
            
            // 过滤有效数据
            if (car.name && car.name.length > 0) {
              results.push(car);
            }
          }
        } catch (error) {
          console.error('解析车型元素失败:', error);
        }
      });
      
      return results.slice(0, 10); // 限制返回前10个结果
    });
    
    return cars;
    
  } finally {
    await browser.close();
  }
}

// 备用方案：使用静态数据
app.get('/api/search-car-fallback', (req, res) => {
  const keyword = req.query.keyword.toLowerCase();
  
  // 静态车型数据库
  const carDatabase = {
    '特斯拉': [
      { name: '特斯拉 Model 3', price: '25.99万起', image: 'https://example.com/model3.jpg' },
      { name: '特斯拉 Model Y', price: '26.39万起', image: 'https://example.com/modely.jpg' },
      { name: '特斯拉 Model S', price: '78.99万起', image: 'https://example.com/models.jpg' }
    ],
    '比亚迪': [
      { name: '比亚迪 汉', price: '21.98万起', image: 'https://example.com/han.jpg' },
      { name: '比亚迪 唐', price: '20.98万起', image: 'https://example.com/tang.jpg' },
      { name: '比亚迪 宋', price: '14.98万起', image: 'https://example.com/song.jpg' }
    ],
    '奔驰': [
      { name: '奔驰 C级', price: '33.23万起', image: 'https://example.com/c-class.jpg' },
      { name: '奔驰 E级', price: '44.01万起', image: 'https://example.com/e-class.jpg' },
      { name: '奔驰 S级', price: '96.26万起', image: 'https://example.com/s-class.jpg' }
    ]
  };
  
  const results = [];
  Object.keys(carDatabase).forEach(brand => {
    if (brand.includes(keyword) || keyword.includes(brand)) {
      results.push(...carDatabase[brand]);
    }
  });
  
  res.json({
    success: true,
    data: results,
    count: results.length,
    source: 'static'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`车型搜索API: http://localhost:${PORT}/api/search-car?keyword=特斯拉`);
}); 