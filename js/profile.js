document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize profile
    initProfile();
    
    // Navigation tabs
    setupNavigation();
    
    // Form interactions
    setupForms();
    
    // Button effects
    setupButtonEffects();
    
    // Modal interactions
    setupModals();

    // Handle hash navigation
    handleHashNavigation();

    // Load delivery orders into user's order history
    loadDeliveryOrders();
});

function handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const navLink = document.querySelector(`.profile-nav a[data-section="${hash}"]`);
        if (navLink) {
            setTimeout(() => {
                navLink.click();
            }, 100);
        }
    }
}

function initProfile() {
    showLoading();
    setTimeout(() => {
        loadProfileData();
    }, 800);
}

function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Update profile header
    updateProfileHeader(user);
    
    // Load personal info
    loadPersonalInfo(user);
    
    // Load addresses
    loadAddresses(user);
    
    // Load orders
    loadOrders(user);
    
    // Load wishlist
    loadWishlist(user);
    
    // Load notification preferences
    loadNotificationPrefs(user);
}

function updateProfileHeader(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileAvatar) {
        profileAvatar.src = user.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';
        profileAvatar.style.opacity = '0';
        setTimeout(() => {
            profileAvatar.style.opacity = '1';
            profileAvatar.style.animation = 'float 4s ease-in-out infinite';
        }, 100);
    }
    
    if (profileName) {
        profileName.textContent = user.name || `${user.firstName} ${user.lastName}`;
        profileName.style.animation = 'fadeIn 0.5s ease';
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email || '';
        profileEmail.style.animation = 'fadeIn 0.5s ease';
    }
}

function loadPersonalInfo(user) {
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    
    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (dobInput) dobInput.value = user.dob || '';
}

function loadAddresses(user) {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;
    
    addressesList.innerHTML = '';
    
    if (!user.addresses || user.addresses.length === 0) {
        addressesList.innerHTML = '<p>No addresses saved yet.</p>';
        return;
    }
    
    user.addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.innerHTML = `
            <h4>${address.type} Address</h4>
            <p>${address.firstName} ${address.lastName}</p>
            <p>${address.line1}</p>
            ${address.line2 ? `<p>${address.line2}</p>` : ''}
            <p>${address.city}, ${address.state} ${address.postalCode}</p>
            <p>${getCountryName(address.country)}</p>
            <p>Phone: ${address.phone}</p>
            <div class="address-actions">
                <button class="primary" data-address-id="${address.id}" data-action="edit">Edit</button>
                <button class="secondary" data-address-id="${address.id}" data-action="remove">Remove</button>
                ${!address.isDefault ? `<button class="secondary" data-address-id="${address.id}" data-action="set-default">Set as Default</button>` : ''}
            </div>
        `;
        addressesList.appendChild(addressCard);
    });
    
    // Add event listeners to address action buttons
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', function() {
            editAddress(this.getAttribute('data-address-id'));
        });
    });
    
    document.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', function() {
            removeAddress(this.getAttribute('data-address-id'));
        });
    });
    
    document.querySelectorAll('[data-action="set-default"]').forEach(btn => {
        btn.addEventListener('click', function() {
            setDefaultAddress(this.getAttribute('data-address-id'));
        });
    });
}

