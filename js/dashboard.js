document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data from localStorage or create default
    let user = JSON.parse(localStorage.getItem('user')) || {
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        cart: [],
        wishlist: [],
        orders: []
    };
    localStorage.setItem('user', JSON.stringify(user));

    // Initialize products from localStorage or create default
    let products = JSON.parse(localStorage.getItem('products')) || [
        {
            id: 1,
            name: 'Organic Apples',
            category: 'fruits',
            price: 2.99,
            originalPrice: 3.49,
            image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            rating: 4.5,
            reviews: 24,
            description: 'Fresh organic apples from local farms. Crisp and sweet with a perfect balance of tartness.',
            badge: 'Organic',
            brand: 'FoodMart',
            organic: true
        },
        {
            id: 2,
            name: 'Fresh Carrots',
            category: 'vegetables',
            price: 1.49,
            originalPrice: 1.99,
            image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            rating: 4.2,
            reviews: 18,
            description: 'Sweet and crunchy carrots, packed with vitamins and perfect for snacking or cooking.',
            badge: 'Fresh',
            brand: 'VeggieCo'
        }
    ];
    
    // Check if there are any shop products that should be added to the user-facing products
    const shopProducts = JSON.parse(localStorage.getItem('shopProducts')) || [];
    shopProducts.forEach(shopProduct => {
        // Check if product already exists in user products
        const existingProduct = products.find(p => p.id === parseInt(shopProduct.id));
        if (!existingProduct) {
            // Add shop product to user products
            products.push({
                id: parseInt(shopProduct.id),
                name: shopProduct.name,
                category: shopProduct.category,
                price: shopProduct.price,
                originalPrice: Math.round(shopProduct.price * 1.1 * 100) / 100, // 10% markup
                image: shopProduct.image || 'https://via.placeholder.com/300',
                rating: 4.0 + Math.random(), // Random rating between 4.0-5.0
                reviews: Math.floor(Math.random() * 20), // Random reviews 0-20
                description: shopProduct.description,
                badge: shopProduct.status === 'active' ? 'New' : '',
                brand: JSON.parse(localStorage.getItem('shopSettings'))?.name || 'Generic',
                organic: false
            });
        }
    });
    
    localStorage.setItem('products', JSON.stringify(products));

    // Update user info in header
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        const userImg = userInfo.querySelector('img');
        const userName = userInfo.querySelector('span');
        
        userImg.src = user.avatar;
        userName.textContent = user.name;
        
        userInfo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = 'profile.html';
        });
    }

    // DOM Elements
    const userDropdown = document.getElementById('userDropdown');
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const dashboardToggle = document.getElementById('dashboardToggle');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    const closeDashboard = document.getElementById('closeDashboard');
    const dashboardOverlay = document.getElementById('dashboardOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const quickViewModal = document.getElementById('quickViewModal');
    const closeQuickView = document.getElementById('closeQuickView');
    const quickViewOverlay = document.getElementById('quickViewOverlay');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const closeWishlist = document.getElementById('closeWishlist');
    const viewWishlist = document.getElementById('viewWishlist');
    const sidebarWishlist = document.getElementById('sidebarWishlist');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const categoryNav = document.getElementById('categoryNav');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogout = document.getElementById('sidebarLogout');
    const searchBtn = document.getElementById('searchBtn');
    const productsGrid = document.getElementById('productsGrid');

    // Initialize state
    let cart = user.cart || [];
    let wishlist = user.wishlist || [];
    let currentSlide = 0;

    // Constants for calculations
    const SHIPPING_COST = 5.99; // Flat rate shipping
    const TAX_RATE = 0.08; // 8% tax rate

    // Update cart count
    updateCartCount();
    updateWishlistCount();

    // User dropdown toggle
    if (userDropdown) {
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (userDropdown) userDropdown.classList.remove('show');
    });

    // Logout functionality
    function handleLogout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Cart sidebar toggle
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            updateCartUI();
        });
    }

    // Close cart sidebar
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    // Dashboard sidebar toggle
    if (dashboardToggle) {
        dashboardToggle.addEventListener('click', function() {
            dashboardSidebar.classList.add('active');
            dashboardOverlay.classList.add('active');
            updateDashboardUserInfo();
        });
    }

    // Update dashboard user info
    function updateDashboardUserInfo() {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const memberSince = document.getElementById('memberSince');
        
        if (userAvatar) userAvatar.src = user.avatar;
        if (userName) userName.textContent = user.name;
        if (userEmail) userEmail.textContent = user.email;
        if (memberSince) {
            const regDate = user.registrationDate ? new Date(user.registrationDate) : new Date();
            memberSince.textContent = regDate.getFullYear();
        }
    }

    // Close dashboard sidebar
    if (closeDashboard) {
        closeDashboard.addEventListener('click', function() {
            dashboardSidebar.classList.remove('active');
            dashboardOverlay.classList.remove('active');
        });
    }

    if (dashboardOverlay) {
        dashboardOverlay.addEventListener('click', function() {
            dashboardSidebar.classList.remove('active');
            dashboardOverlay.classList.remove('active');
        });
    }

    // Checkout modal
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            checkoutModal.classList.add('active');
            checkoutOverlay.classList.add('active');
            updateCheckoutUI();
            
            document.getElementById('step1').classList.add('active');
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.remove('active');
            document.getElementById('shippingContent').classList.add('active');
            document.getElementById('paymentContent').classList.remove('active');
            document.getElementById('confirmationContent').classList.remove('active');
        });
    }

    if (closeCheckout) {
        closeCheckout.addEventListener('click', function() {
            checkoutModal.classList.remove('active');
            checkoutOverlay.classList.remove('active');
        });
    }

    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', function() {
            checkoutModal.classList.remove('active');
            checkoutOverlay.classList.remove('active');
        });
    }

    // Quick view modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-quick-view')) {
            const productId = parseInt(e.target.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                showQuickView(product);
            }
        }
    });

    // Quick view quantity controls
    const quantityMinus = document.getElementById('quantityMinus');
    const quantityPlus = document.getElementById('quantityPlus');
    
    if (quantityMinus) {
        quantityMinus.addEventListener('click', function() {
            const quantityInput = document.getElementById('quantityInput');
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });
    }
    
    if (quantityPlus) {
        quantityPlus.addEventListener('click', function() {
            const quantityInput = document.getElementById('quantityInput');
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    }

    if (closeQuickView) {
        closeQuickView.addEventListener('click', function() {
            quickViewModal.classList.remove('active');
            quickViewOverlay.classList.remove('active');
        });
    }

    if (quickViewOverlay) {
        quickViewOverlay.addEventListener('click', function() {
            quickViewModal.classList.remove('active');
            quickViewOverlay.classList.remove('active');
        });
    }

    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-to-cart')) {
            e.preventDefault();
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId, 1);
        }
    });

    // Quick view add to cart
    const quickAddToCart = document.getElementById('quickAddToCart');
    if (quickAddToCart) {
        quickAddToCart.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const quantity = parseInt(document.getElementById('quantityInput').value);
            addToCart(productId, quantity);
            quickViewModal.classList.remove('active');
            quickViewOverlay.classList.remove('active');
        });
    }

    // Quick view buy now
    const quickBuyNow = document.getElementById('quickBuyNow');
    if (quickBuyNow) {
        quickBuyNow.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const quantity = parseInt(document.getElementById('quantityInput').value);
            
            // Clear cart and add only this item
            const product = products.find(p => p.id === productId);
            cart = [{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            }];
            
            // Update user data
            user.cart = cart;
            localStorage.setItem('user', JSON.stringify(user));
            
            updateCartCount();
            quickViewModal.classList.remove('active');
            quickViewOverlay.classList.remove('active');
            
            // Open checkout
            checkoutModal.classList.add('active');
            checkoutOverlay.classList.add('active');
            updateCheckoutUI();
            
            // Reset to shipping step
            document.getElementById('step1').classList.add('active');
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.remove('active');
            document.getElementById('shippingContent').classList.add('active');
            document.getElementById('paymentContent').classList.remove('active');
            document.getElementById('confirmationContent').classList.remove('active');
        });
    }


    // Checkout navigation
    const nextToPayment = document.getElementById('nextToPayment');
    const backToShipping = document.getElementById('backToShipping');
    const nextToConfirmation = document.getElementById('nextToConfirmation');
    const continueShopping = document.getElementById('continueShopping');
    const viewOrderDetails = document.getElementById('viewOrderDetails');

    if (nextToPayment) {
        nextToPayment.addEventListener('click', function() {
            if (!validateShippingForm()) {
                return;
            }
            
            // Save shipping info to user data
            user.shippingInfo = {
                firstName: document.getElementById('checkoutFirstName').value,
                lastName: document.getElementById('checkoutLastName').value,
                email: document.getElementById('checkoutEmail').value,
                phone: document.getElementById('checkoutPhone').value,
                address: document.getElementById('checkoutAddress').value,
                city: document.getElementById('checkoutCity').value,
                state: document.getElementById('checkoutState').value,
                postalCode: document.getElementById('checkoutPostalCode').value,
                country: document.getElementById('checkoutCountry').value
            };
            localStorage.setItem('user', JSON.stringify(user));
            
            // Animate transition to payment
            document.getElementById('shippingContent').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('step1').classList.remove('active');
                document.getElementById('step2').classList.add('active');
                document.getElementById('shippingContent').classList.remove('active', 'fade-out');
                document.getElementById('paymentContent').classList.add('active', 'fade-in');
                
                // Update payment summary
                const subtotal = calculateCartSubtotal();
                const shipping = calculateShipping();
                const tax = calculateTax(subtotal);
                const total = subtotal + shipping + tax;
                
                document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
                document.getElementById('checkoutShipping').textContent = `$${shipping.toFixed(2)}`;
                document.getElementById('checkoutTax').textContent = `$${tax.toFixed(2)}`;
                document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
                
                // Load saved payment method if exists
                if (user.paymentMethod) {
                    document.querySelector(`input[name="paymentMethod"][value="${user.paymentMethod}"]`).checked = true;
                }
            }, 300);
        });
    }

    if (backToShipping) {
        backToShipping.addEventListener('click', function() {
            document.getElementById('paymentContent').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step1').classList.add('active');
                document.getElementById('paymentContent').classList.remove('active', 'fade-out');
                document.getElementById('shippingContent').classList.add('active', 'fade-in');
            }, 300);
        });
    }

    if (nextToConfirmation) {
        nextToConfirmation.addEventListener('click', function() {
            if (!validatePaymentForm()) {
                return;
            }
            
            // Save payment method
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            user.paymentMethod = selectedMethod;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Animate transition to confirmation
            document.getElementById('paymentContent').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step3').classList.add('active');
                document.getElementById('paymentContent').classList.remove('active', 'fade-out');
                document.getElementById('confirmationContent').classList.add('active', 'fade-in');
                updateOrderConfirmation();
                
                // Show success animation
                const checkmark = document.createElement('div');
                checkmark.className = 'checkmark';
                checkmark.innerHTML = `
                    <svg class="checkmark-circle" viewBox="0 0 52 52">
                        <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
                        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                `;
                document.querySelector('.confirmation-header').prepend(checkmark);
            }, 300);
        });
    }

