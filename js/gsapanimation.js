// gsapanimation.js - Updated version
function initGSAPAnimations() {
    // Header animations with delays
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.from('.logo', { 
        duration: 0.8, 
        y: -50, 
        opacity: 0, 
        ease: 'back.out(1.7)' 
    })
    .from('.compact-search-bar', { 
        duration: 0.6, 
        x: -50, 
        opacity: 0 
    }, 0.2)
    .from('.cart-icon', { 
        duration: 0.6, 
        x: 50, 
        opacity: 0 
    }, 0.2)
    .from('.nav-links li', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1
    }, 0.4)
    .from('.image-carousel', {
        duration: 1,
        y: 100,
        opacity: 0
    }, 0.6);
    
    // Scroll-triggered animations
    gsap.utils.toArray('.products-section, .categories-section').forEach(section => {
        gsap.from(section.querySelectorAll('.product-card, .category-card'), {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1)"
        });
    });
    
    // Initialize all modals and sidebars as hidden
    gsap.set(['.dashboard-sidebar', '.wishlist-sidebar', '.cart-sidebar'], { x: 400 });
    gsap.set(['.checkout-modal', '.quick-view-modal', '.return-modal'], { 
        scale: 0.9, 
        opacity: 0 
    });
    gsap.set('.toast', { y: 100, opacity: 0 });
}

// Enhanced add to cart animation
function addToCartAnimation(productCard) {
    const productImg = productCard.querySelector('.product-image').src;
    const cartIcon = document.querySelector('.cart-icon');
    
    // Create flying product image
    const flyImg = document.createElement('img');
    flyImg.src = productImg;
    flyImg.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    const rect = productCard.getBoundingClientRect();
    flyImg.style.left = `${rect.left}px`;
    flyImg.style.top = `${rect.top}px`;
    document.body.appendChild(flyImg);
    
    // Animate to cart with physics-based motion
    gsap.to(flyImg, {
        x: cartIcon.getBoundingClientRect().left - rect.left,
        y: cartIcon.getBoundingClientRect().top - rect.top,
        scale: 0.2,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
            document.body.removeChild(flyImg);
            // Bounce cart icon
            gsap.to(cartIcon, {
                scale: 1.3,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "elastic.out(1, 0.5)"
            });
            
            showToast('Item added to cart!', 'success');
        }
    });
}

// Toast notification system
window.showToast = function(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    gsap.killTweensOf(toast);
    
    gsap.to(toast, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1)",
        onComplete: () => {
            gsap.to(toast, {
                y: 100,
                opacity: 0,
                duration: 0.5,
                delay: 2,
                ease: "back.in(1)"
            });
        }
    });
};