function loadOrders(user) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (!user.orders || user.orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">No orders yet. Start shopping!</p>';
        return;
    }
    
    user.orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-item-card';
        
        let statusClass = '';
        let statusText = '';
        switch(order.status) {
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'Delivered';
                break;
            case 'processing':
                statusClass = 'status-pending';
                statusText = 'Processing';
                break;
            case 'shipped':
                statusClass = 'status-shipped';
                statusText = 'Shipped';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                break;
            case 'accepted':
                statusClass = 'status-accepted';
                statusText = 'Accepted by Delivery';
                break;
            case 'picked':
                statusClass = 'status-picked';
                statusText = 'Picked Up';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Processing';
        }
        
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Calculate total items
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Delivery info if available
        let deliveryInfo = '';
        if (order.deliveryBoy) {
            deliveryInfo = `<div class="order-delivery-info">
                <i class="fas fa-truck"></i> Delivered by ${order.deliveryBoy}
            </div>`;
        }
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h4>Order #${order.id}</h4>
                    <p class="order-date">${formattedDate}</p>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="order-summary">
                <div class="order-items-preview">
                    ${order.items.slice(0, 3).map(item => `
                        <img src="${item.image}" alt="${item.name}" class="order-item-preview" 
                             title="${item.name} (${item.quantity}x)">
                    `).join('')}
                    ${order.items.length > 3 ? `
                        <div class="order-more-items">+${order.items.length - 3} more</div>
                    ` : ''}
                </div>
                
                <div class="order-total-summary">
                    <p>${totalItems} item${totalItems !== 1 ? 's' : ''}</p>
                    <p class="order-total">$${order.total.toFixed(2)}</p>
                    ${deliveryInfo}
                </div>
            </div>
            
            <div class="order-actions">
                ${order.status === 'delivered' ? `
                    <button class="secondary" data-order-id="${order.id}" data-action="return">
                        <i class="fas fa-undo"></i> Return/Refund
                    </button>
                ` : ''}
                
                ${order.status === 'processing' ? `
                    <button class="secondary" data-order-id="${order.id}" data-action="cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : ''}
                
                <button class="primary" data-order-id="${order.id}" data-action="details">
                    <i class="fas fa-eye"></i> View Details
                </button>
                
                ${order.status !== 'cancelled' ? `
                    <button class="secondary" data-order-id="${order.id}" data-action="track">
                        <i class="fas fa-truck"></i> Track
                    </button>
                ` : ''}
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
    
    // Add event listeners
    document.querySelectorAll('[data-action="details"]').forEach(btn => {
        btn.addEventListener('click', function() {
            viewOrderDetails(this.getAttribute('data-order-id'));
        });
    });
    
    document.querySelectorAll('[data-action="track"]').forEach(btn => {
        btn.addEventListener('click', function() {
            trackOrder(this.getAttribute('data-order-id'));
        });
    });
    
    document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
        btn.addEventListener('click', function() {
            cancelOrder(this.getAttribute('data-order-id'));
        });
    });
    
    document.querySelectorAll('[data-action="return"]').forEach(btn => {
        btn.addEventListener('click', function() {
            initiateReturn(this.getAttribute('data-order-id'));
        });
    });
}

// ... [Previous code remains the same until viewOrderDetails function] ...

function viewOrderDetails(orderId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const order = user.orders.find(o => o.id === orderId);
    
    if (!order) {
        showToast('Order not found!', 'error');
        return;
    }
    
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    if (!orderDetailsModal) return;
    
    // Calculate return eligibility
    const deliveryDate = order.deliveredDate ? new Date(order.deliveredDate) : null;
    const returnDeadline = deliveryDate ? new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
    const canReturn = deliveryDate && (new Date() < returnDeadline) && order.status === 'delivered';
    
    // Populate basic order info
    document.getElementById('orderDetailsNumber').textContent = order.id;
    document.getElementById('orderDetailsDate').textContent = new Date(order.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set status with appropriate class
    const statusElement = document.getElementById('orderDetailsStatus');
    statusElement.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    statusElement.className = `order-status status-${order.status}`;
    
    // Populate items
    const itemsContainer = document.getElementById('orderDetailsItems');
    itemsContainer.innerHTML = '';
    
    order.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-details-item';
        
        // Check if item is eligible for return
        const canReturnItem = canReturn && !item.returnRequested;
        const returnStatus = item.returnRequested ? 
            `<div class="return-status">Return ${item.returnStatus || 'requested'}</div>` : '';
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="order-details-image">
            <div class="order-details-info">
                <h4>${item.name}</h4>
                <div>$${item.price.toFixed(2)} × ${item.quantity}</div>
                <div>Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
                ${returnStatus}
                ${canReturnItem ? `
                <div class="item-actions">
                    <button class="secondary" data-order-id="${order.id}" data-item-id="${item.id}" data-action="return-item">
                        <i class="fas fa-undo"></i> Return/Refund
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        itemsContainer.appendChild(itemElement);
    });
    
    // Add delivery information if available
    if (order.deliveryBoy || order.pickupLocation || order.deliveryLocation) {
        const deliveryInfo = document.createElement('div');
        deliveryInfo.className = 'delivery-info-section';
        deliveryInfo.innerHTML = `
            <h4>Delivery Information</h4>
            ${order.deliveryBoy ? `
                <div class="info-row">
                    <span class="info-label">Delivery Person:</span>
                    <span class="info-value">${order.deliveryBoy}</span>
                </div>
            ` : ''}
            ${order.pickupLocation ? `
                <div class="info-row">
                    <span class="info-label">Pickup Location:</span>
                    <span class="info-value">${order.pickupLocation}</span>
                </div>
            ` : ''}
            ${order.deliveryLocation ? `
                <div class="info-row">
                    <span class="info-label">Delivery Address:</span>
                    <span class="info-value">${order.deliveryLocation}</span>
                </div>
            ` : ''}
        `;
        itemsContainer.appendChild(deliveryInfo);
    }
    
    // Add order summary
    const orderSummary = document.createElement('div');
    orderSummary.className = 'order-summary-section';
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = order.shipping || 0;
    const tax = order.tax || 0;
    const discount = order.discount || 0;
    
    orderSummary.innerHTML = `
        <h4>Order Summary</h4>
        <div class="info-row">
            <span class="info-label">Subtotal:</span>
            <span class="info-value">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Shipping:</span>
            <span class="info-value">$${shipping.toFixed(2)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tax:</span>
            <span class="info-value">$${tax.toFixed(2)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Discount:</span>
            <span class="info-value">-$${discount.toFixed(2)}</span>
        </div>
        <div class="info-row total-row">
            <span class="info-label">Total:</span>
            <span class="info-value">$${order.total.toFixed(2)}</span>
        </div>
    `;
    itemsContainer.appendChild(orderSummary);
    
    // Populate timeline with delivery-specific events
    const timelineContainer = document.getElementById('orderTimeline');
    timelineContainer.innerHTML = '';
    
    const timelineEvents = [
        {
            status: 'Order Confirmed',
            date: new Date(order.date),
            completed: true,
            active: false,
            detail: 'Your order has been confirmed',
            icon: 'fa-check-circle'
        }
    ];
    
    // Add processing event if exists
    if (order.processingDate) {
        timelineEvents.push({
            status: 'Processing',
            date: new Date(order.processingDate),
            completed: true,
            active: false,
            detail: 'Seller is processing your order',
            icon: 'fa-cog'
        });
    }
    
    // Add delivery-specific events
    if (order.acceptedDate) {
        timelineEvents.push({
            status: 'Accepted by Delivery',
            date: new Date(order.acceptedDate),
            completed: true,
            active: false,
            detail: 'Delivery partner has accepted your order',
            icon: 'fa-user-check'
        });
    }
    
    if (order.pickedDate) {
        timelineEvents.push({
            status: 'Picked Up',
            date: new Date(order.pickedDate),
            completed: true,
            active: false,
            detail: 'Your order has been picked up',
            icon: 'fa-box-open'
        });
    }
    
    if (order.deliveredDate) {
        timelineEvents.push({
            status: 'Delivered',
            date: new Date(order.deliveredDate),
            completed: true,
            active: false,
            detail: 'Your order has been delivered',
            icon: 'fa-home'
        });
    } else {
        // If not delivered yet, show in transit
        timelineEvents.push({
            status: 'In Transit',
            date: order.pickedDate ? new Date(order.pickedDate) : new Date(),
            completed: false,
            active: order.status === 'picked',
            detail: 'Your order is on its way',
            icon: 'fa-truck'
        });
    }
    
    // Render timeline events
    timelineEvents.forEach(event => {
        const timelineStep = document.createElement('div');
        timelineStep.className = `timeline-step ${event.completed ? 'completed' : ''} ${event.active ? 'active' : ''}`;
        
        timelineStep.innerHTML = `
            <div class="timeline-icon"><i class="fas ${event.icon}"></i></div>
            <div class="timeline-content">
                <div class="timeline-status">${event.status}</div>
                <div class="timeline-date">${event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div class="timeline-detail">${event.detail}</div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineStep);
    });
    
    // Add help section if order is not delivered or cancelled
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
        const helpSection = document.createElement('div');
        helpSection.className = 'help-section';
        helpSection.innerHTML = `
            <h4>Need Help With This Order?</h4>
            <div class="help-options">
                <button class="secondary" data-order-id="${order.id}" data-help-type="change-number">
                    <i class="fas fa-phone"></i> Change Phone Number
                </button>
                <button class="secondary" data-order-id="${order.id}" data-help-type="change-address">
                    <i class="fas fa-map-marker-alt"></i> Change Delivery Address
                </button>
                <button class="secondary" data-order-id="${order.id}" data-help-type="change-date">
                    <i class="fas fa-calendar-alt"></i> Change Delivery Date
                </button>
                ${order.status === 'processing' ? `
                <button class="secondary" data-order-id="${order.id}" data-help-type="cancel-order">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
                ` : ''}
                <button class="primary" onclick="openChatModal('${order.id}')">
                    <i class="fas fa-comments"></i> Chat with Support
                </button>
            </div>
        `;
        itemsContainer.appendChild(helpSection);
        
        // Add event listeners to help buttons
        document.querySelectorAll('[data-help-type]').forEach(btn => {
            btn.addEventListener('click', function() {
                const helpType = this.getAttribute('data-help-type');
                handleHelpRequest(orderId, helpType);
            });
        });
    }
    
    // Show modal
    orderDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ... [Rest of the code remains the same] ...

function initiateReturn(orderId, itemId = null) {
    const returnModal = document.getElementById('returnModal');
    if (!returnModal) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    const order = user.orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Check if order is eligible for return (within 7-10 days of delivery)
    const deliveryDate = order.deliveredDate ? new Date(order.deliveredDate) : null;
    const returnDeadline = deliveryDate ? new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
    
    if (deliveryDate && new Date() > returnDeadline) {
        showToast('Return period has expired (7 days after delivery)', 'error');
        return;
    }
    
    // Reset form
    document.getElementById('returnForm').reset();
    document.getElementById('returnOrderId').value = orderId;
    document.getElementById('returnItemId').value = itemId || '';
    
    // Set item info
    if (itemId) {
        const item = order.items.find(i => i.id === itemId);
        if (item) {
            document.getElementById('returnItemInfo').innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="return-item-image">
                <div class="return-item-details">
                    <div class="return-item-name">${item.name}</div>
                    <div class="return-item-attr">${item.variant || ''} | Quantity: ${item.quantity}</div>
                    <div class="return-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `;
        }
    } else {
        document.getElementById('returnItemInfo').innerHTML = `
            <div class="return-item-details" style="width:100%">
                <div class="return-item-name">Full Order Return</div>
                <div class="return-item-attr">${order.items.length} item${order.items.length !== 1 ? 's' : ''}</div>
                <div class="return-item-price">$${order.total.toFixed(2)}</div>
            </div>
        `;
    }
    
    // Set up return options
    const returnOptionsContainer = document.createElement('div');
    returnOptionsContainer.className = 'return-options-container';
    returnOptionsContainer.innerHTML = `
        <label class="return-option-card" id="refundOptionCard">
            <div class="return-option-header">
                <input type="radio" name="returnType" value="refund" checked>
                <div class="return-option-title">Refund</div>
            </div>
            <div class="return-option-details">
                Get your money back to original payment method or store credit
            </div>
            <div class="refund-method-options">
                <div class="form-group">
                    <label>Refund Method:</label>
                    <select id="refundMethod" class="form-control">
                        <option value="original">Original Payment Method</option>
                        <option value="wallet">Store Credit (Instant)</option>
                        <option value="bank">Bank Transfer (5-7 days)</option>
                    </select>
                </div>
            </div>
        </label>
        
        <label class="return-option-card" id="exchangeOptionCard">
            <div class="return-option-header">
                <input type="radio" name="returnType" value="exchange">
                <div class="return-option-title">Exchange</div>
            </div>
            <div class="return-option-details">
                Get a replacement item (only available for size/color exchanges)
            </div>
            <div class="exchange-options" style="display:none">
                <div class="form-group">
                    <label>Reason for Exchange:</label>
                    <select id="exchangeReason" class="form-control">
                        <option value="">Select reason</option>
                        <option value="wrong-size">Wrong Size</option>
                        <option value="wrong-color">Wrong Color</option>
                        <option value="damaged">Item Damaged</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Replacement Item:</label>
                    <select id="replacementItem" class="form-control">
                        <option value="">Select replacement</option>
                        ${itemId ? generateExchangeOptions(order.items.find(i => i.id === itemId)) : ''}
                    </select>
                </div>
            </div>
        </label>
    `;
    
    document.getElementById('returnForm').insertBefore(returnOptionsContainer, document.getElementById('returnForm').firstChild);
    
    // Set up pickup details
    const pickupDetails = document.createElement('div');
    pickupDetails.className = 'pickup-details';
    pickupDetails.innerHTML = `
        <h4>Pickup Details</h4>
        <div class="form-group">
            <label>Pickup Address:</label>
            <select id="pickupAddress" class="form-control" required>
                <option value="">Select pickup address</option>
                ${user.addresses?.map(addr => `
                    <option value="${addr.id}" ${addr.isDefault ? 'selected' : ''}>
                        ${addr.line1}, ${addr.city}, ${addr.state}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Preferred Pickup Date:</label>
            <input type="date" id="pickupDate" class="form-control" required
                   min="${new Date().toISOString().split('T')[0]}" 
                   max="${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
            <label>Time Slot:</label>
            <div class="time-slot-options">
                <div class="time-slot" data-slot="9-12">9 AM - 12 PM</div>
                <div class="time-slot" data-slot="12-3">12 PM - 3 PM</div>
                <div class="time-slot" data-slot="3-6">3 PM - 6 PM</div>
                <div class="time-slot" data-slot="6-9">6 PM - 9 PM</div>
            </div>
        </div>
    `;
    
    document.getElementById('returnForm').appendChild(pickupDetails);
    
    // Set up event listeners
    document.getElementById('refundOptionCard').addEventListener('click', function() {
        document.querySelector('input[name="returnType"][value="refund"]').checked = true;
        document.querySelector('.refund-method-options').style.display = 'block';
        document.querySelector('.exchange-options').style.display = 'none';
        this.classList.add('selected');
        document.getElementById('exchangeOptionCard').classList.remove('selected');
    });
    
    document.getElementById('exchangeOptionCard').addEventListener('click', function() {
        document.querySelector('input[name="returnType"][value="exchange"]').checked = true;
        document.querySelector('.refund-method-options').style.display = 'none';
        document.querySelector('.exchange-options').style.display = 'block';
        this.classList.add('selected');
        document.getElementById('refundOptionCard').classList.remove('selected');
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Form submission
    document.getElementById('returnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReturn();
    });
    
    // Show modal
    returnModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function generateExchangeOptions(item) {
    if (!item) return '';
    
    // In a real app, this would fetch available variants from the server
    const variants = [
        { id: 'variant1', name: `${item.name} - Large`, price: item.price },
        { id: 'variant2', name: `${item.name} - Blue`, price: item.price },
        { id: 'variant3', name: `${item.name} - Replacement`, price: item.price }
    ];
    
    return variants.map(v => `
        <option value="${v.id}">${v.name} - $${v.price.toFixed(2)}</option>
    `).join('');
}

function submitReturn() {
    const form = document.getElementById('returnForm');
    const orderId = form.returnOrderId.value;
    const itemId = form.returnItemId.value;
    const returnType = document.querySelector('input[name="returnType"]:checked').value;
    const refundMethod = document.getElementById('refundMethod').value;
    const exchangeReason = document.getElementById('exchangeReason').value;
    const pickupAddress = form.pickupAddress.value;
    const pickupDate = form.pickupDate.value;
    const timeSlot = document.querySelector('.time-slot.selected')?.getAttribute('data-slot');
    const comments = form.returnComments.value;
    
    if (!pickupAddress || !pickupDate || !timeSlot) {
        showToast('Please fill all pickup details', 'error');
        return;
    }
    
    if (returnType === 'exchange' && !exchangeReason) {
        showToast('Please select a reason for exchange', 'error');
        return;
    }
    
    // Update order/items in user data
    const user = JSON.parse(localStorage.getItem('user'));
    const order = user.orders.find(o => o.id === orderId);
    
    const returnData = {
        id: `ret_${Date.now()}`,
        orderId,
        itemId,
        type: returnType,
        refundMethod: returnType === 'refund' ? refundMethod : null,
        exchangeReason: returnType === 'exchange' ? exchangeReason : null,
        pickupAddress,
        pickupDate,
        timeSlot,
        status: 'requested',
        date: new Date().toISOString(),
        comments,
        processed: false,
        refundIssued: false
    };
    
    if (itemId) {
        // Single item return
        const item = order.items.find(i => i.id === itemId);
        if (item) {
            item.returnRequested = true;
            item.returnStatus = 'requested';
            item.returnData = returnData;
            
            if (!order.returns) order.returns = [];
            order.returns.push(returnData);
        }
    } else {
        // Full order return
        order.items.forEach(item => {
            item.returnRequested = true;
            item.returnStatus = 'requested';
        });
        
        if (!order.returns) order.returns = [];
        order.returns.push({
            ...returnData,
            fullOrder: true
        });
    }
    
    // Save changes
    localStorage.setItem('user', JSON.stringify(user));
    
    let message = `Return request submitted for ${itemId ? 'item' : 'order'} ${itemId || orderId}. `;
    message += `Type: ${returnType}. `;
    message += `Pickup scheduled for ${pickupDate} (${timeSlot}).`;
    
    showToast(message);
    closeModal();
    
    // Reload orders to show updated status
    loadOrders(user);
}

function trackOrder(orderId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const order = user.orders.find(o => o.id === orderId);
    
    if (!order) {
        showToast('Order not found!', 'error');
        return;
    }
    
    // In a real app, this would fetch tracking info from a courier API
    const trackingInfo = {
        status: order.status,
        estimatedDelivery: order.estimatedDelivery || 
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        courier: order.courier || 'Standard Delivery',
        trackingNumber: order.trackingNumber || 'TRK' + Math.floor(Math.random() * 1000000),
        history: generateTrackingHistory(order)
    };
    
    // Show tracking info in a modal or new page
    const trackingModal = document.createElement('div');
    trackingModal.className = 'modal-overlay active';
    trackingModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Tracking Order #${orderId}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="tracking-container">
                <div class="tracking-summary">
                    <p><strong>Courier:</strong> ${trackingInfo.courier}</p>
                    <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
                    <p><strong>Status:</strong> <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
                    <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery}</p>
                </div>
                
                <div class="tracking-timeline">
                    ${trackingInfo.history.map(event => `
                        <div class="tracking-event ${event.current ? 'current' : ''}">
                            <div class="event-icon"><i class="fas ${event.icon}"></i></div>
                            <div class="event-content">
                                <div class="event-status">${event.status}</div>
                                <div class="event-date">${event.date}</div>
                                <div class="event-location">${event.location || ''}</div>
                                <div class="event-detail">${event.details}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="tracking-actions">
                    <button class="primary" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(trackingInfo.courier + ' tracking ' + trackingInfo.trackingNumber)}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> View Full Tracking
                    </button>
                    <button class="secondary modal-close" onclick="this.closest('.modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(trackingModal);
    document.body.style.overflow = 'hidden';
}

