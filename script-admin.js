// Data
const initialProducts = [
  {
    id: 1,
    name: "إطار 235/45 R18",
    type: "جنوط",
    size: "235/45 R18",
    brand: "ميشلان",
    price: 3250,
    stock: 5,
    image: "https://images.unsplash.com/photo-1607623814075-7ea07b53ecd6?auto=format&fit=crop&w=900&q=80",
    keywords: ["إطار", "جنوط", "ميشلان", "سيارات", "رياضة"],
  },
  {
    id: 2,
    name: "بطارية 12V 70Ah",
    type: "بطاريات",
    size: "12V 70Ah",
    brand: "فارتا",
    price: 1850,
    stock: 3,
    image: "https://images.unsplash.com/photo-1555617117-08b0f38e61f4?auto=format&fit=crop&w=900&q=80",
    keywords: ["بطارية", "فارتا", "سيارة", "تشغيل", "قوة"],
  },
  {
    id: 3,
    name: "كوتش 205/55 R16",
    type: "كوتش",
    size: "205/55 R16",
    brand: "بريجستون",
    price: 2890,
    stock: 6,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    keywords: ["كوتش", "بريجستون", "مقاومة", "سفر", "راحة"],
  },
  {
    id: 4,
    name: "بطارية 12V 55Ah",
    type: "بطاريات",
    size: "12V 55Ah",
    brand: "الدلتا",
    price: 1490,
    stock: 0,
    image: "https://images.unsplash.com/photo-1495121605193-b116b5b9c5d8?auto=format&fit=crop&w=900&q=80",
    keywords: ["بطارية", "الدلتا", "طاقة", "بدء", "موثوق"],
  },
];

const initialServices = [
  {
    id: 1,
    title: "استعدادال جنوط",
    description: "ضبط دقيق للجنوط والكفرات لتحسين الأداء والثبات.",
    price: 150,
  },
  {
    id: 2,
    title: "فك وتركيب",
    description: "فك وتركيب سريع مع توازن كامل للسيارات.",
    price: 200,
  },
  {
    id: 3,
    title: "ترصيص جنوط",
    description: "ضبط ضغط الهواء والموازنة لأمان أعلى في الطرق.",
    price: 100,
  },
  {
    id: 4,
    title: "لحام",
    description: "لحام احترافي للجنوط والأجزاء المعدنية.",
    price: 300,
  },
];

// State
let products = [...initialProducts];
let services = [...initialServices];
let cart = [];
let orders = [];
let role = 'vendor';
let selectedFilter = "الكل";
let searchQuery = "";
let notice = "مرحبًا بك مستخدم الفرسان. يمكنك إدارة المنتجات ومتابعة الطلبات.";
let paymentScreenshot = null;
let newOrderNotification = false;

// DOM Elements
const noticeEl = document.getElementById('notice');
const productCount = document.getElementById('product-count');
const inventoryList = document.getElementById('inventory-list');
const ordersList = document.getElementById('orders-list');
const adminImageFile = document.getElementById('admin-image-file');
const adminImageUrl = document.getElementById('admin-image-url');
const adminKeywords = document.getElementById('admin-keywords');
const fileSelected = document.getElementById('file-selected');

// Load data from localStorage
function loadData() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    products = JSON.parse(savedProducts);
  }
  const savedOrders = localStorage.getItem('orders');
  if (savedOrders) {
    orders = JSON.parse(savedOrders);
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderInventory();
  renderOrders();
  updateProductCount();
  updateNotice();

  document.getElementById('add-product-btn').addEventListener('click', handleAdminAdd);

  adminImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (fileSelected) {
      fileSelected.textContent = file ? `تم اختيار ملف ${file.name}` : '';
    }
  });

  document.getElementById('notification-close').addEventListener('click', () => {
    document.getElementById('notification').classList.add('hidden');
    newOrderNotification = false;
  });

  // Real-time updates
  setInterval(() => {
    renderOrders();
  }, 10000); // تحديث كل 10 ثوان
});

