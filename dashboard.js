// Check admin access
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!currentUser || userRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    initDashboard();
});

// Dashboard data
let categories = [
    { id: 1, name: 'Women', icon: 'fas fa-female', count: 0 },
    { id: 2, name: 'Men', icon: 'fas fa-male', count: 0 },
    { id: 3, name: 'Accessories', icon: 'fas fa-gem', count: 0 },
    { id: 4, name: 'Bags', icon: 'fas fa-shopping-bag', count: 0 }
];

let products = [];

function initDashboard() {
    showWelcomeMessage();
    setupNavigation();
    loadDashboardData();
    addSampleProducts();
    addBagProducts();
    updateStats();
}

function addBagProducts() {
    // Only add if no products exist
    if (products.length === 0) {
        const bagProducts = [
            { title: "Elegant Women's Handbag", price: 189, oldPrice: 249, category: "bags", rating: 4.5, reviews: 156, badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop" },
            { title: "Men's Sports Backpack", price: 129, oldPrice: 169, category: "bags", rating: 4.2, reviews: 203, badge: "SPORT", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop" },
            { title: "Kids School Bag", price: 79, oldPrice: 99, category: "bags", rating: 4.0, reviews: 89, badge: "KIDS", image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=500&fit=crop" },
            { title: "Travel Luggage Bag", price: 299, oldPrice: 399, category: "bags", rating: 4.7, reviews: 142, badge: "TRAVEL", image: "https://images.unsplash.com/photo-1553735558-7b2b2924f8dc?w=400&h=500&fit=crop" },
            { title: "Trendy Shoulder Bag", price: 149, oldPrice: 199, category: "bags", rating: 4.3, reviews: 178, badge: "TRENDY", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop" },
            { title: "Luxury Evening Bag", price: 349, oldPrice: 449, category: "bags", rating: 4.8, reviews: 234, badge: "LUXURY", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop" }
        ];
        
        bagProducts.forEach(product => {
            const newProduct = {
                id: products.length + 1,
                title: product.title,
                price: product.price,
                oldPrice: product.oldPrice,
                category: product.category,
                rating: product.rating,
                reviews: product.reviews,
                badge: product.badge,
                image: product.image
            };
            products.push(newProduct);
        });
        
        localStorage.setItem('admin_products', JSON.stringify(products));
    }
}









function addSampleProducts() {
    // No default products - all products must be added through dashboard
}

function showWelcomeMessage() {
    showAlert('Welcome Admin! Dashboard loaded successfully.', 'success');
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const section = item.dataset.section;
            switchSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update page title
            const titles = {
                overview: 'Dashboard Overview',
                categories: 'Categories Management',
                products: 'Products Management',
                orders: 'Orders Management',
                users: 'Users Management'
            };
            const sectionTitle = titles[section];
            document.getElementById('pageTitle').textContent = sectionTitle;
            
            // Update mobile section indicator
            const mobileIndicator = document.getElementById('mobileSectionIndicator');
            if (mobileIndicator) {
                mobileIndicator.textContent = `Current: ${sectionTitle}`;
            }
            
            // Auto-hide sidebar on mobile after selection
            if (window.innerWidth <= 767) {
                const sidebar = document.querySelector('.sidebar');
                const backdrop = document.querySelector('.sidebar-backdrop');
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
                if (backdrop) {
                    backdrop.remove();
                }
            }
        });
    });
    
    // Setup form handlers
    document.getElementById('addCategoryForm').addEventListener('submit', handleAddCategory);
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('editProductForm').addEventListener('submit', handleEditProduct);
    document.getElementById('editCategoryForm').addEventListener('submit', handleEditCategory);
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Load section data
    switch(sectionName) {
        case 'categories':
            loadCategories();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

function loadDashboardData() {
    // Load data from localStorage if exists
    const savedCategories = localStorage.getItem('admin_categories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
    
    const savedProducts = localStorage.getItem('admin_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        // Fix IDs to be sequential
        products.forEach((product, index) => {
            product.id = index + 1;
        });
        localStorage.setItem('admin_products', JSON.stringify(products));
    }
    
    // Fix category IDs to be sequential
    categories.forEach((category, index) => {
        category.id = index + 1;
    });
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    
    // Update product category options
    updateProductCategoryOptions();
}

function updateStats() {
    // Update category counts
    categories.forEach(category => {
        category.count = products.filter(p => p.category.toLowerCase() === category.name.toLowerCase()).length;
    });
    
    // Update stats display
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalProducts').textContent = products.length;
    
    // Count orders from all users
    let totalOrders = 0;
    let totalUsers = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const userDataString = localStorage.getItem(key);
                if (userDataString && userDataString.startsWith('{')) {
                    const userData = JSON.parse(userDataString);
                    totalUsers++; // Only count valid users
                    if (userData.orders) {
                        totalOrders += userData.orders.length;
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Remove corrupted data
                localStorage.removeItem(key);
            }
        }
    }
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalUsers').textContent = totalUsers;
}

function loadCategories() {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td><i class="${category.icon}"></i></td>
            <td>${category.count}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.title}" class="product-img"></td>
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${product.rating} ⭐</td>
            <td>${product.reviews}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadOrders() {
    const tbody = document.getElementById('ordersTable');
    let allOrders = [];
    let orderCounter = 1;
    
    // Collect orders from all users and fix IDs
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const userDataString = localStorage.getItem(key);
                if (userDataString && userDataString.startsWith('{')) {
                    const userData = JSON.parse(userDataString);
                    if (userData.orders) {
                        userData.orders.forEach(order => {
                            order.id = orderCounter++;
                            allOrders.push({
                                ...order,
                                userEmail: userData.user.email,
                                userName: userData.user.name
                            });
                        });
                        localStorage.setItem(key, JSON.stringify(userData));
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
    
    tbody.innerHTML = allOrders.length ? allOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.userName}</td>
            <td>${order.date}</td>
            <td>$${order.total}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found</td></tr>';
}

function loadUsers() {
    const tbody = document.getElementById('usersTable');
    let users = [];
    
    // Collect users from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const userDataString = localStorage.getItem(key);
                if (userDataString && userDataString.startsWith('{')) {
                    const userData = JSON.parse(userDataString);
                    users.push({
                        ...userData.user,
                        ordersCount: userData.orders ? userData.orders.length : 0
                    });
                } else {
                    // Remove corrupted data
                    localStorage.removeItem(key);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Remove corrupted data
                localStorage.removeItem(key);
            }
        }
    }
    
    tbody.innerHTML = users.length ? users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.loginDate}</td>
            <td>${user.ordersCount}</td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.email}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px;">No users found</td></tr>';
}