function generateTrackingHistory(order) {
    const events = [];
    
    // Order confirmed
    events.push({
        status: 'Order Confirmed',
        date: new Date(order.date).toLocaleString(),
        details: 'Your order has been confirmed',
        icon: 'fa-check-circle',
        current: false
    });
    
    // Processing
    if (order.processingDate) {
        events.push({
            status: 'Processing',
            date: new Date(order.processingDate).toLocaleString(),
            details: 'Seller is processing your order',
            icon: 'fa-cog',
            current: order.status === 'processing'
        });
    }
    
    // Shipped
    if (order.shippedDate) {
        events.push({
            status: 'Shipped',
            date: new Date(order.shippedDate).toLocaleString(),
            details: `Shipped via ${order.courier || 'standard delivery'}`,
            location: order.shipFrom || 'Warehouse',
            icon: 'fa-shipping-fast',
            current: order.status === 'shipped'
        });
    }
    
    // In transit
    if (order.status === 'shipped') {
        events.push({
            status: 'In Transit',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
            details: 'Package is on its way',
            location: 'In transit',
            icon: 'fa-truck',
            current: true
        });
    }
    
    // Out for delivery
    if (order.outForDeliveryDate) {
        events.push({
            status: 'Out for Delivery',
            date: new Date(order.outForDeliveryDate).toLocaleString(),
            details: 'Courier is delivering your package',
            location: order.shipToCity || 'Your city',
            icon: 'fa-truck-loading',
            current: order.status === 'out_for_delivery'
        });
    }
    
    // Delivered
    if (order.deliveredDate) {
        events.push({
            status: 'Delivered',
            date: new Date(order.deliveredDate).toLocaleString(),
            details: 'Package has been delivered',
            location: order.shipToAddress ? order.shipToAddress.split(',')[0] : 'Your address',
            icon: 'fa-home',
            current: order.status === 'delivered'
        });
    }
    
    return events;
}

