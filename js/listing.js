// Get search term from URL
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search') || '';

// Update results count
document.getElementById('resultsCount').textContent = searchTerm 
    ? `Showing results for "${searchTerm}"`
    : 'Showing all products';

// Sample product data
const defaultProducts = [
    {
        id: 1,
        title: "Organic Apples (1kg)",
        price: "₹120",
        originalPrice: "₹150",
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        specs: "Fresh organic apples from local farms. Crisp and sweet with perfect tartness.",
        rating: 4.5,
        ratingCount: 1245,
        badges: ["Organic", "Popular"],
        category: "fruits",
        brand: "FoodMart",
        delivery: "Free delivery by tomorrow"
    },
    // ... (rest of your default product data)
];

// Get products from localStorage (added by shop dashboard)
function getAllProducts() {
    // Get default products
    let products = [...defaultProducts];
    
    // Get shop products from localStorage and convert them to user-facing format
    const shopProducts = JSON.parse(localStorage.getItem('shopProducts')) || [];
    const shopSettings = JSON.parse(localStorage.getItem('shopSettings')) || { name: 'Shop' };
    
    shopProducts.forEach(shopProduct => {
        // Only include active products
        if (shopProduct.status === 'active') {
            // Check if product already exists to avoid duplicates
            const existingProduct = products.find(p => p.id === parseInt(shopProduct.id));
            if (!existingProduct) {
                products.push({
                    id: parseInt(shopProduct.id),
                    title: shopProduct.name,
                    price: `₹${shopProduct.price.toFixed(2)}`,
                    originalPrice: `₹${Math.round(shopProduct.price * 1.1 * 100) / 100}`,
                    image: shopProduct.image || 'https://via.placeholder.com/300',
                    specs: shopProduct.description || 'No description available',
                    rating: 4.0 + Math.random(), // Random rating between 4.0-5.0
                    ratingCount: Math.floor(Math.random() * 20), // Random reviews 0-20
                    badges: shopProduct.status === 'active' ? ['New'] : [],
                    category: shopProduct.category || 'uncategorized',
                    brand: shopSettings.name,
                    delivery: "Free delivery in 3-5 days"
                });
            }
        }
    });
    
    return products;
}

// Filter products based on search term
function filterProducts() {
    const products = getAllProducts();
    
    if (!searchTerm) return products;
    
    return products.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.specs.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Render product cards with animation
function renderProducts(productsToRender = filterProducts()) {
    const productGrid = document.getElementById('productGrid');
    
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productGrid.innerHTML = `
            <div class="no-results animate__animated animate__fadeIn">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        productCard.dataset.id = product.id;
        
        // Calculate discount if original price exists
        let discountBadge = '';
        if (product.originalPrice) {
            const original = parseInt(product.originalPrice.replace('₹', ''));
            const current = parseInt(product.price.replace('₹', ''));
            const discount = Math.round(((original - current) / original) * 100);
            discountBadge = `<span class="discount-badge">${discount}% off</span>`;
        }
        
        // Create rating stars
        const fullStars = '★'.repeat(Math.floor(product.rating));
        const halfStar = product.rating % 1 >= 0.5 ? '★' : '';
        const emptyStars = '☆'.repeat(5 - Math.ceil(product.rating));
        
        // Create badges
        const badgesHTML = product.badges.map(badge => 
            `<span class="badge">${badge}</span>`
        ).join('');
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-title">${product.title}</div>
            <div class="product-price">
                ${product.price}
                ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                ${discountBadge}
            </div>
            <div class="product-specs">${product.specs}</div>
            <div class="product-rating">
                <span class="rating-stars">${fullStars}${halfStar}${emptyStars}</span>
                <span class="rating-count">${product.ratingCount} ratings</span>
            </div>
            ${badgesHTML}
            <div class="delivery-badge">${product.delivery}</div>
        `;
        
        // Add click event to navigate to product page
        productCard.addEventListener('click', () => {
            window.location.href = `product.html?id=${product.id}`;
        });
        
        productGrid.appendChild(productCard);
    });
    
    // Update results count
    document.getElementById('resultsCount').textContent = 
        `Showing ${productsToRender.length} results${searchTerm ? ` for "${searchTerm}"` : ''}`;
}

