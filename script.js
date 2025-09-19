class Main {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.user = null;
        this.orders = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Load products from dashboard only
        const dashboardProducts = localStorage.getItem('admin_products');
        this.products = dashboardProducts ? JSON.parse(dashboardProducts) : [];

        this.currentFilter = 'all';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.loadUserSession();
        this.checkForProductUpdates();
        this.loadCategories();
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartCount();
        this.updateWishlistCount();
        this.startHeroSlideshow();
        this.initTheme();
        this.updateLoginLogoutIcon();

        // Check for product updates when window gets focus
        window.addEventListener('focus', () => {
            this.checkForProductUpdates();
            this.loadCategories();
        });
    }
    
    checkForProductUpdates() {
        // Always sync with dashboard products
        const dashboardProducts = localStorage.getItem('admin_products');
        this.products = dashboardProducts ? JSON.parse(dashboardProducts) : [];
        this.renderProducts();
    }
    
    loadCategories() {
        const dashboardCategories = localStorage.getItem('admin_categories');
        if (dashboardCategories) {
            const categories = JSON.parse(dashboardCategories);
            this.renderCategories(categories);
            this.renderFilterButtons(categories);
        }
    }
    
    renderCategories(categories) {
        const categoryGrid = document.querySelector('.category-grid');
        categoryGrid.innerHTML = categories.map(category => `
            <div class="category-item" data-category="${category.name.toLowerCase()}">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
            </div>
        `).join('');
        
        // Re-setup category click events
        this.setupCategoryEvents(categories);
    }
    
    renderFilterButtons(categories) {
        const filterButtons = document.querySelector('.filter-buttons');
        filterButtons.innerHTML = `
            <button class="filter-btn active" data-filter="all">All</button>
            ${categories.map(category => `
                <button class="filter-btn" data-filter="${category.name.toLowerCase()}">${category.name}</button>
            `).join('')}
        `;
        
        // Re-setup filter events
        this.setupFilterEvents();
    }
    
    setupCategoryEvents(categories) {
        document.querySelectorAll('.category-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const category = categories[index].name.toLowerCase();
                this.currentFilter = category;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const filterBtn = document.querySelector(`[data-filter="${category}"]`);
                if (filterBtn) filterBtn.classList.add('active');
                this.renderProducts();
                document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    setupFilterEvents() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderProducts();
            });
        });
    }
    
    startHeroSlideshow() {
        const slides = document.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 1500);
    }
    
    loadUserSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const userDataString = localStorage.getItem(`user_${currentUser}`);
                if (userDataString) {
                    // Try to parse as regular JSON first
                    let userData;
                    try {
                        userData = JSON.parse(userDataString);
                    } catch (e) {
                        // If that fails, try to decrypt using security manager
                        if (window.securityManager) {
                            userData = window.securityManager.getSecureItem(`user_${currentUser}`);
                        }
                    }
                    
                    if (userData) {
                        this.user = userData.user;
                        this.orders = userData.orders || [];

                        // Load user's saved cart and wishlist
                        if (userData.cart) {
                            this.cart = userData.cart;
                            localStorage.setItem('cart', JSON.stringify(this.cart));
                        } else {
                            this.cart = [];
                            localStorage.removeItem('cart');
                        }
                        if (userData.wishlist) {
                            this.wishlist = userData.wishlist;
                            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
                        } else {
                            this.wishlist = [];
                            localStorage.removeItem('wishlist');
                        }
                    }
                }
                // Merge guest cart with user cart
                const guestCartString = localStorage.getItem('guest_cart');
                if (guestCartString) {
                    const guestCart = JSON.parse(guestCartString);
                    guestCart.forEach(item => {
                        const existing = this.cart.find(ci => ci.id === item.id);
                        if (existing) {
                            existing.quantity += item.quantity;
                        } else {
                            this.cart.push(item);
                        }
                    });
                    localStorage.removeItem('guest_cart');
                    this.saveCartToStorage();
                }
            } catch (error) {
                console.error('Error loading user session:', error);
                // Clear corrupted data
                localStorage.removeItem('currentUser');
                localStorage.removeItem(`user_${currentUser}`);
            }
        } else {
            // Load guest cart if no user logged in
            const guestCartString = localStorage.getItem('guest_cart');
            if (guestCartString) {
                this.cart = JSON.parse(guestCartString);
            }
        }
    }

    setupEventListeners() {


        // Search functionality with debounce
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        let searchTimeout;
        
        searchBtn.addEventListener('click', () => this.handleSearch());
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchTimeout);
                this.handleSearch();
            }
        });
        
        // Add debounced search on input
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const value = e.target.value.trim();
            
            if (value.length === 0) {
                this.hideSearchModal();
                return;
            }
            
            if (value.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.handleSearch();
                }, 300);
            }
        });
        
        // Search modal
        document.getElementById('closeSearch').addEventListener('click', () => {
            this.hideSearchModal();
        });
        
        document.getElementById('searchModal').addEventListener('click', (e) => {
            if (e.target.id === 'searchModal') {
                this.hideSearchModal();
            }
        });
        
        document.getElementById('closeCheckout').addEventListener('click', () => {
            document.getElementById('checkoutModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Cart modal
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.showCartModal();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.hideCartModal();
        });

        // Close modal when clicking outside
        document.getElementById('cartModal').addEventListener('click', (e) => {
            if (e.target.id === 'cartModal') {
                this.hideCartModal();
            }
        });



        // Wishlist modal
        document.getElementById('wishlistIcon').addEventListener('click', () => {
            this.showWishlistModal();
        });

        document.getElementById('closeWishlist').addEventListener('click', () => {
            this.hideWishlistModal();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });





        document.getElementById('wishlistModal').addEventListener('click', (e) => {
            if (e.target.id === 'wishlistModal') {
                this.hideWishlistModal();
            }
        });

        // Hero button
        document.querySelector('.hero-btn').addEventListener('click', () => {
            document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
        });



        // Back to top button
        const backToTopBtn = document.getElementById('backToTop');
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Navbar scroll effect and back to top button
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            
            // Show/hide back to top button
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
            
            // Navbar background effect
            if (this.isDarkMode) {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(30, 30, 30, 0.98)';
                    navbar.style.boxShadow = '0 2px 25px rgba(255,255,255,0.15)';
                } else {
                    navbar.style.background = 'rgba(30, 30, 30, 0.95)';
                    navbar.style.boxShadow = '0 2px 20px rgba(255,255,255,0.1)';
                }
            } else {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 25px rgba(0,0,0,0.15)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
                }
            }
        });
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const filteredProducts = this.currentFilter === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === this.currentFilter);

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" class="product-img">
                    <button class="wishlist-btn" onclick="main.toggleWishlist(${product.id})">
                        <i class="${this.isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <div class="product-badge">${product.badge}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        <span class="current-price">$${product.price}</span>
                        <span class="old-price">$${product.oldPrice}</span>
                    </div>
                    <div class="product-rating">
                        <div class="stars">${this.generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.reviews} reviews)</span>
                    </div>
                    <button class="add-to-cart" onclick="main.addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Add animation to product cards
        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach((card, index) => {
                card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
            });
        }, 100);
        
        // Apply current theme to newly rendered products
        if (this.isDarkMode) {
            this.applyDarkMode();
        } else {
            this.applyLightMode();
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    toggleWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        const existingIndex = this.wishlist.findIndex(item => item.id === productId);

        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
        } else {
            this.wishlist.push(product);
        }

        this.updateWishlistCount();
        this.renderProducts();
        this.saveCartToStorage();
        this.saveWishlistToStorage();
    }

    updateWishlistCount() {
        document.getElementById('wishlistCount').textContent = this.wishlist.length;
    }

    showUserModal() {
        document.getElementById('userModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.updateProfileDisplay();
    }
    
    updateProfileDisplay() {
        const loginLink = document.querySelector('.login-link');
        const profileMenuLinks = document.querySelectorAll('.profile-menu a:not(.login-link)');
        
        if (this.user) {
            loginLink.style.display = 'none';
            profileMenuLinks.forEach(link => link.style.display = 'block');
        } else {
            loginLink.style.display = 'block';
            profileMenuLinks.forEach(link => link.style.display = 'none');
        }
    }

    hideUserModal() {
        document.getElementById('userModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showWishlistModal() {
        document.getElementById('wishlistModal').style.display = 'block';
        this.renderWishlistItems();
        document.body.style.overflow = 'hidden';
    }

    hideWishlistModal() {
        document.getElementById('wishlistModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    renderWishlistItems() {
        const wishlistItems = document.getElementById('wishlistItems');
        
        if (this.wishlist.length === 0) {
            wishlistItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No items in wishlist</div>';
            return;
        }

        wishlistItems.innerHTML = this.wishlist.map(item => `
            <div class="wishlist-item" id="wishlist-item-${item.id}">
                <img src="${item.image}" alt="${item.title}" class="wishlist-item-img">
                <div class="wishlist-item-info">
                    <h4>${item.title}</h4>
                    <p>$${item.price}</p>
                    <button class="add-to-cart-from-wishlist" onclick="main.addToCart(${item.id})">
                        Add to Cart
                    </button>
                </div>
                <button class="remove-from-wishlist" onclick="main.removeFromWishlistModal(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    removeFromWishlistModal(productId) {
        const wishlistItem = document.getElementById(`wishlist-item-${productId}`);
        if (wishlistItem) {
            wishlistItem.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                this.toggleWishlist(productId);
                this.renderWishlistItems();
            }, 300);
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        const existingItem = this.cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.updateCartCount();
        this.saveCartToStorage();
        this.showAddToCartAnimation();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartCount();
        this.renderCartItems();
        this.saveCartToStorage();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCartCount();
                this.renderCartItems();
                this.saveCartToStorage();
            }
        }
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
    }

    showCartModal() {
        document.getElementById('cartModal').style.display = 'block';
        this.renderCartItems();
        document.body.style.overflow = 'hidden';
    }

    hideCartModal() {
        document.getElementById('cartModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Cart is empty</div>';
            cartTotal.textContent = '0';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="main.updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="main.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="quantity-btn" onclick="main.removeFromCart(${item.id})" style="background: #ff6b6b; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total;
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.hideSearchModal();
            return;
        }

        // Add loading state
        const searchBtn = document.getElementById('searchBtn');
        const originalHTML = searchBtn.innerHTML;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;

        // Use setTimeout to prevent blocking
        setTimeout(() => {
            try {
                const filteredProducts = this.products.filter(product => 
                    product.title.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );

                this.showSearchModal(filteredProducts, searchTerm);
            } catch (error) {
                console.error('Search error:', error);
                alert('Search failed. Please try again.');
            } finally {
                // Restore button state
                searchBtn.innerHTML = originalHTML;
                searchBtn.disabled = false;
            }
        }, 100);
    }
    
    showSearchModal(products, searchTerm) {
        const searchResults = document.getElementById('searchResults');
        
        if (products.length === 0) {
            searchResults.innerHTML = `
                <div class="no-search-results">
                    <i class="fas fa-search"></i>
                    <h4>No products found</h4>
                    <p>No results for "${searchTerm}"</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = `
                <div class="search-info">
                    <p>Found ${products.length} result${products.length !== 1 ? 's' : ''} for "${searchTerm}"</p>
                </div>
                <div class="search-products-grid">
                    ${products.map(product => `
                        <div class="search-product-item">
                            <div class="search-product-image">
                                <img src="${product.image}" alt="${product.title}">
                                <div class="search-product-badge">${product.badge}</div>
                            </div>
                            <div class="search-product-info">
                                <h4>${product.title}</h4>
                                <div class="search-product-price">
                                    <span class="price">$${product.price}</span>
                                    <span class="old-price">$${product.oldPrice}</span>
                                </div>
                                <div class="search-product-rating">
                                    <div class="stars">${this.generateStars(product.rating)}</div>
                                    <span>(${product.reviews})</span>
                                </div>
                                <div class="search-product-actions">
                                    <button class="search-add-cart" onclick="main.addToCart(${product.id}); main.hideSearchModal();">
                                        <i class="fas fa-shopping-cart"></i> Add to Cart
                                    </button>
                                    <button class="search-wishlist" onclick="main.toggleWishlist(${product.id})">
                                        <i class="${this.isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        document.getElementById('searchModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    hideSearchModal() {
        document.getElementById('searchModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('searchInput').value = '';
    }
    
    handleCheckout() {
        if (!this.user) {
            alert('Please login through the main login page to checkout');
            window.location.href = 'login.html';
            return;
        }
        this.showCheckoutModal();
    }
    
    showLogin() {
        document.getElementById('loginModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    showRegister() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'block';
    }
    
    validateEmail(email) {
        const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailPattern.test(email);
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        if (!this.validateEmail(email)) {
            alert('Email must be in format ******@gmail.com');
            return;
        }

        const savedUserData = localStorage.getItem(`user_${email}`);

        if (!savedUserData) {
            alert('Account not found. Please create a new account.');
            this.showRegister();
            return;
        }

        const userData = JSON.parse(savedUserData);

        if (userData.user.password !== password) {
            alert('Incorrect password. Please try again.');
            return;
        }

        this.user = userData.user;
        this.orders = userData.orders || [];

        // Load user's saved cart and wishlist into global keys
        if (userData.cart) {
            this.cart = userData.cart;
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } else {
            this.cart = [];
            localStorage.removeItem('cart');
        }
        if (userData.wishlist) {
            this.wishlist = userData.wishlist;
            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        } else {
            this.wishlist = [];
            localStorage.removeItem('wishlist');
        }

        localStorage.setItem('currentUser', email);

        document.getElementById('loginModal').style.display = 'none';
        document.body.style.overflow = 'auto';

        this.updateCartCount();
        this.updateWishlistCount();
        this.updateUserProfile();
        this.updateProfileDisplay();

        if (this.cart.length > 0) {
            this.showCheckoutModal();
        }
    }
    
    register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        if (!this.validateEmail(email)) {
            alert('Email must be in format ******@gmail.com');
            return;
        }
        
        const existingUser = localStorage.getItem(`user_${email}`);
        if (existingUser) {
            alert('This email is already registered. Please use a different email or login.');
            return;
        }
        
        // Format date as DD/MM/YYYY
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        now.getDate()
        this.user = {
            name: name,
            email: email,
            password: password,
            loginDate: formattedDate
        };
        this.orders = [];
        
        localStorage.setItem('currentUser', email);
        this.saveUserData();
        
        document.getElementById('registerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        this.updateUserProfile();
        this.updateProfileDisplay();
        
        if (this.cart.length > 0) {
            this.showCheckoutModal();
        }
    }
    
    updateUserProfile() {
        const profileInfo = document.querySelector('.profile-info');
        if (this.user) {
            const userAvatar = this.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
            profileInfo.innerHTML = `
                <div class="profile-avatar">
                    <img src="${userAvatar}" alt="${this.user.name}" class="user-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <i class="fas fa-user-circle" style="display: none;"></i>
                </div>
                <h4>Welcome ${this.user.name}!</h4>
                <p>${this.user.email}</p>
                <small>Member since ${this.user.loginDate}</small>
            `;
        }
    }
    
    showCheckoutModal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const checkoutContent = document.getElementById('checkoutContent');
        
        checkoutContent.innerHTML = `
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                <div class="checkout-items">
                    ${this.cart.map(item => `
                        <div class="checkout-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="checkout-item-info">
                                <h5>${item.title}</h5>
                                <p>Qty: ${item.quantity} × $${item.price}</p>
                            </div>
                            <span class="checkout-item-total">$${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="checkout-total">
                    <strong>Total: $${total}</strong>
                </div>
                <button class="complete-order-btn" onclick="main.completeOrder()">Complete Order</button>
            </div>
        `;
        
        document.getElementById('checkoutModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    completeOrder() {
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        
        const order = {
            id: this.orders.length + 1,
            date: formattedDate,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Completed'
        };
        
        this.orders.push(order);
        this.cart = [];
        this.updateCartCount();
        this.saveCartToStorage();
        
        // Save updated user data with new order
        this.saveUserData();
        
        document.getElementById('checkoutModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        alert('Order completed successfully!');
    }
    
    showOrders() {
        const profileMenu = document.querySelector('.profile-menu');
        profileMenu.innerHTML = `
            <div class="orders-list">
                <button onclick="main.showUserProfile()" class="back-btn">← Back to Profile</button>
                <h4>My Orders</h4>
                ${this.orders.length === 0 ? '<p>No orders yet</p>' : 
                    this.orders.map(order => `
                        <div class="order-item">
                            <div class="order-header">
                                <strong>Order #${order.id}</strong>
                                <span class="order-date">${order.date}</span>
                            </div>
                            <div class="order-items">
                                ${order.items.map(item => `
                                    <div class="order-product">
                                        <img src="${item.image}" alt="${item.title}">
                                        <span>${item.title} (${item.quantity}x)</span>
                                        <span>$${item.price * item.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-total">Total: $${order.total}</div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }
    
    showUserProfile() {
        const profileMenu = document.querySelector('.profile-menu');
        profileMenu.innerHTML = `
            <a href="#" onclick="main.showOrders()"><i class="fas fa-box"></i> My Orders</a>
            <a href="#" onclick="main.showWishlistModal()"><i class="fas fa-heart"></i> Wishlist</a>
            <a href="#" onclick="main.showSettings()"><i class="fas fa-cog"></i> Settings</a>
        `;
    }
    
    saveUserData() {
        if (this.user) {
            const userData = {
                user: this.user,
                orders: this.orders,
                cart: this.cart,
                wishlist: this.wishlist
            };
            // Save as regular JSON to avoid encryption issues
            localStorage.setItem(`user_${this.user.email}`, JSON.stringify(userData));
        }
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Automatically save current cart and wishlist to user's account data
            if (this.user) {
                const userData = JSON.parse(localStorage.getItem(`user_${this.user.email}`)) || { user: this.user, orders: [] };
                userData.cart = this.cart;
                userData.wishlist = this.wishlist;
                localStorage.setItem(`user_${this.user.email}`, JSON.stringify(userData));
            }

            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('cart'); // Remove global cart
            localStorage.removeItem('wishlist'); // Remove global wishlist
            localStorage.removeItem('guest_cart'); // Remove guest cart

            // Reset instance variables
            this.cart = [];
            this.wishlist = [];
            this.user = null;
            this.orders = [];

            // Update UI
            this.updateCartCount();
            this.updateWishlistCount();
            this.updateLoginLogoutIcon();

            window.location.href = 'shop.html'; // Stay on shop as guest
        }
    }

    showAddToCartAnimation() {
        const cartIcon = document.getElementById('cartIcon');
        cartIcon.style.animation = 'none';
        setTimeout(() => {
            cartIcon.style.animation = 'bounce 0.6s ease';
        }, 10);

        // Show success message
        const message = document.createElement('div');
        message.textContent = 'Product added to cart!';
        message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 3000;
            animation: slideInRight 0.5s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    initTheme() {
        if (this.isDarkMode) {
            this.applyDarkMode();
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            this.applyLightMode();
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    applyDarkMode() {
        const styles = {
            body: 'background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #e0e0e0;',
            '.navbar': 'background: rgba(30, 30, 30, 0.95) !important; box-shadow: 0 2px 20px rgba(255,255,255,0.1);',
            '.hero': 'background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); color: #e0e0e0;',
            '.hero-content h1': 'color: #e0e0e0;',
            '.hero-content p': 'color: #bbb;',
            '.nav-search': 'background: #3a3a3a; color: #e0e0e0;',
            '.nav-search input': 'color: #e0e0e0;',
            '.nav-icon i': 'color: #e0e0e0;',
            '.categories': 'background: #1a1a1a;',
            '.categories h2': 'color: #e0e0e0;',
            '.category-item h3': 'color: #e0e0e0;',
            '.products': 'background: #2d2d2d;',
            '.products h2': 'color: #e0e0e0;',
            '.filter-btn': 'background: #3a3a3a; border-color: #555; color: #e0e0e0;',
            '.product-card': 'background: #3a3a3a; box-shadow: 0 5px 20px rgba(0,0,0,0.3);',
            '.product-title': 'color: #e0e0e0;',
            '.rating-text': 'color: #bbb;',
            '.footer': 'background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);',
            '.cart-content, .modal-content': 'background: #3a3a3a; color: #e0e0e0;',
            '.wishlist-item-info h4': 'color: #e0e0e0;',

        };
        this.applyStyles(styles);
    }
    
    applyLightMode() {
        const styles = {
            body: 'background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); color: #333;',
            '.navbar': 'background: rgba(255, 255, 255, 0.95) !important; box-shadow: 0 2px 20px rgba(0,0,0,0.1);',
            '.hero': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
            '.hero-content h1': 'color: white;',
            '.hero-content p': 'color: rgba(255, 255, 255, 0.9);',
            '.nav-search': 'background: #e9ecef; border: 1px solid #dee2e6; color: #333;',
            '.nav-search input': 'color: #333;',
            '.nav-icon i': 'color: #333;',
            '.categories': 'background: #ffffff;',
            '.categories h2': 'color: #333;',
            '.category-item h3': 'color: #333;',
            '.products': 'background: #f8f9fa;',
            '.products h2': 'color: #333;',
            '.filter-btn': 'background: white; border-color: #ddd; color: #333;',
            '.product-card': 'background: white; box-shadow: 0 5px 20px rgba(0,0,0,0.1);',
            '.product-title': 'color: #333;',
            '.rating-text': 'color: #0f0f0fff;',
            '.footer': 'background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);',
            '.cart-content, .modal-content': 'background: white; color: #333;',

        };
        this.applyStyles(styles);
    }
    
    applyStyles(styles) {
        Object.keys(styles).forEach(selector => {
            const elements = selector === 'body' ? [document.body] : document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) element.style.cssText += styles[selector];
            });
        });
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        
        if (this.isDarkMode) {
            this.applyDarkMode();
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            this.applyLightMode();
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Apply navbar style immediately
        const navbar = document.querySelector('.navbar');
        if (this.isDarkMode) {
            navbar.style.background = window.scrollY > 100 ? 'rgba(30, 30, 30, 0.98)' : 'rgba(30, 30, 30, 0.95)';
            navbar.style.boxShadow = window.scrollY > 100 ? '0 2px 25px rgba(255,255,255,0.15)' : '0 2px 20px rgba(255,255,255,0.1)';
        } else {
            navbar.style.background = window.scrollY > 100 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = window.scrollY > 100 ? '0 2px 25px rgba(0,0,0,0.15)' : '0 2px 20px rgba(0,0,0,0.1)';
        }
    }
    
    updateLoginLogoutIcon() {
        const btn = document.getElementById('loginLogoutBtn');
        if (this.user) {
            btn.innerHTML = 'Logout';
            btn.title = 'Logout';
            btn.onclick = () => this.logout();
        } else {
            btn.innerHTML = 'Login';
            btn.title = 'Login';
            btn.onclick = () => window.location.href = 'login.html';
        }
    }

    saveCartToStorage() {
        if (this.user) {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            // Save cart to user's account data
            const userData = JSON.parse(localStorage.getItem(`user_${this.user.email}`)) || { user: this.user, orders: [] };
            userData.cart = this.cart;
            localStorage.setItem(`user_${this.user.email}`, JSON.stringify(userData));
        } else {
            localStorage.setItem('guest_cart', JSON.stringify(this.cart));
        }
    }

    saveWishlistToStorage() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        if (this.user) {
            // Save wishlist to user's account data
            const userData = JSON.parse(localStorage.getItem(`user_${this.user.email}`)) || { user: this.user, orders: [] };
            userData.wishlist = this.wishlist;
            localStorage.setItem(`user_${this.user.email}`, JSON.stringify(userData));
        }
    }
    
    showForgotPassword() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('forgotPasswordModal').style.display = 'block';
    }
    
    backToLogin() {
        document.getElementById('forgotPasswordModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    showSettings() {
        const profileMenu = document.querySelector('.profile-menu');
        profileMenu.innerHTML = `
            <div class="settings-section">
                <button onclick="main.showUserProfile()" class="back-btn">← Back to Profile</button>
                <h4>Account Settings</h4>
                <div class="settings-options">
                    <a href="#" onclick="main.showEditProfile()"><i class="fas fa-user-edit"></i> Edit Profile</a>
                    <a href="#" onclick="main.deleteAccount()" style="color: #ff6b6b;"><i class="fas fa-trash"></i> Delete Account</a>
                </div>
            </div>
        `;
    }
    
    showEditProfile() {
        const profileMenu = document.querySelector('.profile-menu');
        const userAvatar = this.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
        profileMenu.innerHTML = `
            <div class="edit-profile-section">
                <button onclick="main.showSettings()" class="back-btn">← Back to Settings</button>
                <h4>Edit Profile</h4>
                <div class="edit-form">
                    <div class="avatar-section">
                        <img src="${userAvatar}" alt="Avatar" class="current-avatar" id="currentAvatar">
                        <input type="url" id="newAvatar" placeholder="Avatar URL" value="${userAvatar}">
                        <button onclick="main.updateAvatar()" class="update-btn">Update Avatar</button>
                    </div>
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" id="editName" value="${this.user.name}">
                        <button onclick="main.updateName()" class="update-btn">Update</button>
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="editEmail" value="${this.user.email}">
                        <button onclick="main.updateEmail()" class="update-btn">Update</button>
                    </div>
                    <div class="form-group">
                        <label>New Password:</label>
                        <input type="password" id="newPassword" placeholder="Enter new password">
                        <button onclick="main.updatePassword()" class="update-btn">Update</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateAvatar() {
        const newAvatar = document.getElementById('newAvatar').value;
        if (!newAvatar) {
            alert('Please enter avatar URL');
            return;
        }
        this.user.avatar = newAvatar;
        this.saveUserData();
        this.updateUserProfile();
        document.getElementById('currentAvatar').src = newAvatar;
        alert('Avatar updated successfully!');
    }
    
    updateName() {
        const newName = document.getElementById('editName').value;
        if (!newName) {
            alert('Please enter a name');
            return;
        }
        this.user.name = newName;
        this.saveUserData();
        this.updateUserProfile();
        alert('Name updated successfully!');
    }
    
    updateEmail() {
        const newEmail = document.getElementById('editEmail').value;
        if (!newEmail) {
            alert('Please enter an email');
            return;
        }
        if (!this.validateEmail(newEmail)) {
            alert('Email must be in format ******@gmail.com');
            return;
        }
        if (newEmail === this.user.email) {
            alert('This is already your current email');
            return;
        }
        
        const existingUser = localStorage.getItem(`user_${newEmail}`);
        if (existingUser) {
            alert('This email is already registered');
            return;
        }
        
        const oldEmail = this.user.email;
        this.user.email = newEmail;
        
        localStorage.removeItem(`user_${oldEmail}`);
        localStorage.setItem('currentUser', newEmail);
        this.saveUserData();
        this.updateUserProfile();
        alert('Email updated successfully!');
    }
    
    updatePassword() {
        const newPassword = document.getElementById('newPassword').value;
        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        this.user.password = newPassword;
        this.saveUserData();
        alert('Password updated successfully!');
        document.getElementById('newPassword').value = '';
    }
    
    deleteAccount() {
        if (!this.user) {
            alert('No user logged in');
            return;
        }
        
        const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) {
            return;
        }
        
        const email = this.user.email;
        
        // Delete user data
        localStorage.removeItem(`user_${email}`);
        localStorage.removeItem('currentUser');
        
        // Reset data
        this.user = null;
        this.orders = [];
        this.cart = [];
        this.wishlist = [];
        
        // Update local storage
        this.saveCartToStorage();
        this.saveWishlistToStorage();
        this.updateCartCount();
        this.updateWishlistCount();
        
        // Close user modal
        this.hideUserModal();
        
        // Update profile interface
        const profileInfo = document.querySelector('.profile-info');
        profileInfo.innerHTML = `
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <h4>Welcome!</h4>
            <p>Please login to access your account</p>
        `;
        
        this.showUserProfile();
        this.updateProfileDisplay();
        
        alert('Account deleted successfully');
    }

    sendResetCode() {
        const email = document.getElementById('forgotEmail').value;
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        if (!this.validateEmail(email)) {
            alert('Email must be in format ******@gmail.com');
            return;
        }
        
        const userData = localStorage.getItem(`user_${email}`);
        if (!userData) {
            alert('Email not found. Please check your email or create a new account.');
            return;
        }
        
        // Generate random reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(`resetCode_${email}`, resetCode);
        
        // Simulate email sending
        alert(`Reset code sent to ${email}\nYour code is: ${resetCode}\n(In real app, this would be sent via email)`);
        
        document.getElementById('resetCodeSection').style.display = 'block';
    }
    
    resetPassword() {
        const email = document.getElementById('forgotEmail').value;
        const enteredCode = document.getElementById('resetCode').value;
        const newPassword = document.getElementById('newPassword').value;
        
        if (!enteredCode || !newPassword) {
            alert('Please enter both reset code and new password');
            return;
        }
        
        const savedCode = localStorage.getItem(`resetCode_${email}`);
        if (enteredCode !== savedCode) {
            alert('Invalid reset code. Please try again.');
            return;
        }
        
        // Update password
        const userData = JSON.parse(localStorage.getItem(`user_${email}`));
        userData.user.password = newPassword;
        localStorage.setItem(`user_${email}`, JSON.stringify(userData));
        
        // Delete reset code
        localStorage.removeItem(`resetCode_${email}`);
        
        alert('Password reset successfully! You can now login with your new password.');
        
        document.getElementById('forgotPasswordModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Clear fields
        document.getElementById('forgotEmail').value = '';
        document.getElementById('resetCode').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('resetCodeSection').style.display = 'none';
    }
}

// Add bounce animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
    
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

// Initialize the application
const main = new Main();

// Add smooth scrolling for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Newsletter subscription
    const newsletterBtn = document.querySelector('.newsletter button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const email = this.previousElementSibling.value;
            if (email) {
                alert('Thank you for subscribing to our newsletter!');
                this.previousElementSibling.value = '';
            }
        });
    }

    // Add hover effects to social icons
    document.querySelectorAll('.social-icons a').forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});