function openChatModal(orderId) {
    const chatModal = document.getElementById('chatModal');
    if (!chatModal) return;
    
    // Clear previous messages
    document.getElementById('chatMessages').innerHTML = `
        <div class="chat-bot-message">
            <div class="message-content">
                <p>Hello! I'm your virtual assistant. How can I help you with order #${orderId} today?</p>
            </div>
            <div class="message-time">Just now</div>
        </div>
    `;
    
    // Add quick questions
    const quickQuestions = document.createElement('div');
    quickQuestions.className = 'quick-questions-container';
    quickQuestions.innerHTML = `
        <p>Quick questions about order #${orderId}:</p>
        <button class="quick-question secondary" data-question="tracking">
            <i class="fas fa-truck"></i> Where is my order?
        </button>
        <button class="quick-question secondary" data-question="return">
            <i class="fas fa-undo"></i> How do I return an item?
        </button>
        <button class="quick-question secondary" data-question="refund">
            <i class="fas fa-money-bill-wave"></i> When will I get my refund?
        </button>
    `;
    document.getElementById('chatMessages').appendChild(quickQuestions);
    
    // Set up quick questions
    document.querySelectorAll('.quick-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionType = this.getAttribute('data-question');
            sendQuickQuestion(questionType, orderId);
        });
    });
    
    // Set up chat input
    const sendBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    
    sendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Show modal
    chatModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus input field
    setTimeout(() => {
        chatInput.focus();
    }, 100);
}