// Modal functions
function showAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'block';
}

function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Reset form
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

// Category functions
function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    
    const newCategory = {
        id: categories.length + 1,
        name: name,
        icon: icon,
        count: 0
    };
    
    loading.show('جاري إضافة الفئة...', 1000).then(() => {
        categories.push(newCategory);
        localStorage.setItem('admin_categories', JSON.stringify(categories));
        
        // Update product category options
        updateProductCategoryOptions();
        
        hideModal('addCategoryModal');
        loadCategories();
        updateStats();
        notify.success(`تم إضافة فئة ${name} بنجاح!`, 'فئة جديدة');
    });
}

let editingCategoryId = null;

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        editingCategoryId = id;
        
        // Fill the edit form with current category data
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryIcon').value = category.icon;
        
        // Show the edit modal
        document.getElementById('editCategoryModal').style.display = 'block';
    }
}

function handleEditCategory(e) {
    e.preventDefault();
    
    if (editingCategoryId) {
        const category = categories.find(c => c.id === editingCategoryId);
        if (category) {
            category.name = document.getElementById('editCategoryName').value;
            category.icon = document.getElementById('editCategoryIcon').value;
            
            localStorage.setItem('admin_categories', JSON.stringify(categories));
            
            // Update product category options
            updateProductCategoryOptions();
            
            hideModal('editCategoryModal');
            loadCategories();
            updateStats();
            showAlert('Category updated successfully!', 'success');
            
            editingCategoryId = null;
        }
    }
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('admin_categories', JSON.stringify(categories));
        
        // Update product category options
        updateProductCategoryOptions();
        
        loadCategories();
        updateStats();
        showAlert('Category deleted successfully!', 'success');
    }
}

function updateProductCategoryOptions() {
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = `
        <option value="">Select Category</option>
        ${categories.map(category => `
            <option value="${category.name.toLowerCase()}">${category.name}</option>
        `).join('')}
    `;
}

// Product functions
function handleAddProduct(e) {
    e.preventDefault();
    
    const title = document.getElementById('productTitle').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const oldPrice = parseFloat(document.getElementById('productOldPrice').value) || price;
    const image = document.getElementById('productImage').value;
    const rating = parseFloat(document.getElementById('productRating').value) || 4.0;
    const reviews = parseInt(document.getElementById('productReviews').value) || 0;
    const badge = document.getElementById('productBadge').value || 'NEW';
    
    const newProduct = {
        id: products.length + 1,
        title: title,
        price: price,
        oldPrice: oldPrice,
        category: category,
        rating: rating,
        reviews: reviews,
        badge: badge,
        image: image
    };
    
    loading.show('جاري إضافة المنتج...', 1200).then(() => {
        products.push(newProduct);
        localStorage.setItem('admin_products', JSON.stringify(products));
        
        hideModal('addProductModal');
        loadProducts();
        updateStats();
        notify.success(`تم إضافة ${title} بنجاح!`, 'منتج جديد');
    });
}

let editingProductId = null;

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        editingProductId = id;
        
        // Fill the edit form with current product data
        document.getElementById('editProductTitle').value = product.title;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductOldPrice').value = product.oldPrice;
        document.getElementById('editProductImage').value = product.image;
        document.getElementById('editProductRating').value = product.rating;
        document.getElementById('editProductReviews').value = product.reviews;
        document.getElementById('editProductBadge').value = product.badge;
        
        // Show the edit modal
        document.getElementById('editProductModal').style.display = 'block';
    }
}

