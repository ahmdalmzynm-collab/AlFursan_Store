const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg'); // استدعاء مكتبة قاعدة البيانات

// الربط التلقائي بقاعدة بيانات Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// وظيفة لإنشاء الجدول لو مش موجود عشان يحفظ المنتجات للأبد
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database Table Ready!");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
initDB();

const server = http.createServer(async (req, res) => {
  
  // --- الجزء الخاص بالتعامل مع بيانات المنتجات (الـ API) ---
  
  // 1. مسار جلب المنتجات من القاعدة لعرضها في الموقع
  if (req.url === '/api/products' && req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
      return;
    } catch (err) {
      res.writeHead(500); res.end('Database Error'); return;
    }
  }

  // 2. مسار إضافة منتج جديد وحفظه في القاعدة
  if (req.url === '/api/products' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { name, price, image_url } = JSON.parse(body);
        await pool.query('INSERT INTO products (name, price, image_url) VALUES ($1, $2, $3)', [name, price, image_url]);
        res.writeHead(201);
        res.end('Success: Product saved to Postgres');
      } catch (err) {
        res.writeHead(500); res.end('Insert Error');
      }
    });
    return;
  }

  // --- كودك الأصلي لعرض ملفات الموقع (HTML, CSS, JS) ---
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404); res.end('File not found');
      } else {
        res.writeHead(500); res.end('Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