function sendQuickQuestion(questionType, orderId) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Add user question
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-user-message';
    
    let questionText = '';
    switch(questionType) {
        case 'tracking':
            questionText = 'Where is my order?';
            break;
        case 'return':
            questionText = 'How do I return an item?';
            break;
        case 'refund':
            questionText = 'When will I get my refund?';
            break;
    }
    
    userMessage.innerHTML = `
        <div class="message-content">
            <p>${questionText}</p>
        </div>
        <div class="message-time">Just now</div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate bot response after delay
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-bot-message';
        
        let responseText = '';
        switch(questionType) {
            case 'tracking':
                responseText = `Your order #${orderId} is currently in transit. Expected delivery date is ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`;
                break;
            case 'return':
                responseText = 'To return an item, go to your order details and click "Return/Refund" on the item you want to return. You can choose between refund or exchange.';
                break;
            case 'refund':
                responseText = 'Refunds are processed within 5-7 business days after we receive your returned item. Wallet credits are usually instant after pickup.';
                break;
        }
        
        botMessage.innerHTML = `
            <div class="message-content">
                <p>${responseText}</p>
            </div>
            <div class="message-time">Just now</div>
        `;
        chatMessages.appendChild(botMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-user-message';
    userMessage.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
        <div class="message-time">Just now</div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate bot response after delay
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-bot-message';
        
        // Simple response logic - in a real app, you'd use NLP or predefined responses
        let responseText = "Thank you for your message. Our support team will get back to you shortly.";
        if (message.toLowerCase().includes('track') || message.toLowerCase().includes('where')) {
            responseText = "You can track your order from the order details page. Would you like me to open it for you?";
        } else if (message.toLowerCase().includes('return') || message.toLowerCase().includes('refund')) {
            responseText = "For returns or refunds, please visit the order details and click on the Return/Refund button for the specific item.";
        }
        
        botMessage.innerHTML = `
            <div class="message-content">
                <p>${responseText}</p>
            </div>
            <div class="message-time">Just now</div>
        `;
        chatMessages.appendChild(botMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
}

function handleHelpRequest(orderId, helpType) {
    let message = '';
    
    switch(helpType) {
        case 'change-number':
            message = `Request to change phone number for order ${orderId} has been submitted.`;
            break;
        case 'change-address':
            message = `Request to change delivery address for order ${orderId} has been submitted.`;
            break;
        case 'change-date':
            message = `Request to change delivery date for order ${orderId} has been submitted.`;
            break;
        case 'cancel-order':
            cancelOrder(orderId);
            closeModal();
            return;
    }
    
    showToast(message);
}

function loadWishlist(user) {
    const wishlistItems = document.getElementById('wishlistItems');
    if (!wishlistItems) return;
    
    wishlistItems.innerHTML = '';
    
    if (!user.wishlist || user.wishlist.length === 0) {
        wishlistItems.innerHTML = '<p>Your wishlist is empty. Start adding items!</p>';
        return;
    }
    
    user.wishlist.forEach(item => {
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <img src="${item.image}" alt="Product" class="wishlist-item-img">
            <div class="wishlist-item-details">
                <h4>${item.name}</h4>
                <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
                <p>${item.description || ''}</p>
                <div class="wishlist-actions">
                    <button class="primary add-to-cart-from-wishlist" data-item-id="${item.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="secondary remove-from-wishlist" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        wishlistItems.appendChild(wishlistItem);
    });
    
    // Add event listeners to wishlist buttons
    document.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
        btn.addEventListener('click', function() {
            addToCartFromWishlist(this.getAttribute('data-item-id'));
        });
    });
    
    document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFromWishlist(this.getAttribute('data-item-id'));
        });
    });
}