// Add this function to dashboard.js to handle order creation
function createOrderFromCheckout(checkoutData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    const order = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        status: 'pending',
        total: calculateCartTotal(),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        customerName: checkoutData.firstName + ' ' + checkoutData.lastName,
        customerPhone: checkoutData.phone,
        deliveryAddress: checkoutData.address + ', ' + 
                        checkoutData.city + ', ' + 
                        checkoutData.state + ' ' + 
                        checkoutData.postalCode,
        deliveryFee: SHIPPING_COST,
        subtotal: calculateCartSubtotal(),
        location: {
            lat: 12.9716 + (Math.random() * 0.02 - 0.01),
            lng: 77.5946 + (Math.random() * 0.02 - 0.01)
        }
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Add to user's order history
    if (!user.orders) user.orders = [];
    user.orders.unshift(order);
    localStorage.setItem('user', JSON.stringify(user));

    // Assign to delivery partner
    setTimeout(() => {
        const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
        const availableBoys = deliveryBoys.filter(db => db.status === 'online' && db.isAvailable);
        
        if (availableBoys.length > 0) {
            // Find nearest delivery boy
            let nearestBoy = null;
            let minDistance = Infinity;
            
            availableBoys.forEach(boy => {
                const distance = Math.sqrt(
                    Math.pow(boy.location.lat - order.location.lat, 2) + 
                    Math.pow(boy.location.lng - order.location.lng, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBoy = boy;
                }
            });
            
            // Assign order
            order.deliveryBoyId = nearestBoy.id;
            order.deliveryBoyName = nearestBoy.name;
            order.status = 'assigned';
            order.assignedTime = new Date().toISOString();
            
            // Update delivery boy's status
            const dbIndex = deliveryBoys.findIndex(db => db.id === nearestBoy.id);
            if (dbIndex !== -1) {
                deliveryBoys[dbIndex].isAvailable = false;
                deliveryBoys[dbIndex].currentOrder = order.id;
            }
            
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
            
            // Notify delivery boy
            if (nearestBoy.id === deliveryBoy.id) {
                const notification = {
                    type: 'new_order',
                    message: 'New order assigned!',
                    orderId: order.id,
                    orderAddress: order.deliveryAddress,
                    orderAmount: order.total,
                    items: order.items,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                
                if (!deliveryBoy.notifications) deliveryBoy.notifications = [];
                deliveryBoy.notifications.unshift(notification);
                localStorage.setItem('deliveryBoyData', JSON.stringify(deliveryBoy));
                
                // Play notification sound
                if (elements.notificationSound) {
                    elements.notificationSound.play();
                }
            }
        }
    }, 1000);
    
    return order.id;
}

// Update the continueShopping event handler to use this function
if (continueShopping) {
    continueShopping.addEventListener('click', function() {
        const orderId = createOrderFromCheckout({
            firstName: document.getElementById('checkoutFirstName').value,
            lastName: document.getElementById('checkoutLastName').value,
            email: document.getElementById('checkoutEmail').value,
            phone: document.getElementById('checkoutPhone').value,
            address: document.getElementById('checkoutAddress').value,
            city: document.getElementById('checkoutCity').value,
            state: document.getElementById('checkoutState').value,
            postalCode: document.getElementById('checkoutPostalCode').value,
            country: document.getElementById('checkoutCountry').value,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: calculateCartSubtotal(),
            deliveryFee: SHIPPING_COST,
            total: calculateCartTotal()
        });
        
        // Clear cart
        cart = [];
        user.cart = [];
        localStorage.setItem('user', JSON.stringify(user));
        updateCartCount();
        updateCartUI();
        
        // Close checkout modal
        checkoutModal.classList.remove('active');
        checkoutOverlay.classList.remove('active');
        
        showToast('Order placed successfully!', 'success');
    });
}
    if (viewOrderDetails) {
        viewOrderDetails.addEventListener('click', function() {
            // Close checkout modal
            checkoutModal.classList.remove('active');
            checkoutOverlay.classList.remove('active');
            
            // Redirect to profile page's orders section
            window.location.href = 'profile.html#orders';
        });
    }

    // Payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all payment forms
            document.querySelectorAll('.payment-method').forEach(method => {
                method.classList.remove('active');
            });
            
            // Show selected payment method
            this.closest('.payment-method').classList.add('active');
        });
    });

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('productSearch').value.trim().toLowerCase();
            
            if (searchTerm) {
                // Save search term to localStorage
                localStorage.setItem('lastSearchTerm', searchTerm);
                
                // Redirect to listing page with search parameter
                window.location.href = `listing.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                showToast('Please enter a search term', 'error');
            }
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filteredProducts = products.filter(product => product.category === category);
                renderProducts(filteredProducts);
            }
        });
    }

    // Form validation
    function validateShippingForm() {
        const requiredFields = [
            'checkoutFirstName',
            'checkoutLastName',
            'checkoutEmail',
            'checkoutAddress',
            'checkoutCity',
            'checkoutState',
            'checkoutPostalCode'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--error)';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Validate email format
        const email = document.getElementById('checkoutEmail');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.style.borderColor = 'var(--error)';
            isValid = false;
            showToast('Please enter a valid email address', 'error');
        }
        
        if (!isValid) {
            showToast('Please fill all required fields', 'error');
        }
        
        return isValid;
    }
    
    function validatePaymentForm() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!selectedMethod) {
            showToast('Please select a payment method', 'error');
            return false;
        }
        
        return true;
    }

    // Initialize carousel
    function initCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${index * 100}%)`;
        });
        
        // Auto-rotate carousel
        setInterval(() => {
            nextSlide();
        }, 5000);
    }
    
    function nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }
    
    function prevSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    function updateCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
        });
    }
    
    // Carousel navigation
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
  

    // Wishlist functionality
    if (viewWishlist) {
        viewWishlist.addEventListener('click', function(e) {
            e.preventDefault();
            wishlistSidebar.classList.add('active');
            dashboardOverlay.classList.add('active');
            updateWishlistUI();
        });
    }
    
    if (sidebarWishlist) {
        sidebarWishlist.addEventListener('click', function(e) {
            e.preventDefault();
            dashboardSidebar.classList.remove('active');
            wishlistSidebar.classList.add('active');
            updateWishlistUI();
        });
    }
    
    if (closeWishlist) {
        closeWishlist.addEventListener('click', function() {
            wishlistSidebar.classList.remove('active');
            dashboardOverlay.classList.remove('active');
        });
    }
    
    // Add to wishlist functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-to-wishlist') || 
            e.target.closest('.btn-add-to-wishlist')) {
            const btn = e.target.classList.contains('btn-add-to-wishlist') ? 
                         e.target : e.target.closest('.btn-add-to-wishlist');
            const productId = parseInt(btn.dataset.id);
            toggleWishlistItem(productId, btn);
        }
    });
    
    function toggleWishlistItem(productId, button) {
        const product = products.find(p => p.id === productId);
        const existingItem = wishlist.find(item => item.id === productId);
        
        if (existingItem) {
            wishlist = wishlist.filter(item => item.id !== productId);
            showToast(`${product.name} removed from wishlist`, 'warning');
            if (button) button.classList.remove('active');
        } else {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description
            });
            showToast(`${product.name} added to wishlist`, 'success');
            if (button) button.classList.add('active');
        }
        
        // Update user data
        user.wishlist = wishlist;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateWishlistCount();
        updateWishlistUI();
    }
    
    function updateWishlistCount() {
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        wishlistCountElements.forEach(el => {
            el.textContent = wishlist.length;
        });
    }
    
    function updateWishlistUI() {
        const wishlistItemsContainer = document.getElementById('wishlistItems');
        const emptyWishlistMessage = document.querySelector('.empty-wishlist-message');
        
        if (wishlist.length === 0) {
            if (emptyWishlistMessage) emptyWishlistMessage.style.display = 'block';
            if (wishlistItemsContainer) wishlistItemsContainer.innerHTML = '';
        } else {
            if (emptyWishlistMessage) emptyWishlistMessage.style.display = 'none';
            if (wishlistItemsContainer) {
                wishlistItemsContainer.innerHTML = '';
                
                wishlist.forEach(item => {
                    const wishlistItem = document.createElement('div');
                    wishlistItem.className = 'wishlist-item';
                    wishlistItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
                        <div class="wishlist-item-details">
                            <h4 class="wishlist-item-name">${item.name}</h4>
                            <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
                            <div class="wishlist-item-actions">
                                <button class="btn-add-to-cart" data-id="${item.id}">Add to Cart</button>
                                <span class="remove-wishlist-item" data-id="${item.id}">Remove</span>
                            </div>
                        </div>
                    `;
                    wishlistItemsContainer.appendChild(wishlistItem);
                });
                
                // Add event listeners for wishlist items
                document.querySelectorAll('.remove-wishlist-item').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.dataset.id);
                        wishlist = wishlist.filter(item => item.id !== id);
                        
                        // Update user data
                        user.wishlist = wishlist;
                        localStorage.setItem('user', JSON.stringify(user));
                        
                        updateWishlistCount();
                        updateWishlistUI();
                        showToast('Item removed from wishlist', 'warning');
                        
                        // Update wishlist button state in product grid
                        const wishlistBtn = document.querySelector(`.btn-add-to-wishlist[data-id="${id}"]`);
                        if (wishlistBtn) wishlistBtn.classList.remove('active');
                    });
                });
                
                document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.dataset.id);
                        addToCart(id, 1);
                    });
                });
            }
        }
    }

    // Render products
    function renderProducts(productsToRender) {
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Check if product is in wishlist
            const isInWishlist = wishlist.some(item => item.id === product.id);
            
            // Create badge if product has one
            let badgeHTML = '';
            if (product.badge) {
                badgeHTML = `<span class="product-badge ${product.organic ? 'organic' : ''}">${product.badge}</span>`;
            }
            
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${badgeHTML}
                    <button class="btn-quick-view" data-id="${product.id}">Quick View</button>
                    <button class="btn-add-to-wishlist ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || ''}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        ${renderRatingStars(product.rating)}
                        <span class="product-reviews">(${product.reviews})</span>
                    </div>
                    <div class="product-pricing">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? 
                          `<span class="product-original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            
            productsGrid.appendChild(productCard);

        });
    }

    // Category Cards Click Handler
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Filter products by category
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filteredProducts = products.filter(product => product.category === category);
                renderProducts(filteredProducts);
            }
            
            // Scroll to products section
            document.getElementById('products').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Update active state in navigation
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
        });
    });
    // Render rating stars
    function renderRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        return starsHTML;
    }

    // Add to cart function
    function addToCart(productId, quantity) {
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        // Update user data
        user.cart = cart;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateCartCount();
        updateCartUI();
        showToast(`${product.name} added to cart`, 'success');
    }

    // Update cart count in header
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
    }

    // Update cart UI in sidebar
    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCartMessage = document.querySelector('.empty-cart-message');
        
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartItemsContainer) cartItemsContainer.innerHTML = '';
            if (cartSubtotal) cartSubtotal.textContent = '$0.00';
            if (cartTotal) cartTotal.textContent = '$0.00';
            return;
        }
        
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-cart-item" data-id="${item.id}">
                        <i class="far fa-trash-alt"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            
            // Add event listeners for quantity controls
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    updateCartItemQuantity(id, -1);
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    updateCartItemQuantity(id, 1);
                });
            });
            
            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-cart-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    removeCartItem(id);
                });
            });
        }
        
        // Update totals
        const subtotal = calculateCartSubtotal();
        const total = subtotal + SHIPPING_COST;
        
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Update cart item quantity
    function updateCartItemQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        
        // Update user data
        user.cart = cart;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateCartCount();
        updateCartUI();
    }

    // Remove cart item
    function removeCartItem(productId) {
        const item = cart.find(item => item.id === productId);
        
        if (!item) return;
        
        cart = cart.filter(item => item.id !== productId);
        
        // Update user data
        user.cart = cart;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateCartCount();
        updateCartUI();
        
        showToast(`${item.name} removed from cart`, 'warning');
    }

    // Calculate cart subtotal
    function calculateCartSubtotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calculate cart total
    function calculateCartTotal() {
        const subtotal = calculateCartSubtotal();
        return subtotal + SHIPPING_COST;
    }

    // Calculate shipping cost
    function calculateShipping() {
        // For now, just return flat rate
        return SHIPPING_COST;
    }

    // Calculate tax
    function calculateTax(subtotal) {
        return subtotal * TAX_RATE;
    }

    // Update order confirmation
    function updateOrderConfirmation() {
        const orderSummary = document.getElementById('orderSummary');
        const orderTotal = document.getElementById('orderTotal');
        const orderNumber = document.getElementById('orderNumber');
        const orderDate = document.getElementById('orderDate');
        
        if (orderSummary) {
            orderSummary.innerHTML = '';
            
            cart.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div class="order-item-name">
                        <span class="order-item-quantity">${item.quantity}x</span>
                        ${item.name}
                    </div>
                    <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                `;
                orderSummary.appendChild(orderItem);
            });
            
            // Add subtotal, shipping, and tax
            const subtotal = calculateCartSubtotal();
            const shipping = calculateShipping();
            const tax = calculateTax(subtotal);
            
            const subtotalRow = document.createElement('div');
            subtotalRow.className = 'order-total-row';
            subtotalRow.innerHTML = `
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            `;
            orderSummary.appendChild(subtotalRow);
            
            const shippingRow = document.createElement('div');
            shippingRow.className = 'order-total-row';
            shippingRow.innerHTML = `
                <span>Shipping</span>
                <span>$${shipping.toFixed(2)}</span>
            `;
            orderSummary.appendChild(shippingRow);
            
            const taxRow = document.createElement('div');
            taxRow.className = 'order-total-row';
            taxRow.innerHTML = `
                <span>Tax</span>
                <span>$${tax.toFixed(2)}</span>
            `;
            orderSummary.appendChild(taxRow);
        }
        
        if (orderTotal) {
            const subtotal = calculateCartSubtotal();
            const shipping = calculateShipping();
            const tax = calculateTax(subtotal);
            const total = subtotal + shipping + tax;
            
            orderTotal.textContent = `$${total.toFixed(2)}`;
        }
        
        if (orderNumber) {
            orderNumber.textContent = 'ORD-' + Date.now().toString().slice(-6);
        }
        
        if (orderDate) {
            orderDate.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Update checkout UI
    function updateCheckoutUI() {
        const checkoutItems = document.getElementById('checkoutItems');
        
        if (checkoutItems) {
            checkoutItems.innerHTML = '';
            
            cart.forEach(item => {
                const checkoutItem = document.createElement('div');
                checkoutItem.className = 'checkout-item';
                checkoutItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                    <div class="checkout-item-details">
                        <h4 class="checkout-item-name">${item.name}</h4>
                        <div class="checkout-item-price">$${item.price.toFixed(2)}</div>
                        <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                    </div>
                `;
                checkoutItems.appendChild(checkoutItem);
            });
        }
        
        // Update shipping info if exists
        if (user.shippingInfo) {
            document.getElementById('checkoutFirstName').value = user.shippingInfo.firstName || '';
            document.getElementById('checkoutLastName').value = user.shippingInfo.lastName || '';
            document.getElementById('checkoutEmail').value = user.shippingInfo.email || '';
            document.getElementById('checkoutPhone').value = user.shippingInfo.phone || '';
            document.getElementById('checkoutAddress').value = user.shippingInfo.address || '';
            document.getElementById('checkoutCity').value = user.shippingInfo.city || '';
            document.getElementById('checkoutState').value = user.shippingInfo.state || '';
            document.getElementById('checkoutPostalCode').value = user.shippingInfo.postalCode || '';
            document.getElementById('checkoutCountry').value = user.shippingInfo.country || '';
        }
    }

    // Show quick view modal
    function showQuickView(product) {
        const quickViewImage = document.getElementById('quickViewImage');
        const quickViewName = document.getElementById('quickViewName');
        const quickViewPrice = document.getElementById('quickViewPrice');
        const quickViewOriginalPrice = document.getElementById('quickViewOriginalPrice');
        const quickViewRating = document.getElementById('quickViewRating');
        const quickViewReviews = document.getElementById('quickViewReviews');
        const quickViewDescription = document.getElementById('quickViewDescription');
        const quickViewBrand = document.getElementById('quickViewBrand');
        const quickViewBadge = document.getElementById('quickViewBadge');
        const quickAddToCart = document.getElementById('quickAddToCart');
        const quickBuyNow = document.getElementById('quickBuyNow');
        
        if (quickViewImage) quickViewImage.src = product.image;
        if (quickViewName) quickViewName.textContent = product.name;
        if (quickViewPrice) quickViewPrice.textContent = `$${product.price.toFixed(2)}`;
        
        if (product.originalPrice && quickViewOriginalPrice) {
            quickViewOriginalPrice.textContent = `$${product.originalPrice.toFixed(2)}`;
            quickViewOriginalPrice.style.display = 'inline-block';
        } else if (quickViewOriginalPrice) {
            quickViewOriginalPrice.style.display = 'none';
        }
        
        if (quickViewRating) quickViewRating.innerHTML = renderRatingStars(product.rating);
        if (quickViewReviews) quickViewReviews.textContent = `(${product.reviews} reviews)`;
        if (quickViewDescription) quickViewDescription.textContent = product.description;
        if (quickViewBrand) quickViewBrand.textContent = product.brand || '';
        
        if (product.badge && quickViewBadge) {
            quickViewBadge.textContent = product.badge;
            quickViewBadge.className = product.organic ? 'product-badge organic' : 'product-badge';
            quickViewBadge.style.display = 'inline-block';
        } else if (quickViewBadge) {
            quickViewBadge.style.display = 'none';
        }
        
        if (quickAddToCart) quickAddToCart.dataset.id = product.id;
        if (quickBuyNow) quickBuyNow.dataset.id = product.id;
        
        // Reset quantity
        document.getElementById('quantityInput').value = '1';
        
        quickViewModal.classList.add('active');
        quickViewOverlay.classList.add('active');
    }

    // Show toast notification
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Initialize the page
    function init() {
        // Check if we're on the products page
        if (productsGrid) {
            // Check for search parameter
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            
            if (searchTerm) {
                // Filter products by search term
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (filteredProducts.length > 0) {
                    renderProducts(filteredProducts);
                    
                    // Update search input
                    const searchInput = document.getElementById('productSearch');
                    if (searchInput) searchInput.value = searchTerm;
                } else {
                    productsGrid.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <h3>No products found for "${searchTerm}"</h3>
                            <p>Try adjusting your search or filter to find what you're looking for.</p>
                            <button class="btn-clear-search">Clear Search</button>
                        </div>
                    `;
                    
                    // Add event listener for clear search button
                    const clearSearchBtn = document.querySelector('.btn-clear-search');
                    if (clearSearchBtn) {
                        clearSearchBtn.addEventListener('click', function() {
                            window.location.href = 'listing.html';
                        });
                    }
                }
            } else {
                // Render all products
                renderProducts(products);
            }
        }
        
        // Initialize carousel if exists
        if (document.querySelector('.carousel-slide')) {
            initCarousel();
        }
        
        // Check if we're on the profile page
        if (document.getElementById('profileOrders')) {
            updateProfileOrders();
        }
    }

    // Update profile orders
    function updateProfileOrders() {
        const ordersContainer = document.getElementById('profileOrders');
        const emptyOrdersMessage = document.querySelector('.empty-orders-message');
        
        if (!user.orders || user.orders.length === 0) {
            if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'block';
            if (ordersContainer) ordersContainer.innerHTML = '';
            return;
        }
        
        if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'none';
        
        if (ordersContainer) {
            ordersContainer.innerHTML = '';
            
            user.orders.forEach(order => {
                const orderElement = document.createElement('div');
                orderElement.className = 'profile-order';
                orderElement.innerHTML = `
                    <div class="order-header">
                        <div class="order-info">
                            <div class="order-number">Order #${order.id}</div>
                            <div class="order-date">${new Date(order.date).toLocaleDateString()}</div>
                        </div>
                        <div class="order-status ${order.status}">${order.status}</div>
                    </div>
                    <div class="order-items">
                        ${order.items.slice(0, 3).map(item => `
                            <img src="${item.image}" alt="${item.name}" class="order-item-image" title="${item.name}">
                        `).join('')}
                        ${order.items.length > 3 ? 
                          `<div class="order-more-items">+${order.items.length - 3} more</div>` : ''}
                    </div>
                    <div class="order-footer">
                        <div class="order-total">$${order.total.toFixed(2)}</div>
                        <button class="btn-view-order" data-id="${order.id}">View Details</button>
                    </div>
                `;
                
                ordersContainer.appendChild(orderElement);
            });
            
            // Add event listeners for view details buttons
            document.querySelectorAll('.btn-view-order').forEach(btn => {
                btn.addEventListener('click', function() {
                    const orderId = this.dataset.id;
                    showOrderDetails(orderId);
                });
            });
        }
    }

    // Show order details
    function showOrderDetails(orderId) {
        const order = user.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const orderDetailsModal = document.getElementById('orderDetailsModal');
        const orderDetailsOverlay = document.getElementById('orderDetailsOverlay');
        
        if (orderDetailsModal && orderDetailsOverlay) {
            // Populate order details
            document.getElementById('orderDetailsNumber').textContent = order.id;
            document.getElementById('orderDetailsDate').textContent = new Date(order.date).toLocaleDateString();
            document.getElementById('orderDetailsStatus').textContent = order.status;
            document.getElementById('orderDetailsStatus').className = `order-status ${order.status}`;
            
            // Populate order items
            const orderItemsContainer = document.getElementById('orderDetailsItems');
            orderItemsContainer.innerHTML = '';
            
            order.items.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-details-item';
                orderItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="order-details-image">
                    <div class="order-details-info">
                        <h4 class="order-details-name">${item.name}</h4>
                        <div class="order-details-price">$${item.price.toFixed(2)}</div>
                        <div class="order-details-quantity">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="order-details-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                `;
                orderItemsContainer.appendChild(orderItem);
            });
            
            // Populate order totals
            const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shipping = 5.99; // Assuming fixed shipping cost
            const tax = subtotal * 0.08; // Assuming 8% tax
            
            document.getElementById('orderDetailsSubtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('orderDetailsShipping').textContent = `$${shipping.toFixed(2)}`;
            document.getElementById('orderDetailsTax').textContent = `$${tax.toFixed(2)}`;
            document.getElementById('orderDetailsTotal').textContent = `$${order.total.toFixed(2)}`;
            
            // Show modal
            orderDetailsModal.classList.add('active');
            orderDetailsOverlay.classList.add('active');
        }
    }

    // Close order details modal
    const closeOrderDetails = document.getElementById('closeOrderDetails');
    if (closeOrderDetails) {
        closeOrderDetails.addEventListener('click', function() {
            document.getElementById('orderDetailsModal').classList.remove('active');
            document.getElementById('orderDetailsOverlay').classList.remove('active');
        });
    }

    // Initialize the page
    init();
});