function renderInventory() {
  if (products.length === 0) {
    inventoryList.innerHTML = '<p class="empty-orders">لا يوجد منتجات في المخزون.</p>';
    return;
  }

  inventoryList.innerHTML = products.map(product => `
    <div class="inventory-item">
      <div class="inventory-header">
        <div class="inventory-info">
          <h4>${product.name}</h4>
          <p>${product.brand} · ${product.size}</p>
        </div>
        <div class="inventory-details">
          <p>سعر: ${product.price} ج.م</p>
          <p>${product.stock} قطعة متبقية</p>
        </div>
      </div>
      <p class="service-description">الكلمات المفتاحية: ${product.keywords.join(', ')}</p>
      <div class="inventory-actions">
        <button class="delete-btn" onclick="deleteProduct(${product.id})">حذف</button>
      </div>
    </div>
  `).join('');
}

function renderOrders() {
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-orders">لا توجد طلبات بعد.</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <h4>طلب رقم ${order.id}</h4>
      <p>التاريخ: ${order.createdAt}</p>
      ${order.customer ? `
      <p>العميل: ${order.customer.name}</p>
      <p>الهاتف: ${order.customer.phone}</p>
      <p>العنوان: ${order.customer.address}</p>
      ` : ''}
      ${order.type === 'service' ? `<p>الخدمة: ${order.serviceTitle}</p>` : `
      <div class="order-items">
        ${order.items ? order.items.map(item => `<span>${item.product.name} x${item.quantity}</span>`).join('') : ''}
      </div>
      <p>الإجمالي: ${order.total} ج.م</p>
      `}
      <p class="order-status">${order.status}</p>
      <div class="order-actions">
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="جديد" ${order.status === 'جديد' ? 'selected' : ''}>جديد</option>
          <option value="قيد التنفيذ" ${order.status === 'قيد التنفيذ' ? 'selected' : ''}>قيد التنفيذ</option>
          <option value="جاري التوصيل" ${order.status === 'جاري التوصيل' ? 'selected' : ''}>جاري التوصيل</option>
          <option value="تم التركيب" ${order.status === 'تم التركيب' ? 'selected' : ''}>تم التركيب</option>
        </select>
      </div>
    </div>
  `).join('');
}

function handleAdminAdd() {
  const name = document.getElementById('admin-name').value.trim();
  const price = document.getElementById('admin-price').value.trim();
  const stock = document.getElementById('admin-stock').value.trim();
  const size = document.getElementById('admin-size').value.trim();
  const brand = document.getElementById('admin-brand').value.trim();
  const type = document.getElementById('admin-type').value;
  const imageUrl = adminImageUrl.value.trim();
  const keywords = adminKeywords.value.split(',').map(t => t.trim()).filter(Boolean);

  if (!name || !price || !stock) {
    setNotice('يرجى ملء الاسم والسعر والكمية.');
    return;
  }

  let image = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80';
  if (adminImageFile.files[0]) {
    image = URL.createObjectURL(adminImageFile.files[0]);
  } else if (imageUrl) {
    image = imageUrl;
  }

  const nextId = Math.max(...products.map(p => p.id), 0) + 1;
  const newProduct = {
    id: nextId,
    name,
    type,
    size: size || (type === "جنوط" ? "غير محدد" : size || "غير محدد"),
    brand: brand || "غير محدد",
    price: parseInt(price, 10),
    stock: parseInt(stock, 10),
    image,
    keywords: [...keywords, name, brand, type, size].filter(Boolean),
  };

  products.push(newProduct);
  
  // --- إضافة جديدة: إرسال نسخة لقاعدة البيانات الخارجية ---
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newProduct.name,
      price: newProduct.price.toString(),
      image_url: newProduct.image
    })
  }).then(() => console.log("تم تحديث السيرفر")).catch(err => console.log("خطأ في السيرفر:", err));
  // -----------------------------------------------------

  document.getElementById('admin-name').value = '';
  document.getElementById('admin-price').value = '';
  document.getElementById('admin-stock').value = '';
  document.getElementById('admin-size').value = '';
  document.getElementById('admin-brand').value = '';
  adminImageUrl.value = '';
  adminKeywords.value = '';
  adminImageFile.value = '';
  fileSelected.textContent = '';

  renderInventory();
  updateProductCount();
  setNotice('تم إضافة المنتج إلى المخزون بنجاح.');
  saveData();
}

function deleteProduct(productId) {
  products = products.filter(p => p.id !== productId);
  renderInventory();
  updateProductCount();
  setNotice('تم حذف المنتج من المخزون.');
  saveData();
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    renderOrders();
    saveData();
  }
}

function setNotice(message) {
  notice = message;
  updateNotice();
}

function updateNotice() {
  noticeEl.textContent = notice;
}

function updateProductCount() {
  productCount.textContent = `${products.length}`;
}
