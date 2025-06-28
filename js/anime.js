// anime.js - Updated version
function initAnimeJSAnimations() {
    // Product card hover animations
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => animateCardHover(card, true));
        card.addEventListener('mouseleave', () => animateCardHover(card, false));
    });
    
    // Category card hover animations
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('mouseenter', () => animateCategoryHover(card, true));
        card.addEventListener('mouseleave', () => animateCategoryHover(card, false));
    });
    
    // Button hover animations
    document.querySelectorAll('.btn, .btn-add-to-cart, .btn-quick-view').forEach(btn => {
        btn.addEventListener('mouseenter', () => animateButtonHover(btn, true));
        btn.addEventListener('mouseleave', () => animateButtonHover(btn, false));
    });
    
    // Add to wishlist animation
    document.querySelectorAll('.btn-add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', () => animateWishlist(btn));
    });
}

function animateCardHover(card, isEntering) {
    anime({
        targets: card,
        scale: isEntering ? 1.02 : 1,
        boxShadow: isEntering ? '0 15px 30px rgba(0, 0, 0, 0.15)' : '0 5px 15px rgba(0, 0, 0, 0.1)',
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    const img = card.querySelector('.product-image');
    if (img) {
        anime({
            targets: img,
            scale: isEntering ? 1.05 : 1,
            duration: 500,
            easing: 'easeOutQuad'
        });
    }
}

function animateCategoryHover(card, isEntering) {
    anime({
        targets: card,
        translateY: isEntering ? -10 : 0,
        boxShadow: isEntering ? '0 15px 30px rgba(0, 0, 0, 0.2)' : '0 5px 15px rgba(0, 0, 0, 0.1)',
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    const icon = card.querySelector('.category-info i');
    if (icon) {
        anime({
            targets: icon,
            scale: isEntering ? 1.2 : 1,
            duration: 500,
            easing: isEntering ? 'easeOutElastic' : 'easeOutQuad'
        });
    }
}

function animateButtonHover(btn, isEntering) {
    anime({
        targets: btn,
        scale: isEntering ? 1.05 : 1,
        duration: 200,
        easing: 'easeOutQuad'
    });
}

function animateWishlist(btn) {
    const isActive = btn.classList.contains('active');
    
    anime({
        targets: btn,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.8)' : '#e74c3c',
        color: isActive ? '#333' : '#fff',
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    if (!isActive) {
        anime({
            targets: btn.querySelector('i'),
            scale: [1, 1.3, 1],
            duration: 600,
            easing: 'easeOutElastic'
        });
    }
}