function loadNotificationPrefs(user) {
    if (user.notificationPrefs) {
        document.getElementById('emailNotifications').checked = user.notificationPrefs.email || false;
        document.getElementById('smsNotifications').checked = user.notificationPrefs.sms || false;
        document.getElementById('pushNotifications').checked = user.notificationPrefs.push || false;
    }
    
    // Add event listener for save button
    document.getElementById('saveNotificationPrefs').addEventListener('click', function() {
        const user = JSON.parse(localStorage.getItem('user'));
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        user.notificationPrefs = {
            email: document.getElementById('emailNotifications').checked,
            sms: document.getElementById('smsNotifications').checked,
            push: document.getElementById('pushNotifications').checked
        };
        
        if (users[user.email]) {
            users[user.email].notificationPrefs = user.notificationPrefs;
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('Notification preferences saved!');
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav a');
    const sections = document.querySelectorAll('.profile-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            showLoading();
            
            setTimeout(() => {
                // Update active tab
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(`${sectionId}-section`).classList.add('active');
            }, 500);
        });
    });
}

function setupForms() {
    const editPersonalBtn = document.getElementById('editPersonalBtn');
    const savePersonalBtn = document.getElementById('savePersonalBtn');
    const personalForm = document.getElementById('personalForm');
    
    if (editPersonalBtn && savePersonalBtn) {
        editPersonalBtn.addEventListener('click', function() {
            const inputs = document.querySelectorAll('#personalForm input:not([disabled])');
            inputs.forEach(input => input.removeAttribute('disabled'));
            editPersonalBtn.style.display = 'none';
            savePersonalBtn.style.display = 'inline-block';
        });
    }
    
    if (personalForm) {
        personalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;
            
            // Update user data
            user.firstName = document.getElementById('firstName').value;
            user.lastName = document.getElementById('lastName').value;
            user.phone = document.getElementById('phone').value;
            user.dob = document.getElementById('dob').value;
            user.name = `${user.firstName} ${user.lastName}`;
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update the users object
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[user.email]) {
                users[user.email] = user;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Disable inputs again
            const inputs = document.querySelectorAll('#personalForm input');
            inputs.forEach(input => input.setAttribute('disabled', true));
            editPersonalBtn.style.display = 'inline-block';
            savePersonalBtn.style.display = 'none';
            
            // Update profile header
            updateProfileHeader(user);
            
            showToast('Profile updated successfully!');
        });
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match!', 'error');
                return;
            }
            
            const user = JSON.parse(localStorage.getItem('user'));
            const users = JSON.parse(localStorage.getItem('users')) || {};
            
            // Verify current password
            if (user.password !== currentPassword) {
                showToast('Current password is incorrect!', 'error');
                return;
            }
            
            // Update password
            user.password = newPassword;
            users[user.email].password = newPassword;
            
            // Save changes
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('users', JSON.stringify(users));
            
            showToast('Password changed successfully!');
            passwordForm.reset();
        });
    }
}

