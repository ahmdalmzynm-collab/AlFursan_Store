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

const instaPhone = "01003644366";

// State
let products = [...initialProducts];
let services = [...initialServices];
let cart = [];
let orders = [];
let role = 'customer';
let selectedFilter = "الكل";
let searchQuery = "";
let notice = "مرحبًا بك عميل الفرسان. تصفح واطلب الآن.";
let paymentScreenshot = null;
let selectedServiceId = null;

// DOM Elements
const cartItems = document.getElementById('cart-items');
const totalAmount = document.getElementById('total-amount');
const noticeEl = document.getElementById('notice');
const searchInput = document.getElementById('search-input');
const paymentScreenshotInput = document.getElementById('payment-screenshot');
const fileSelected = document.getElementById('file-selected');
const customerNameInput = document.getElementById('customer-name');
const customerPhoneInput = document.getElementById('customer-phone');
const customerAddressInput = document.getElementById('customer-address');
const customerOrdersList = document.getElementById('customer-orders-list');
const serviceBookingSection = document.getElementById('service-booking-section');
const bookingServiceTitle = document.getElementById('booking-service-title');
const bookingServiceDescription = document.getElementById('booking-service-description');
const bookingNameInput = document.getElementById('booking-name');
const bookingPhoneInput = document.getElementById('booking-phone');
const bookingQuantityInput = document.getElementById('booking-quantity');
const bookingNotesInput = document.getElementById('booking-notes');
const confirmServiceBtn = document.getElementById('confirm-service-btn');
const cancelServiceBtn = document.getElementById('cancel-service-btn');

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
  renderProducts();
  renderServices();
  renderCart();
  renderCustomerOrders();
  updateTotal();
  updateNotice();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  document.getElementById('checkout-btn').addEventListener('click', handleOrder);
  confirmServiceBtn.addEventListener('click', submitServiceBooking);
  cancelServiceBtn.addEventListener('click', () => {
    hideServiceBooking();
  });

  paymentScreenshotInput.addEventListener('change', (e) => {
    paymentScreenshot = e.target.files[0];
    fileSelected.textContent = paymentScreenshot ? `تم تحديد ملف ${paymentScreenshot.name}` : '';
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'products') {
      loadData();
      renderProducts();
      setNotice('تم تحديث قائمة المنتجات تلقائيًا.');
    }
    if (event.key === 'orders') {
      loadData();
      renderCustomerOrders();
    }
  });

  window.addEventListener('focus', () => {
    loadData();
    renderProducts();
    renderCustomerOrders();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadData();
      renderProducts();
      renderCustomerOrders();
    }
  });

  setInterval(() => {
    const previousProducts = JSON.stringify(products);
    loadData();
    if (JSON.stringify(products) !== previousProducts) {
      renderProducts();
    }
  }, 8000);
});

function setFilter(filter) {
  selectedFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderProducts();
}