function handleEditProduct(e) {
    e.preventDefault();
    
    if (editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            product.title = document.getElementById('editProductTitle').value;
            product.category = document.getElementById('editProductCategory').value;
            product.price = parseFloat(document.getElementById('editProductPrice').value);
            product.oldPrice = parseFloat(document.getElementById('editProductOldPrice').value);
            product.image = document.getElementById('editProductImage').value;
            product.rating = parseFloat(document.getElementById('editProductRating').value);
            product.reviews = parseInt(document.getElementById('editProductReviews').value);
            product.badge = document.getElementById('editProductBadge').value;
            
            localStorage.setItem('admin_products', JSON.stringify(products));
            
            hideModal('editProductModal');
            loadProducts();
            updateStats();
            showAlert('Product updated successfully!', 'success');
            
            editingProductId = null;
        }
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('admin_products', JSON.stringify(products));
        
        // Remove from all user carts and wishlists
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === 'cart') {
                const cart = JSON.parse(localStorage.getItem('cart'));
                const updatedCart = cart.filter(item => item.id !== id);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
            }
            if (key === 'wishlist') {
                const wishlist = JSON.parse(localStorage.getItem('wishlist'));
                const updatedWishlist = wishlist.filter(item => item.id !== id);
                localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
            }
        }
        
        loadProducts();
        updateStats();
        showAlert('Product deleted successfully!', 'success');
    }
}

// User functions
function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user?')) {
        localStorage.removeItem(`user_${email}`);
        loadUsers();
        updateStats();
        showAlert('User deleted successfully!', 'success');
    }
}

// Clear all orders function
function clearAllOrders() {
    if (confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    const userDataString = localStorage.getItem(key);
                    if (userDataString && userDataString.startsWith('{')) {
                        const userData = JSON.parse(userDataString);
                        if (userData.orders) {
                            userData.orders = [];
                            localStorage.setItem(key, JSON.stringify(userData));
                        }
                    }
                } catch (error) {
                    console.error('Error clearing orders:', error);
                }
            }
        }
        loadOrders();
        updateStats();
        showAlert('All orders cleared successfully!', 'success');
    }
}

// Utility functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    
    // Add backdrop for mobile
    if (window.innerWidth <= 767) {
        if (sidebar.classList.contains('active')) {
            // Add backdrop
            if (!document.querySelector('.sidebar-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop';
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                `;
                backdrop.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sidebar.classList.remove('active');
                    backdrop.remove();
                });
                document.body.appendChild(backdrop);
            }
        } else {
            // Remove backdrop
            const backdrop = document.querySelector('.sidebar-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberLogin');
        window.location.href = 'index.html';
    }
}

function cleanCorruptedData() {
    if (confirm('Clean all corrupted data? This will remove invalid user entries.')) {
        let cleaned = 0;
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('user_')) {
                const value = localStorage.getItem(key);
                if (!value || !value.startsWith('{')) {
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            cleaned++;
        });
        
        // Update specific user date
        const userKey = 'user_aalhalabi517@gmail.com';
        const userData = localStorage.getItem(userKey);
        if (userData) {
            const user = JSON.parse(userData);
            user.user.loginDate = '16/9/2025';
            localStorage.setItem(userKey, JSON.stringify(user));
        }
        
        // Also clean security data
        localStorage.removeItem('currentSession');
        localStorage.removeItem('securityLogs');
        
        loadUsers();
        updateStats();
        showAlert(`Cleaned ${cleaned} corrupted entries! Updated user date.`, 'success');
    }
}

function viewOrder(orderId) {
    // Find the order from all users
    let foundOrder = null;
    let userName = '';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const userData = JSON.parse(localStorage.getItem(key));
                if (userData.orders) {
                    const order = userData.orders.find(o => o.id == orderId);
                    if (order) {
                        foundOrder = order;
                        userName = userData.user.name;
                        break;
                    }
                }
            } catch (error) {
                console.error('Error finding order:', error);
            }
        }
    }
    
    if (foundOrder) {
        // Create order details modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Order Details #${foundOrder.id}</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="order-details">
                    <div class="order-info">
                        <p><strong>Customer:</strong> ${userName}</p>
                        <p><strong>Date:</strong> ${foundOrder.date}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${foundOrder.status.toLowerCase()}">${foundOrder.status}</span></p>
                        <p><strong>Total:</strong> $${foundOrder.total}</p>
                    </div>
                    <div class="order-items">
                        <h4>Items:</h4>
                        <div class="items-list">
                            ${foundOrder.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                                    <div class="item-details">
                                        <p><strong>${item.title}</strong></p>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p>Price: $${item.price}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for order details
        const style = document.createElement('style');
        style.textContent = `
            .order-details {
                padding: 20px;
            }
            .order-info {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .order-info p {
                margin: 8px 0;
            }
            .items-list {
                max-height: 300px;
                overflow-y: auto;
            }
            .order-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px;
                border: 1px solid #eee;
                border-radius: 8px;
                margin-bottom: 10px;
            }
            .item-details p {
                margin: 2px 0;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
    } else {
        showAlert('Order not found!', 'error');
    }
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);