function setupButtonEffects() {
    // Ripple effect for all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
        });
    });
}

function setupModals() {
    const modal = document.getElementById('addressModal');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            openAddressModal();
        });
    }
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal();
        });
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Address form submission
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAddress();
        });
    }
}

function openAddressModal(addressId = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');
    
    if (addressId) {
        // Edit mode - load address data
        const user = JSON.parse(localStorage.getItem('user'));
        const address = user.addresses.find(a => a.id == addressId);
        
        if (address) {
            document.getElementById('addressFirstName').value = address.firstName;
            document.getElementById('addressLastName').value = address.lastName;
            document.getElementById('addressLine1').value = address.line1;
            document.getElementById('addressLine2').value = address.line2 || '';
            document.getElementById('addressCity').value = address.city;
            document.getElementById('addressState').value = address.state;
            document.getElementById('addressPostalCode').value = address.postalCode;
            document.getElementById('addressCountry').value = address.country;
            document.getElementById('addressPhone').value = address.phone;
            document.getElementById('defaultAddress').checked = address.isDefault;
            
            form.setAttribute('data-address-id', addressId);
            document.querySelector('.modal-header h3').textContent = 'Edit Address';
        }
    } else {
        // Add new mode - reset form
        form.reset();
        form.removeAttribute('data-address-id');
        document.querySelector('.modal-header h3').textContent = 'Add New Address';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function saveAddress() {
    const form = document.getElementById('addressForm');
    const addressId = form.getAttribute('data-address-id');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const addressData = {
        id: addressId || Date.now(),
        type: document.getElementById('defaultAddress').checked ? 'Home' : 'Other',
        firstName: document.getElementById('addressFirstName').value,
        lastName: document.getElementById('addressLastName').value,
        line1: document.getElementById('addressLine1').value,
        line2: document.getElementById('addressLine2').value,
        city: document.getElementById('addressCity').value,
        state: document.getElementById('addressState').value,
        postalCode: document.getElementById('addressPostalCode').value,
        country: document.getElementById('addressCountry').value,
        phone: document.getElementById('addressPhone').value,
        isDefault: document.getElementById('defaultAddress').checked
    };
    
    if (addressId) {
        // Update existing address
        const index = user.addresses.findIndex(a => a.id == addressId);
        if (index !== -1) {
            user.addresses[index] = addressData;
        }
    } else {
        // Add new address
        if (!user.addresses) user.addresses = [];
        user.addresses.push(addressData);
    }
    
    // If this is set as default, unset others
    if (addressData.isDefault) {
        user.addresses.forEach(addr => {
            if (addr.id !== addressData.id) {
                addr.isDefault = false;
            }
        });
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    loadAddresses(user);
    closeModal();
    showToast(`Address ${addressId ? 'updated' : 'added'} successfully!`);
}

function editAddress(addressId) {
    openAddressModal(addressId);
}

function removeAddress(addressId) {
    if (confirm('Are you sure you want to remove this address?')) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.addresses = user.addresses.filter(a => a.id != addressId);
        localStorage.setItem('user', JSON.stringify(user));
        loadAddresses(user);
        showToast('Address removed successfully!');
    }
}

function setDefaultAddress(addressId) {
    const user = JSON.parse(localStorage.getItem('user'));
    user.addresses.forEach(addr => {
        addr.isDefault = (addr.id == addressId);
    });
    localStorage.setItem('user', JSON.stringify(user));
    loadAddresses(user);
    showToast('Default address updated!');
}

function addToCartFromWishlist(itemId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const item = user.wishlist.find(i => i.id == itemId);
    
    if (item) {
        showToast(`${item.name} added to cart!`);
    }
}

function removeFromWishlist(itemId) {
    if (confirm('Remove this item from your wishlist?')) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.wishlist = user.wishlist.filter(i => i.id != itemId);
        
        // Update in users object as well
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[user.email]) {
            users[user.email].wishlist = users[user.email].wishlist.filter(i => i.id != itemId);
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('users', JSON.stringify(users));
        loadWishlist(user);
        showToast('Item removed from wishlist!');
    }
}

function loadDeliveryOrders() {
    const user = JSON.parse(localStorage.getItem('user'));
    const deliveryBoy = JSON.parse(localStorage.getItem('deliveryBoy')) || {};
    
    // If this is a delivery boy, add delivery-specific orders
    if (deliveryBoy.id && user.role === 'delivery') {
        // Get all orders from localStorage that this delivery boy has handled
        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const deliveredOrders = allOrders.filter(order => 
            order.deliveryBoyId === deliveryBoy.id && order.status === 'delivered'
        );
        
        // Add these to the user's order history for viewing
        if (!user.orders) user.orders = [];
        deliveredOrders.forEach(deliveryOrder => {
            if (!user.orders.some(o => o.id === deliveryOrder.id)) {
                user.orders.push({
                    id: deliveryOrder.id,
                    date: deliveryOrder.date || new Date().toISOString(),
                    status: 'delivered',
                    total: deliveryOrder.total || 0,
                    items: deliveryOrder.items || [],
                    shippingInfo: deliveryOrder.shippingInfo || {},
                    deliveryBoyId: deliveryBoy.id,
                    deliveredDate: deliveryOrder.deliveredDate || new Date().toISOString()
                });
            }
        });
        
        localStorage.setItem('user', JSON.stringify(user));
    }
}

function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const user = JSON.parse(localStorage.getItem('user'));
        const orderIndex = user.orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1 && user.orders[orderIndex].status === 'processing') {
            user.orders[orderIndex].status = 'cancelled';
            
            // Update in users object as well
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[user.email]) {
                const userIndex = users[user.email].orders.findIndex(o => o.id === orderId);
                if (userIndex !== -1) {
                    users[user.email].orders[userIndex].status = 'cancelled';
                }
            }
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('users', JSON.stringify(users));
            loadOrders(user);
            showToast('Order cancelled successfully!');
        } else {
            showToast('Order cannot be cancelled at this stage.', 'error');
        }
    }
}

function getCountryName(countryCode) {
    const countries = {
        'US': 'United States',
        'CA': 'Canada',
        'UK': 'United Kingdom'
    };
    return countries[countryCode] || countryCode;
}

function createRippleEffect(button, event) {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-circle"></div>
            <div class="spinner-circle"></div>
            <div class="spinner-circle"></div>
        </div>
    `;
    document.body.appendChild(loading);
    
    setTimeout(() => {
        loading.remove();
    }, 1000);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}