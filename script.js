document.addEventListener('DOMContentLoaded', () => {
  // No functionality needed for index page
});
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
            <p class="product-stock ${product.stock > 0 ? 'available' : 'unavailable'}">
              ${product.stock > 0 ? (product.stock === 1 ? 'متبقي قطعة واحدة فقط' : `متوفر في المخزن (${product.stock})`) : "نفذت الكمية"}
            </p>
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
  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card">
      <h3 class="service-title">${service.title}</h3>
      <p class="service-description">${service.description}</p>
      <div class="service-footer">
        <span class="service-price">${service.price} ج.م</span>
        <button class="service-btn" onclick="handleServiceBooking(${service.id})">احجز الآن</button>
      </div>
    </div>
  `).join('');
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
      <div class="order-items">
        ${order.items.map(item => `<span>${item.product.name} x${item.quantity}</span>`).join('')}
      </div>
      <p>الإجمالي: ${order.total} ج.م</p>
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

function addToCart(productId) {
  if (role !== 'customer') {
    setNotice('يجب تسجيل الدخول كعميل لإضافة منتجات إلى السلة.');
    return;
  }

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
  if (role !== 'customer') {
    setNotice('يجب تسجيل الدخول كعميل لإتمام الطلب.');
    return;
  }
  if (cart.length === 0) {
    setNotice('أضف منتجات إلى السلة أولاً ثم أكمل الطلب.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const orderId = orders.length + 1;
  const order = {
    id: orderId,
    items: cart.map(item => ({ product: item.product, quantity: item.quantity })),
    total,
    status: 'جديد',
    createdAt: new Date().toLocaleString('ar-EG'),
  };
  orders.unshift(order);
  newOrderNotification = true;

  // إرسال عبر WhatsApp
  const message = `طلب جديد من الفرسان:\nرقم الطلب: ${orderId}\nالمنتجات: ${order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ')}\nالإجمالي: ${total} ج.م\n${paymentScreenshot ? 'تم رفع صورة التحويل' : 'يرجى التحويل إلى 01003644366'}`;
  const whatsappUrl = `https://wa.me/201003644366?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  setNotice('تم إرسال الطلب بنجاح. سيصل الطلب إلى العميل في لوحة إدارة الطلبات.');
  cart = [];
  renderCart();
  updateTotal();
  renderProducts();
  renderOrders();
  showNotification();
  saveData();
}

function handleServiceBooking(serviceId) {
  if (role !== 'customer') {
    setNotice('يجب تسجيل الدخول كعميل لحجز الخدمات.');
    return;
  }
  const service = services.find(s => s.id === serviceId);
  setNotice(`تم حجز خدمة ${service.title}. سنتواصل معك لتأكيد الموعد.`);
}

function handleAdminAdd() {
  if (role !== 'vendor') {
    setNotice('يجب تسجيل الدخول كمستخدم لإضافة منتجات.');
    return;
  }

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
  document.getElementById('admin-name').value = '';
  document.getElementById('admin-price').value = '';
  document.getElementById('admin-stock').value = '';
  document.getElementById('admin-size').value = '';
  document.getElementById('admin-brand').value = '';
  adminImageUrl.value = '';
  adminKeywords.value = '';
  adminImageFile.value = '';
  fileSelected.textContent = '';

  renderProducts();
  renderInventory();
  updateProductCount();
  setNotice('تم إضافة المنتج إلى المخزون بنجاح.');
  saveData();
}

function deleteProduct(productId) {
  products = products.filter(p => p.id !== productId);
  renderProducts();
  renderInventory();
  updateProductCount();
  setNotice('تم حذف المنتج من المخزون.');
  saveData();
}

function setNotice(message) {
  notice = message;
  updateNotice();
}

function updateNotice() {
  noticeEl.textContent = notice;
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    renderOrders();
    saveData();
  }
}

function showNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
    newOrderNotification = false;
  }, 5000); // إخفاء بعد 5 ثوان
}

document.getElementById('notification-close').addEventListener('click', () => {
  document.getElementById('notification').classList.add('hidden');
  newOrderNotification = false;
});