function getFilteredProducts() {
  return products.filter(product => {
    const matchesType = selectedFilter === "الكل" || product.type === selectedFilter;
    const combinedText = [product.name, product.brand, product.size, product.type, ...(product.keywords || [])].join(" ").toLowerCase();
    const matchesQuery = combinedText.includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();
  const productsGrid = document.getElementById('products-grid');
  productsGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span>${product.type}</span>
          <span>${product.brand}</span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-size">المقاس: ${product.size}</p>
        <div class="product-footer">
          <div class="product-price-info">
         <p class="product-price">${product.price} ج.م</p>
           ${ /*  <p class="product-stock ${product.stock > 0 ? 'available' : 'unavailable'}">
              ${product.stock > 0 ? (product.stock === 1 ? 'متبقي قطعة واحدة فقط' : `متوفر في المخزن (${product.stock})`) : "نفذت الكمية"}
            </p>*/}
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
            أضف للسلة
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderServices() {
  const servicesGrid = document.getElementById('services-grid');
  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card">
      <h3 class="service-title">${service.title}</h3>
      <p class="service-description">${service.description}</p>
      <div class="service-footer">
        <button class="service-btn" onclick="handleServiceBooking(${service.id})">احجز الآن</button>
      </div>
    </div>
  `).join('');
}

function showServiceBooking(serviceId) {
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  selectedServiceId = serviceId;
  bookingServiceTitle.textContent = service.title;
  bookingServiceDescription.textContent = service.description;
  bookingNameInput.value = customerNameInput.value.trim();
  bookingPhoneInput.value = customerPhoneInput.value.trim();
  bookingQuantityInput.value = 1;
  bookingNotesInput.value = '';
  serviceBookingSection.classList.remove('hidden');
  serviceBookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideServiceBooking() {
  serviceBookingSection.classList.add('hidden');
  selectedServiceId = null;
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">السلة فارغة، أضف منتجات الآن.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-header">
        <div class="cart-item-info">
          <h3>${item.product.name}</h3>
          <p>${item.product.brand}</p>
        </div>
        <p class="cart-item-price">${item.product.price} ج.م</p>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn" onclick="updateQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
        <span class="quantity-display">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
      </div>
    </div>
  `).join('');
}

function renderCustomerOrders() {
  if (orders.length === 0) {
    customerOrdersList.innerHTML = '<p class="empty-orders">لا توجد طلبات سابقة.</p>';
    return;
  }

  customerOrdersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <h4>طلب رقم ${order.id}</h4>
      <p>التاريخ: ${order.createdAt}</p>
      ${order.customer ? `
      <p>العميل: ${order.customer.name}</p>
      <p>الهاتف: ${order.customer.phone}</p>
      <p>العنوان: ${order.customer.address}</p>
      ` : ''}
      ${order.type === 'service' ? `<p>الخدمة: ${order.serviceTitle}</p>` : order.items ? `
      <div class="order-items">
        ${order.items.map(item => `<span>${item.product.name} x${item.quantity}</span>`).join('')}
      </div>
      <p>الإجمالي: ${order.total} ج.م</p>
      ` : ''}
      <p class="order-status">${order.status}</p>
    </div>
  `).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock === 0) {
    setNotice('هذا المنتج غير متوفر حاليًا.');
    return;
  }

  const existing = cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock);
  } else {
    cart.push({ product, quantity: 1 });
  }

  product.stock -= 1;
  renderProducts();
  renderCart();
  updateTotal();
  setNotice(`تمت إضافة ${product.name} إلى السلة.`);
}

function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;

  if (quantity <= 0) {
    cart = cart.filter(i => i.product.id !== productId);
  } else {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (quantity <= product.stock + item.quantity) {
      product.stock += item.quantity - quantity;
      item.quantity = quantity;
    }
  }

  renderProducts();
  renderCart();
  updateTotal();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  totalAmount.textContent = `${total} ج.م`;
}

function handleOrder() {
  if (cart.length === 0) {
    setNotice('أضف منتجات إلى السلة أولاً ثم أكمل الطلب.');
    return;
  }

  const name = customerNameInput.value.trim();
  const phone = customerPhoneInput.value.trim();
  const address = customerAddressInput.value.trim();

  if (!name || !phone || !address) {
    setNotice('يرجى إدخال الاسم ورقم الهاتف والعنوان لإتمام الطلب.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const orderId = orders.length + 1;
  const order = {
    id: orderId,
    items: cart.map(item => ({ product: item.product, quantity: item.quantity })),
    customer: { name, phone, address },
    total,
    status: 'جديد',
    type: 'product',
    createdAt: new Date().toLocaleString('ar-EG'),
  };
  orders.unshift(order);
  saveData();

  const message = `طلب جديد من الفرسان:\nرقم الطلب: ${orderId}\nالعميل: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\nالمنتجات: ${order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ')}\nالإجمالي: ${total} ج.م`;
  const whatsappUrl = `https://wa.me/201003644366?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  setNotice('تم إرسال الطلب بنجاح. سيصل الطلب إلى العميل في لوحة إدارة الطلبات.');
  cart = [];
  renderCart();
  updateTotal();
  renderProducts();
  renderCustomerOrders();
  customerNameInput.value = '';
  customerPhoneInput.value = '';
  customerAddressInput.value = '';
  paymentScreenshotInput.value = '';
  fileSelected.textContent = '';
}

function handleServiceBooking(serviceId) {
  showServiceBooking(serviceId);
}

function submitServiceBooking() {
  const service = services.find(s => s.id === selectedServiceId);
  const name = bookingNameInput.value.trim();
  const phone = bookingPhoneInput.value.trim();
  const address = customerAddressInput.value.trim();
  const quantity = parseInt(bookingQuantityInput.value, 10);
  const notes = bookingNotesInput.value.trim();

  if (!service) {
    setNotice('لم يتم تحديد الخدمة بشكل صحيح. حاول مرة أخرى.');
    return;
  }
  if (!name || !phone || !address) {
    setNotice('يرجى إدخال الاسم ورقم الهاتف والعنوان لإتمام الحجز.');
    return;
  }
  if (!quantity || quantity < 1) {
    setNotice('حدد عدد الإطارات أو القطع على الأقل.');
    return;
  }

  const orderId = orders.length + 1;
  const order = {
    id: orderId,
    customer: { name, phone, address },
    serviceTitle: service.title,
    serviceNotes: notes,
    quantity,
    total: service.price * quantity,
    status: 'جديد',
    type: 'service',
    createdAt: new Date().toLocaleString('ar-EG'),
  };
  orders.unshift(order);
  saveData();
  renderCustomerOrders();
  hideServiceBooking();

  const message = `طلب خدمة من الفرسان:\nرقم الطلب: ${orderId}\nالعميل: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\nالخدمة: ${service.title}\nالعدد: ${quantity}\nالملاحظات: ${notes || 'بدون'}\nالإجمالي: ${order.total} ج.م`;
  const whatsappUrl = `https://wa.me/201003644366?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  setNotice(`تم حجز خدمة ${service.title}. سنتواصل معك لتأكيد الموعد.`);
}

function setNotice(message) {
  notice = message;
  updateNotice();
}

function updateNotice() {
  noticeEl.textContent = notice;
}