// Sort functionality
document.getElementById('sort-by').addEventListener('change', (e) => {
    const sortValue = e.target.value;
    let sortedProducts = [...filterProducts()];
    
    switch(sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => 
                parseInt(a.price.replace('₹', '')) - parseInt(b.price.replace('₹', '')));
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => 
                parseInt(b.price.replace('₹', '')) - parseInt(a.price.replace('₹', '')));
            break;
        case 'popularity':
            sortedProducts.sort((a, b) => b.ratingCount - a.ratingCount);
            break;
        case 'newest':
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
        case 'discount':
            sortedProducts.sort((a, b) => {
                const getDiscount = (product) => {
                    if (!product.originalPrice) return 0;
                    const original = parseInt(product.originalPrice.replace('₹', ''));
                    const current = parseInt(product.price.replace('₹', ''));
                    return Math.round(((original - current) / original) * 100);
                };
                return getDiscount(b) - getDiscount(a);
            });
            break;
    }
    
    renderProducts(sortedProducts);
});

// Filter functionality
function applyFilters() {
    // Get all checked filters
    const checkedCategories = Array.from(document.querySelectorAll('#fruits, #vegetables, #dairy, #bakery, #meat'))
        .filter(cb => cb.checked)
        .map(cb => cb.id);
    
    const checkedPrices = Array.from(document.querySelectorAll('#price1, #price2, #price3, #price4'))
        .filter(cb => cb.checked)
        .map(cb => cb.id);
    
    const checkedBrands = Array.from(document.querySelectorAll('#brand1, #brand2, #brand3, #brand4'))
        .filter(cb => cb.checked)
        .map(cb => cb.id);
    
    // Filter products
    let filteredProducts = filterProducts();
    
    if (checkedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            checkedCategories.includes(product.category.toLowerCase())
        );
    }
    
    if (checkedPrices.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            const price = parseInt(product.price.replace('₹', ''));
            return checkedPrices.some(priceId => {
                if (priceId === 'price1') return price < 100;
                if (priceId === 'price2') return price >= 100 && price <= 500;
                if (priceId === 'price3') return price > 500 && price <= 1000;
                if (priceId === 'price4') return price > 1000;
                return false;
            });
        });
    }
    
    if (checkedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            checkedBrands.includes(product.brand.toLowerCase().replace(' ', ''))
        );
    }
    
    renderProducts(filteredProducts);
}

// Mobile filter toggle
document.getElementById('showFilters')?.addEventListener('click', () => {
    document.getElementById('filtersPanel').classList.add('active');
});

document.getElementById('closeFilters')?.addEventListener('click', () => {
    document.getElementById('filtersPanel').classList.remove('active');
});

// Apply filters button
document.querySelector('.apply-filters')?.addEventListener('click', () => {
    applyFilters();
    document.getElementById('filtersPanel').classList.remove('active');
});

// Reset filters button
document.querySelector('.reset-filters')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    applyFilters();
});

// Global search functionality
document.getElementById('globalSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchValue = e.target.value.trim();
        if (searchValue) {
            window.location.href = `listing.html?search=${encodeURIComponent(searchValue)}`;
        }
    }
});

// Load user data and initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load user data
    const user = JSON.parse(localStorage.getItem('user')) || {
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        cart: [],
        wishlist: [],
        orders: []
    };
    
    // Update user info in header
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
            <span>Hi, ${user.name.split(' ')[0]}</span>
            <div class="user-dropdown">
                <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
                <a href="index.html#orders"><i class="fas fa-shopping-bag"></i> Orders</a>
                <a href="index.html#wishlist"><i class="fas fa-heart"></i> Wishlist</a>
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        `;
    }
    
    // Update cart count
    updateCartCount();
    
    // Add logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '.html';
    });
    
    // Add cart click handler
    document.querySelector('.cart')?.addEventListener('click', () => {
        window.location.href = 'index.html#cart';
    });
    
    function updateCartCount() {
        const cart = user.cart || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
    }
    
    renderProducts();
    
    // Add animation to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add floating animation to background elements
    const bgElements = document.querySelectorAll('.bg-circle, .bg-square');
    bgElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 2}s`;
    });
});