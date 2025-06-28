document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data
    let user = JSON.parse(localStorage.getItem('user')) || {
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        cart: [],
        wishlist: [],
        orders: []
    };
    
    // Update user info in header
    updateUserInfo();
    
    // Load products from localStorage or initialize default products
    const products = loadProducts();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Find the product
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Display product details
    displayProductDetails(product);
    
    // Initialize related products
    initRelatedProducts(product, products);
    
    // Initialize cart functionality
    initCart(product, products);
    
    // Initialize image zoom
    initImageZoom();
    
    // Initialize pincode checker
    initPincodeChecker();
    
    // Initialize floating cart
    initFloatingCart();
    
    // Helper functions
    function updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            const avatar = user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            const name = user.name || 'Guest';
            
            userInfo.innerHTML = `
                <img src="${avatar}" alt="${name}" class="user-avatar">
                <span>${name.split(' ')[0]}</span>
                <div class="user-dropdown" id="userDropdown">
                    <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                    <a href="dashboard.html#orders"><i class="fas fa-shopping-bag"></i> My Orders</a>
                    <a href="#" id="viewWishlist"><i class="fas fa-heart"></i> Wishlist</a>
                    <a href="profile.html#addresses"><i class="fas fa-map-marker-alt"></i> Addresses</a>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            `;
            
            // Add logout functionality
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                window.location.href = 'dashboard.html';
            });
            
            // Add wishlist click handler
            document.getElementById('viewWishlist')?.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html#wishlist';
            });
            
            // Show user dropdown on hover
            userInfo.addEventListener('mouseenter', () => {
                document.getElementById('userDropdown').style.display = 'block';
            });
            
            userInfo.addEventListener('mouseleave', () => {
                document.getElementById('userDropdown').style.display = 'none';
            });
        }
        
        // Update cart count
        updateCartCount();
    }
    
    function updateCartCount() {
        const cart = user.cart || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update header cart count
        document.querySelector('.cart-count').textContent = totalItems;
        
        // Update floating cart count
        const floatingCartCount = document.querySelector('.floating-cart-indicator .count');
        if (floatingCartCount) {
            floatingCartCount.textContent = totalItems;
            if (totalItems > 0) {
                document.querySelector('.floating-cart-indicator').classList.add('pulse');
            } else {
                document.querySelector('.floating-cart-indicator').classList.remove('pulse');
            }
        }
    }
    
    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('products'));
        
        if (!products) {
            // Default products if none in localStorage
            products = [
                {
                    id: 1,
                    name: 'Organic Apples',
                    category: 'fruits',
                    price: 2.99,
                    originalPrice: 3.49,
                    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.5,
                    reviewsCount: 24,
                    description: 'Fresh organic apples from local farms. Crisp and sweet with a perfect balance of tartness.',
                    badge: 'Organic',
                    brand: 'FoodMart',
                    organic: true,
                    deliveryPincodes: ['110001', '110002', '110003', '110005']
                },
                {
                    id: 2,
                    name: 'Fresh Carrots',
                    category: 'vegetables',
                    price: 1.49,
                    originalPrice: 1.99,
                    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.2,
                    reviewsCount: 18,
                    description: 'Sweet and crunchy carrots, packed with vitamins and perfect for snacking or cooking.',
                    badge: 'Fresh',
                    brand: 'VeggieCo',
                    deliveryPincodes: ['110001', '110002', '110004', '110006']
                },
                {
                    id: 3,
                    name: 'Whole Milk',
                    category: 'dairy',
                    price: 3.29,
                    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.7,
                    reviewsCount: 32,
                    description: 'Creamy whole milk from grass-fed cows, rich in calcium and vitamin D.',
                    brand: 'DairyPure',
                    deliveryPincodes: ['110001', '110003', '110005', '110007']
                },
                {
                    id: 4,
                    name: 'Sourdough Bread',
                    category: 'bakery',
                    price: 4.99,
                    originalPrice: 5.49,
                    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.8,
                    reviewsCount: 45,
                    description: 'Artisan sourdough bread with a crisp crust and soft, airy interior.',
                    badge: 'Popular',
                    brand: 'BreadHaven',
                    deliveryPincodes: ['110002', '110004', '110006', '110008']
                },
                {
                    id: 5,
                    name: 'Orange Juice',
                    category: 'beverages',
                    price: 3.99,
                    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.3,
                    reviewsCount: 21,
                    description: '100% pure squeezed orange juice with no added sugars or preservatives.',
                    brand: 'JuicyCo',
                    deliveryPincodes: ['110001', '110003', '110005', '110009']
                },
                {
                    id: 6,
                    name: 'Organic Bananas',
                    category: 'fruits',
                    price: 0.69,
                    originalPrice: 0.79,
                    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    rating: 4.6,
                    reviewsCount: 38,
                    description: 'Naturally sweet organic bananas, perfect for smoothies or snacking.',
                    badge: 'Organic',
                    brand: 'FoodMart',
                    organic: true,
                    deliveryPincodes: ['110002', '110004', '110006', '110010']
                }
            ];
            
            localStorage.setItem('products', JSON.stringify(products));
        }
        
        return products;
    }
    
    function displayProductDetails(product) {
        // Main image
        const mainImage = document.getElementById('productMainImage');
        if (mainImage) {
            mainImage.src = product.image;
            mainImage.alt = product.name;
        }
        
        // Title
        const title = document.getElementById('productTitle');
        if (title) title.textContent = product.name;
        
        // Rating
        const rating = document.getElementById('productRating');
        if (rating) rating.textContent = product.rating;
        
        const ratingCount = document.getElementById('ratingCount');
        if (ratingCount) ratingCount.textContent = `${product.reviewsCount || 0} Ratings & Reviews`;
        
        // Price
        const price = document.getElementById('productPrice');
        if (price) price.textContent = `$${product.price.toFixed(2)}`;
        
        // Original price and discount
        const originalPrice = document.getElementById('originalPrice');
        const discountBadge = document.getElementById('discountBadge');
        
        if (product.originalPrice) {
            if (originalPrice) originalPrice.textContent = `$${product.originalPrice.toFixed(2)}`;
            if (discountBadge) {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                discountBadge.textContent = `${discount}% off`;
            }
        } else {
            if (originalPrice) originalPrice.textContent = '';
            if (discountBadge) discountBadge.textContent = '';
        }
        
        // Category link
        const categoryLink = document.getElementById('productCategory');
        if (categoryLink) {
            categoryLink.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
            categoryLink.href = `dashboard.html?category=${product.category}`;
        }
        
        // Breadcrumb
        const breadcrumb = document.getElementById('productNameBreadcrumb');
        if (breadcrumb) breadcrumb.textContent = product.name;
        
        // Load other details
        loadThumbnails(product);
        loadHighlights(product);
        loadOffers(product);
        loadSpecifications(product);
        loadReviews(product);
    }
    
    function loadThumbnails(product) {
        const thumbnailsContainer = document.getElementById('productThumbnails');
        if (!thumbnailsContainer) return;
        
        thumbnailsContainer.innerHTML = '';
        
        // For demo, we'll create some thumbnails from the main image
        // In a real app, you would have multiple images for each product
        for (let i = 0; i < 4; i++) {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = `${product.name} thumbnail ${i + 1}`;
            
            if (i === 0) {
                img.classList.add('active');
            }
            
            img.addEventListener('click', function() {
                // Update main image
                document.getElementById('productMainImage').src = this.src;
                
                // Update active thumbnail
                document.querySelectorAll('#productThumbnails img').forEach(img => {
                    img.classList.remove('active');
                });
                this.classList.add('active');
                
                // Add animation to main image
                const mainImage = document.getElementById('productMainImage');
                mainImage.classList.add('animate__animated', 'animate__fadeIn');
                mainImage.addEventListener('animationend', function() {
                    this.classList.remove('animate__animated', 'animate__fadeIn');
                });
            });
            
            thumbnailsContainer.appendChild(img);
        }
    }
    
    function loadHighlights(product) {
        const highlightsContainer = document.getElementById('productHighlights');
        if (!highlightsContainer) return;
        
        highlightsContainer.innerHTML = '';
        
        // Sample highlights - in a real app, these would come from product data
        const highlights = [
            `Fresh ${product.name} from local farms`,
            product.organic ? '100% natural and organic' : 'High quality product',
            'Rich in vitamins and minerals',
            'Perfect for cooking or snacking',
            'Long shelf life when stored properly'
        ];
        
        highlights.forEach(highlight => {
            const li = document.createElement('li');
            li.textContent = highlight;
            highlightsContainer.appendChild(li);
        });
    }
    
    function loadOffers(product) {
        const offersContainer = document.getElementById('productOffers');
        if (!offersContainer) return;
        
        offersContainer.innerHTML = '';
        
        // Sample offers - in a real app, these would come from product data
        const offers = [
            {
                icon: 'fa-tag',
                text: 'Get 5% cashback on FoodMart Credit Card'
            },
            {
                icon: 'fa-truck',
                text: 'Free delivery on orders over $50'
            },
            {
                icon: 'fa-gift',
                text: 'Buy 2 get 1 free on selected items'
            }
        ];
        
        offers.forEach(offer => {
            const div = document.createElement('div');
            div.className = 'offer';
            div.innerHTML = `
                <i class="fas ${offer.icon}"></i>
                <span>${offer.text}</span>
                <a href="#">View Details</a>
            `;
            offersContainer.appendChild(div);
        });
    }
    
    function loadSpecifications(product) {
        const specsContainer = document.getElementById('productSpecs');
        if (!specsContainer) return;
        
        specsContainer.innerHTML = '';
        
        // Sample specifications - in a real app, these would come from product data
        const specifications = [
            { name: 'Brand', value: product.brand || 'Generic' },
            { name: 'Category', value: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
            { name: 'Organic', value: product.organic ? 'Yes' : 'No' },
            { name: 'Weight', value: 'Approx. 1kg' },
            { name: 'Shelf Life', value: '7-10 days' }
        ];
        
        specifications.forEach(spec => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${spec.name}</td>
                <td>${spec.value}</td>
            `;
            specsContainer.appendChild(row);
        });
    }
    
    function loadReviews(product) {
        const reviewsContainer = document.getElementById('productReviews');
        if (!reviewsContainer) return;
        
        reviewsContainer.innerHTML = '';
        
        // Sample reviews - in a real app these would come from your data
        const reviews = [
            {
                rating: 5,
                title: "Excellent Quality",
                author: "Happy Customer",
                date: "2 days ago",
                comment: "This product exceeded my expectations. Very fresh and tasty!"
            },
            {
                rating: 4,
                title: "Good Product",
                author: "Regular Buyer",
                date: "1 week ago",
                comment: "Satisfied with the quality and delivery was on time."
            }
        ];
        
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <div class="review-header">
                    <div class="review-rating">${renderStars(review.rating)}</div>
                    <div class="review-title">${review.title}</div>
                </div>
                <div class="review-author">By ${review.author} on ${review.date}</div>
                <div class="review-comment">${review.comment}</div>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    }
    
    function renderStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }
    
    function initImageZoom() {
        const mainImage = document.getElementById('productMainImage');
        const zoom = document.getElementById('imageZoom');
        
        if (!mainImage || !zoom) return;
        
        mainImage.addEventListener('mousemove', function(e) {
            if (!zoom.style.backgroundImage) {
                zoom.style.backgroundImage = `url('${mainImage.src}')`;
            }
            
            const { left, top, width, height } = this.getBoundingClientRect();
            const x = ((e.pageX - left) / width) * 100;
            const y = ((e.pageY - top) / height) * 100;
            
            zoom.style.backgroundPosition = `${x}% ${y}%`;
            zoom.style.opacity = '1';
            zoom.style.transform = 'scale(1)';
            zoom.style.left = `${e.pageX - 100}px`;
            zoom.style.top = `${e.pageY - 100}px`;
        });
        
        mainImage.addEventListener('mouseleave', function() {
            zoom.style.opacity = '0';
            zoom.style.transform = 'scale(0.5)';
        });
    }
    
    function initPincodeChecker() {
        const pincodeInput = document.getElementById('pincodeInput');
        const checkPincodeBtn = document.getElementById('checkPincode');
        const deliveryInfo = document.getElementById('deliveryInfo');
        
        if (!pincodeInput || !checkPincodeBtn || !deliveryInfo) return;
        
        checkPincodeBtn.addEventListener('click', function() {
            const pincode = pincodeInput.value.trim();
            
            if (!pincode || !/^\d{6}$/.test(pincode)) {
                deliveryInfo.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Please enter a valid 6-digit pincode</span>
                `;
                deliveryInfo.classList.add('error');
                return;
            }
            
            // Simulate API call with timeout
            checkPincodeBtn.disabled = true;
            checkPincodeBtn.textContent = 'Checking...';
            
            setTimeout(() => {
                // Check if pincode is in product's delivery areas
                const product = products.find(p => p.id === parseInt(new URLSearchParams(window.location.search).get('id')));
                const isAvailable = product.deliveryPincodes?.includes(pincode) || Math.random() > 0.3;
                
                if (isAvailable) {
                    // Random delivery date between tomorrow and 3 days
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 1);
                    const deliveryDay = deliveryDate.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    deliveryInfo.innerHTML = `
                        <i class="fas fa-truck"></i>
                        <span>Delivery by ${deliveryDay} | Free</span>
                    `;
                    deliveryInfo.classList.remove('error');
                } else {
                    deliveryInfo.innerHTML = `
                        <i class="fas fa-times-circle"></i>
                        <span>Delivery not available for this pincode</span>
                    `;
                    deliveryInfo.classList.add('error');
                }
                
                checkPincodeBtn.disabled = false;
                checkPincodeBtn.textContent = 'Check';
            }, 1000);
        });
        
        // Allow pressing Enter in pincode field
        pincodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPincodeBtn.click();
            }
        });
    }
    
    function initFloatingCart() {
        const floatingCart = document.getElementById('floatingCart');
        if (!floatingCart) return;
        
        floatingCart.addEventListener('click', function() {
            window.location.href = 'dashboard.html#cart';
        });
        
        // Update count initially
        updateCartCount();
    }
    
    function initRelatedProducts(currentProduct, products) {
        const relatedContainer = document.getElementById('relatedProducts');
        if (!relatedContainer) return;
        
        // Get related products (same category but different product)
        const relatedProducts = products.filter(p => 
            p.category === currentProduct.category && 
            p.id !== currentProduct.id
        ).slice(0, 4); // Limit to 4 products
        
        if (relatedProducts.length === 0) {
            relatedContainer.parentElement.style.display = 'none';
            return;
        }
        
        relatedContainer.innerHTML = '';
        
        relatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'related-product-card animate__animated animate__fadeIn';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="related-product-image">
                <div class="related-product-info">
                    <h4 class="related-product-name">${product.name}</h4>
                    <div class="related-product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="related-product-rating">
                        ${renderStars(product.rating)} (${product.reviewsCount || 0})
                    </div>
                    <button class="btn-add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            `;
            
            productCard.addEventListener('click', function(e) {
                // Don't navigate if clicking on the add to cart button
                if (!e.target.closest('.btn-add-to-cart')) {
                    window.location.href = `product.html?id=${product.id}`;
                }
            });
            
            // Add click handler for the add to cart button
            const addToCartBtn = productCard.querySelector('.btn-add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    addToCartWithAnimation(product.id, 1, this);
                });
            }
            
            relatedContainer.appendChild(productCard);
        });
        
        // Make sure parent is visible
        relatedContainer.parentElement.style.display = 'block';
    }
    
    function initCart(product, products) {
        // Cart icon click
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', function() {
                window.location.href = 'dashboard.html#cart';
            });
        }
        
        // Add to cart button
        const addToCartBtn = document.getElementById('addToCart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                addToCartWithAnimation(product.id, 1, this);
            });
        }
        
        // Buy now button
        const buyNowBtn = document.getElementById('buyNow');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                buyNow(product, 1);
            });
        }
    }
    
    function addToCartWithAnimation(productId, quantity, button) {
        const product = products.find(p => p.id === productId);
        
        // Create animation element
        const animation = document.createElement('div');
        animation.className = 'cart-animation';
        animation.innerHTML = `<i class="fas fa-shopping-cart"></i>`;
        
        // Position animation at the button
        const btnRect = button.getBoundingClientRect();
        animation.style.setProperty('--x', `${window.innerWidth - btnRect.right + 30}px`);
        animation.style.setProperty('--y', `-${btnRect.top + 30}px`);
        animation.style.setProperty('--x-end', `${window.innerWidth - btnRect.right + 100}px`);
        animation.style.setProperty('--y-end', `-${btnRect.top + 100}px`);
        
        button.appendChild(animation);
        
        // Animate
        setTimeout(() => {
            animation.style.animation = 'flyToCart 0.8s forwards';
        }, 10);
        
        // Add to cart after animation starts
        setTimeout(() => {
            addToCart(productId, quantity);
            animation.remove();
        }, 100);
        
        // Show toast notification
        showToast(`${product.name} added to cart`, 'success');
    }
    
    function addToCart(productId, quantity) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let user = JSON.parse(localStorage.getItem('user')) || {};
        if (!user.cart) user.cart = [];
        
        const existingItem = user.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        updateCartCount();
    }
    
    function buyNow(product, quantity = 1) {
        // Create a temporary order with just this product
        let user = JSON.parse(localStorage.getItem('user')) || {};
        user.cart = [{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        }];
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update UI
        updateCartCount();
        
        // Redirect to checkout
        window.location.href = 'dashboard.html#cart';
    }
    
    function showToast(message, type) {
        const toastContainer = document.getElementById('toastContainer') || document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 3000);
    }
});