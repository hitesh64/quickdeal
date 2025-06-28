// deldashboard.js - Enhanced Delivery Partner Dashboard Solution

// DOM Elements
const elements = {
    deliveryBoyName: document.getElementById('deliveryBoyName'),
    deliveryBoyEmail: document.getElementById('deliveryBoyEmail'),
    deliveryBoyAvatar: document.getElementById('deliveryBoyAvatar'),
    toggleStatusBtn: document.getElementById('toggleStatus'),
    logoutBtn: document.getElementById('logoutBtn'),
    todayDeliveries: document.getElementById('todayDeliveries'),
    todayEarnings: document.getElementById('todayEarnings'),
    deliveryRating: document.getElementById('deliveryRating'),
    activeTime: document.getElementById('activeTime'),
    refreshMapBtn: document.getElementById('refreshMap'),
    navigateBtn: document.getElementById('navigateBtn'),
    currentLocationBtn: document.getElementById('currentLocationBtn'),
    orderFilter: document.getElementById('orderFilter'),
    ordersList: document.getElementById('ordersList'),
    orderModal: document.getElementById('orderModal'),
    closeModalBtn: document.getElementById('closeModal'),
    updateStatusBtn: document.getElementById('updateStatusBtn'),
    verifyOTPBtn: document.getElementById('verifyOTPBtn'),
    resendOTPBtn: document.getElementById('resendOTPBtn'),
    contactCustomerBtn: document.getElementById('contactCustomer'),
    notificationBell: document.getElementById('notificationBell'),
    notificationCount: document.getElementById('notificationCount'),
    notificationSound: document.getElementById('notificationSound'),
    successSound: document.getElementById('successSound'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    otpInput: document.getElementById('otpInput'),
    themeToggle: document.getElementById('themeToggle'),
    notificationModal: document.getElementById('notificationModal'),
    closeNotificationModal: document.getElementById('closeNotificationModal'),
    notificationList: document.getElementById('notificationList'),
    viewOrderFromNotification: document.getElementById('viewOrderFromNotification'),
    notificationDetailModal: document.getElementById('notificationDetailModal'),
    closeNotificationDetailModal: document.getElementById('closeNotificationDetailModal'),
    notificationMessage: document.getElementById('notificationMessage'),
    notificationOrderId: document.getElementById('notificationOrderId'),
    notificationAddress: document.getElementById('notificationAddress'),
    notificationAmount: document.getElementById('notificationAmount'),
    notificationItems: document.getElementById('notificationItems'),
    notificationTimestamp: document.getElementById('notificationTimestamp'),
    otpTimer: document.getElementById('otpTimer'),
    routeDistance: document.getElementById('routeDistance'),
    routeTime: document.getElementById('routeTime'),
    routeEarnings: document.getElementById('routeEarnings'),
    modalOrderId: document.getElementById('modalOrderId'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    deliveryAddress: document.getElementById('deliveryAddress'),
    deliveryInstructions: document.getElementById('deliveryInstructions'),
    orderSubtotal: document.getElementById('orderSubtotal'),
    deliveryFee: document.getElementById('deliveryFee'),
    orderTotal: document.getElementById('orderTotal'),
    modalItemsList: document.getElementById('modalItemsList'),
    assignedTime: document.getElementById('assignedTime'),
    acceptedTime: document.getElementById('acceptedTime'),
    pickedTime: document.getElementById('pickedTime'),
    deliveredTime: document.getElementById('deliveredTime'),
    otpSection: document.getElementById('otpSection'),
    orderHistoryTab: document.getElementById('orderHistoryTab'),
    currentOrdersTab: document.getElementById('currentOrdersTab'),
    orderHistoryList: document.getElementById('orderHistoryList'),
    missingItemBtn: document.getElementById('missingItemBtn'),
    reportIssueBtn: document.getElementById('reportIssueBtn'),
    issueModal: document.getElementById('issueModal'),
    closeIssueModal: document.getElementById('closeIssueModal'),
    issueTypeSelect: document.getElementById('issueType'),
    issueDescription: document.getElementById('issueDescription'),
    submitIssueBtn: document.getElementById('submitIssueBtn'),
    itemSelectionModal: document.getElementById('itemSelectionModal'),
    closeItemSelectionModal: document.getElementById('closeItemSelectionModal'),
    missingItemsList: document.getElementById('missingItemsList'),
    confirmMissingItemsBtn: document.getElementById('confirmMissingItemsBtn'),
    storeProductsList: document.getElementById('storeProductsList') // Added for store visibility
};

// Delivery Boy Data Model
let deliveryBoy = {
    id: '',
    name: 'Delivery Partner',
    email: '',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    status: 'offline',
    onlineTime: 0,
    lastOnlineTime: 0,
    location: { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
    deliveriesToday: 0,
    earnings: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    rating: 4.5,
    notifications: [],
    vehicleType: 'bike',
    phone: '+919876543210',
    isAvailable: true,
    currentOrder: null,
    history: [],
    reportedIssues: []
};

// Map Variables
let map;
let deliveryBoyMarker;
let orderMarkers = [];
let mapInitialized = false;
let directionsService;
let directionsRenderer;
let otpInterval;
let watchPositionId = null;

// Store Products Data
let storeProducts = [];

// Utility Functions
const utils = {
    showLoading: () => {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'flex';
        }
    },
    
    hideLoading: () => {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
    },
    
    formatCurrency: (amount) => `₹${amount?.toFixed(2) || '0.00'}`,
    
    formatStatus: (status) => {
        const statusMap = {
            'pending': 'Pending',
            'assigned': 'Assigned',
            'accepted': 'Accepted',
            'picked': 'Picked Up',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'issue_reported': 'Issue Reported'
        };
        return statusMap[status] || status;
    },
    
    formatTime: (timeString) => {
        if (!timeString) return '--:--';
        const time = new Date(timeString);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    formatDate: (timeString) => {
        if (!timeString) return '--/--/----';
        const date = new Date(timeString);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    },
    
    showToast: (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; // Distance in km
    },
    
    getRandomLocationNear: (center, radiusInKm = 5) => {
        const radius = radiusInKm / 111.32; // Convert km to degrees
        const y0 = center.lat;
        const x0 = center.lng;
        
        const u = Math.random();
        const v = Math.random();
        
        const w = radius * Math.sqrt(u);
        const t = 2 * Math.PI * v;
        const x = w * Math.cos(t);
        const y = w * Math.sin(t);
        
        return {
            lat: y + y0,
            lng: x + x0
        };
    },
    
    toggleDarkMode: (enable) => {
        if (enable) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (elements.themeToggle) {
                elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (elements.themeToggle) {
                elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    },
    
    checkDarkModePreference: () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            utils.toggleDarkMode(true);
        }
    },
    
    startOTPTimer: (duration = 120) => {
        let timeLeft = duration;
        clearInterval(otpInterval);
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            if (elements.otpTimer) {
                elements.otpTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(otpInterval);
                if (elements.otpInput) elements.otpInput.disabled = true;
                if (elements.verifyOTPBtn) elements.verifyOTPBtn.disabled = true;
                if (elements.resendOTPBtn) elements.resendOTPBtn.style.display = 'block';
            }
            timeLeft--;
        };
        
        updateTimer();
        otpInterval = setInterval(updateTimer, 1000);
    },
    
    resetOTPTimer: () => {
        clearInterval(otpInterval);
        if (elements.otpInput) elements.otpInput.disabled = false;
        if (elements.verifyOTPBtn) elements.verifyOTPBtn.disabled = false;
        if (elements.resendOTPBtn) elements.resendOTPBtn.style.display = 'none';
        utils.startOTPTimer();
    },
    
    // New function to load store products
    loadStoreProducts: () => {
        try {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            storeProducts = products.filter(product => product.visible !== false);
            
            if (elements.storeProductsList) {
                elements.storeProductsList.innerHTML = '';
                
                if (storeProducts.length === 0) {
                    elements.storeProductsList.innerHTML = '<p class="no-products">No products available</p>';
                    return;
                }
                
                storeProducts.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                        </div>
                        <div class="product-details">
                            <h3>${product.name}</h3>
                            <p class="product-price">${utils.formatCurrency(product.price)}</p>
                            <p class="product-category">${product.category || 'General'}</p>
                        </div>
                    `;
                    elements.storeProductsList.appendChild(productCard);
                });
            }
        } catch (e) {
            console.error('Error loading store products:', e);
        }
    }
};

// Data Management Functions
const dataManager = {
    saveDeliveryBoyData: () => {
        try {
            localStorage.setItem('deliveryBoyData', JSON.stringify(deliveryBoy));
            
            const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
            const dbIndex = deliveryBoys.findIndex(db => db.id === deliveryBoy.id);
            
            if (dbIndex !== -1) {
                deliveryBoys[dbIndex] = deliveryBoy;
            } else {
                deliveryBoys.push(deliveryBoy);
            }
            
            localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
            return true;
        } catch (e) {
            console.error('Error saving delivery boy data:', e);
            return false;
        }
    },
    
    getAvailableDeliveryBoys: () => {
        try {
            const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
            return deliveryBoys.filter(db => db.status === 'online' && db.isAvailable);
        } catch (e) {
            console.error('Error reading delivery boys:', e);
            return [];
        }
    },
    
    assignOrderToDeliveryBoy: (orderId) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex === -1) return false;
            
            if (orders[orderIndex].status !== 'pending') {
                return false;
            }
            
            const availableDeliveryBoys = dataManager.getAvailableDeliveryBoys();
            
            if (availableDeliveryBoys.length === 0) {
                utils.showToast('No available delivery partners at the moment', 'warning');
                return false;
            }
            
            let nearestDeliveryBoy = null;
            let minDistance = Infinity;
            
            availableDeliveryBoys.forEach(db => {
                if (db.location && orders[orderIndex].location) {
                    const distance = utils.calculateDistance(
                        db.location.lat,
                        db.location.lng,
                        orders[orderIndex].location.lat,
                        orders[orderIndex].location.lng
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestDeliveryBoy = db;
                    }
                }
            });
            
            if (!nearestDeliveryBoy) {
                const randomIndex = Math.floor(Math.random() * availableDeliveryBoys.length);
                nearestDeliveryBoy = availableDeliveryBoys[randomIndex];
            }
            
            // Update order
            orders[orderIndex].status = 'assigned';
            orders[orderIndex].deliveryBoyId = nearestDeliveryBoy.id;
            orders[orderIndex].deliveryBoyName = nearestDeliveryBoy.name;
            orders[orderIndex].assignedTime = new Date().toISOString();
            
            // Update delivery boy status
            const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
            const dbIndex = deliveryBoys.findIndex(db => db.id === nearestDeliveryBoy.id);
            
            if (dbIndex !== -1) {
                deliveryBoys[dbIndex].isAvailable = false;
                deliveryBoys[dbIndex].currentOrder = orderId;
                localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
            }
            
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Notify the delivery boy
            if (nearestDeliveryBoy.id === deliveryBoy.id) {
                notificationManager.addNotification({
                    type: 'new_order',
                    message: 'New order assigned to you!',
                    orderId: orderId,
                    orderAddress: orders[orderIndex].deliveryAddress,
                    orderAmount: orders[orderIndex].total,
                    items: orders[orderIndex].items,
                    timestamp: new Date().toISOString(),
                    read: false
                });
                
                if (elements.notificationSound) {
                    elements.notificationSound.play().catch(e => console.log('Audio play failed:', e));
                }
                
                // Force refresh the orders list and map
                orderManager.loadOrders(elements.orderFilter?.value);
                mapManager.updateOrderMarkers();
                
                // Show notification modal and order details immediately
                notificationManager.showNotificationDetailModal({
                    type: 'new_order',
                    message: 'New order assigned to you!',
                    orderId: orderId,
                    orderAddress: orders[orderIndex].deliveryAddress,
                    orderAmount: orders[orderIndex].total,
                    items: orders[orderIndex].items,
                    timestamp: new Date().toISOString()
                });
                
                // Show order details immediately
                setTimeout(() => {
                    orderManager.showOrderDetails(orderId);
                }, 500);
                
                // Update current order in UI
                deliveryBoy.currentOrder = orderId;
                dataManager.saveDeliveryBoyData();
                
                return true;
            }
            
            return true;
        } catch (e) {
            console.error('Error assigning order:', e);
            return false;
        }
    },
    
    getAllOrders: (includeHistory = false) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const currentOrders = orders.filter(order => order.deliveryBoyId === deliveryBoy.id);
            
            if (includeHistory) {
                return currentOrders;
            }
            
            return currentOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
        } catch (e) {
            console.error('Error reading orders:', e);
            return [];
        }
    },
    
    getOrderById: (orderId) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        return orders.find(order => order.id === orderId);
    },
    
    updateOrderStatus: (orderId, status) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderIndex = orders.findIndex(o => o.id === orderId);

            if (orderIndex !== -1) {
                const previousStatus = orders[orderIndex].status;
                orders[orderIndex].status = status;
                
                if (status === 'accepted') {
                    orders[orderIndex].acceptedDate = new Date().toISOString();
                } else if (status === 'picked') {
                    orders[orderIndex].pickedDate = new Date().toISOString();
                    orders[orderIndex].otp = Math.floor(1000 + Math.random() * 9000);
                } else if (status === 'delivered') {
                    orders[orderIndex].deliveredDate = new Date().toISOString();
                    deliveryBoy.deliveriesToday += 1;
                    deliveryBoy.totalDeliveries += 1;
                    deliveryBoy.earnings += orders[orderIndex].deliveryFee || 30;
                    deliveryBoy.totalEarnings += orders[orderIndex].deliveryFee || 30;
                    
                    // Add to history
                    deliveryBoy.history.unshift({
                        orderId: orderId,
                        date: new Date().toISOString(),
                        amount: orders[orderIndex].deliveryFee || 30,
                        customerName: orders[orderIndex].customerName,
                        address: orders[orderIndex].deliveryAddress,
                        status: 'delivered'
                    });
                    
                    // Mark delivery boy as available again
                    const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
                    const dbIndex = deliveryBoys.findIndex(db => db.id === deliveryBoy.id);
                    
                    if (dbIndex !== -1) {
                        deliveryBoys[dbIndex].isAvailable = true;
                        deliveryBoys[dbIndex].currentOrder = null;
                        localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
                    }
                    
                    // Update UI
                    if (elements.todayDeliveries) {
                        elements.todayDeliveries.textContent = deliveryBoy.deliveriesToday;
                    }
                    if (elements.todayEarnings) {
                        elements.todayEarnings.textContent = utils.formatCurrency(deliveryBoy.earnings);
                    }
                    
                    dataManager.saveDeliveryBoyData();
                    
                    notificationManager.addNotification({
                        type: 'delivery_completed',
                        message: 'Delivery completed successfully!',
                        orderId: orderId,
                        timestamp: new Date().toISOString(),
                        read: false
                    });
                    
                    // Play success sound
                    if (elements.successSound) {
                        elements.successSound.play().catch(e => console.log('Audio play failed:', e));
                    }
                } else if (status === 'cancelled') {
                    // Mark delivery boy as available if order is cancelled
                    const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
                    const dbIndex = deliveryBoys.findIndex(db => db.id === deliveryBoy.id);
                    
                    if (dbIndex !== -1) {
                        deliveryBoys[dbIndex].isAvailable = true;
                        deliveryBoys[dbIndex].currentOrder = null;
                        localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
                    }
                    
                    // Add to history if order was cancelled after being assigned
                    if (previousStatus !== 'pending') {
                        deliveryBoy.history.unshift({
                            orderId: orderId,
                            date: new Date().toISOString(),
                            amount: 0,
                            customerName: orders[orderIndex].customerName,
                            address: orders[orderIndex].deliveryAddress,
                            status: 'cancelled'
                        });
                        dataManager.saveDeliveryBoyData();
                    }
                }

                localStorage.setItem('orders', JSON.stringify(orders));
                orderManager.loadOrders(elements.orderFilter?.value);
                orderManager.showOrderDetails(orderId);
                mapManager.updateOrderMarkers();
                utils.showToast(`Order status updated to ${utils.formatStatus(status)}`, 'success');
                
                // Update customer's order status
                updateCustomerOrderStatus(orderId, status);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error updating order status:', e);
            utils.showToast('Failed to update order status', 'error');
            return false;
        }
    },
    
    reportOrderIssue: (orderId, issueType, description, missingItems = []) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex === -1) return false;
            
            const issue = {
                id: 'issue-' + Date.now().toString(36),
                orderId: orderId,
                type: issueType,
                description: description,
                missingItems: missingItems,
                timestamp: new Date().toISOString(),
                status: 'reported',
                resolved: false
            };
            
            // Add issue to order
            if (!orders[orderIndex].issues) {
                orders[orderIndex].issues = [];
            }
            orders[orderIndex].issues.push(issue);
            orders[orderIndex].status = 'issue_reported';
            
            // Add issue to delivery boy's reported issues
            deliveryBoy.reportedIssues.unshift(issue);
            
            // Save data
            localStorage.setItem('orders', JSON.stringify(orders));
            dataManager.saveDeliveryBoyData();
            
            // Update UI
            orderManager.loadOrders(elements.orderFilter?.value);
            orderManager.showOrderDetails(orderId);
            
            // Notify admin (simulated)
            notificationManager.addNotification({
                type: 'issue_reported',
                message: `Issue reported for order #${orderId.substring(0, 8)}`,
                orderId: orderId,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            utils.showToast('Issue reported successfully', 'success');
            return true;
        } catch (e) {
            console.error('Error reporting issue:', e);
            utils.showToast('Failed to report issue', 'error');
            return false;
        }
    },
    
    initializeSampleData: () => {
        // Initialize sample products if none exists
        if (!localStorage.getItem('products')) {
            const sampleProducts = [
                {
                    id: 'prod-' + Math.random().toString(36).substr(2, 8),
                    name: 'Margherita Pizza',
                    description: 'Classic pizza with tomato sauce and mozzarella cheese',
                    price: 299,
                    category: 'Pizza',
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    visible: true
                },
                {
                    id: 'prod-' + Math.random().toString(36).substr(2, 8),
                    name: 'Chicken Biryani',
                    description: 'Fragrant basmati rice cooked with chicken and spices',
                    price: 199,
                    category: 'Rice',
                    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    visible: true
                },
                {
                    id: 'prod-' + Math.random().toString(36).substr(2, 8),
                    name: 'Garlic Bread',
                    description: 'Toasted bread with garlic butter',
                    price: 99,
                    category: 'Bread',
                    image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    visible: true
                },
                {
                    id: 'prod-' + Math.random().toString(36).substr(2, 8),
                    name: 'Raita',
                    description: 'Yogurt with cucumber and spices',
                    price: 49,
                    category: 'Side',
                    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    visible: true
                }
            ];
            localStorage.setItem('products', JSON.stringify(sampleProducts));
        }
        
        // Initialize sample orders if none exists
        if (!localStorage.getItem('orders')) {
            const sampleOrders = [
                {
                    id: 'order-' + Math.random().toString(36).substr(2, 8),
                    customerName: 'Rahul Sharma',
                    customerPhone: '+919876543210',
                    deliveryAddress: '123 MG Road, Bangalore, Karnataka 560001',
                    deliveryInstructions: 'Call before delivery',
                    items: [
                        { id: 'item-1', name: 'Pizza Margherita', price: 299, quantity: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
                        { id: 'item-2', name: 'Garlic Bread', price: 99, quantity: 2, image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
                    ],
                    subtotal: 497,
                    deliveryFee: 30,
                    total: 527,
                    status: 'pending',
                    deliveryBoyId: '',
                    location: { lat: 12.9758, lng: 77.5995 },
                    time: new Date().toISOString()
                },
                {
                    id: 'order-' + Math.random().toString(36).substr(2, 8),
                    customerName: 'Priya Patel',
                    customerPhone: '+919876543211',
                    deliveryAddress: '456 Brigade Road, Bangalore, Karnataka 560001',
                    deliveryInstructions: 'Leave at door',
                    items: [
                        { id: 'item-3', name: 'Chicken Biryani', price: 199, quantity: 2, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
                        { id: 'item-4', name: 'Raita', price: 49, quantity: 1, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
                    ],
                    subtotal: 447,
                    deliveryFee: 30,
                    total: 477,
                    status: 'pending',
                    deliveryBoyId: '',
                    location: { lat: 12.9702, lng: 77.6083 },
                    time: new Date().toISOString()
                }
            ];
            localStorage.setItem('orders', JSON.stringify(sampleOrders));
        }
        
        // Initialize delivery boys if none exists
        if (!localStorage.getItem('deliveryBoys')) {
            localStorage.setItem('deliveryBoys', JSON.stringify([deliveryBoy]));
        }
    },
    
    createOrderFromCheckout: (checkoutData) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const users = JSON.parse(localStorage.getItem('users')) || {};
            const user = users[checkoutData.email] || {};
            
            // Generate random location near the center point
            const center = { lat: 12.9716, lng: 77.5946 }; // Bangalore center
            const orderLocation = utils.getRandomLocationNear(center, 10); // Within 10km radius
            
            const newOrder = {
                id: 'order-' + Date.now().toString(36),
                customerName: checkoutData.firstName + ' ' + checkoutData.lastName,
                customerPhone: checkoutData.phone,
                deliveryAddress: checkoutData.address + ', ' + checkoutData.city + ', ' + checkoutData.state + ' ' + checkoutData.postalCode,
                deliveryInstructions: checkoutData.deliveryInstructions || '',
                items: checkoutData.items.map(item => ({
                    id: 'item-' + Date.now().toString(36),
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || ''
                })),
                subtotal: checkoutData.subtotal,
                deliveryFee: checkoutData.deliveryFee || 30,
                total: checkoutData.total,
                status: 'pending',
                deliveryBoyId: '',
                location: orderLocation,
                time: new Date().toISOString()
            };
            
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Add order to user's order history
            if (!user.orders) user.orders = [];
            user.orders.unshift({
                id: newOrder.id,
                date: newOrder.time,
                status: 'pending',
                total: newOrder.total,
                items: newOrder.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                }))
            });
            
            users[checkoutData.email] = user;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Try to assign immediately
            dataManager.assignOrderToDeliveryBoy(newOrder.id);
            
            return newOrder.id;
        } catch (e) {
            console.error('Error creating order from checkout:', e);
            return null;
        }
    },
    
    // Auto-assign pending orders to available delivery partners
    autoAssignPendingOrders: () => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const pendingOrders = orders.filter(order => order.status === 'pending');
            
            pendingOrders.forEach(order => {
                if (!order.deliveryBoyId) {
                    dataManager.assignOrderToDeliveryBoy(order.id);
                }
            });
        } catch (e) {
            console.error('Error auto-assigning orders:', e);
        }
    }
};

// Function to update customer's order status
function updateCustomerOrderStatus(orderId, status) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    let orderUpdated = false;

    // Find the user who placed this order
    for (const email in users) {
        const user = users[email];
        if (user.orders) {
            const orderIndex = user.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                user.orders[orderIndex].status = status;
                
                if (status === 'assigned') {
                    user.orders[orderIndex].assignedDate = new Date().toISOString();
                    user.orders[orderIndex].deliveryBoy = deliveryBoy.name;
                } else if (status === 'accepted') {
                    user.orders[orderIndex].acceptedDate = new Date().toISOString();
                } else if (status === 'picked') {
                    user.orders[orderIndex].pickedDate = new Date().toISOString();
                    user.orders[orderIndex].deliveryOTP = Math.floor(1000 + Math.random() * 9000);
                } else if (status === 'delivered') {
                    user.orders[orderIndex].deliveredDate = new Date().toISOString();
                    user.orders[orderIndex].deliveryBoy = deliveryBoy.name;
                } else if (status === 'issue_reported') {
                    user.orders[orderIndex].issueReported = true;
                }
                
                orderUpdated = true;
                break;
            }
        }
    }

    if (orderUpdated) {
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Notification Manager
const notificationManager = {
    addNotification: (notification) => {
        if (!deliveryBoy.notifications) {
            deliveryBoy.notifications = [];
        }
        deliveryBoy.notifications.unshift(notification);
        dataManager.saveDeliveryBoyData();
        notificationManager.updateNotificationCount();
    },
    
    updateNotificationCount: () => {
        if (!deliveryBoy.notifications) return;
        
        const unreadCount = deliveryBoy.notifications.filter(n => !n.read).length;
        if (elements.notificationCount) {
            elements.notificationCount.textContent = unreadCount;
            elements.notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    },
    
    showNotificationModal: () => {
        if (!elements.notificationModal) return;
        
        notificationManager.loadNotifications();
        elements.notificationModal.classList.add('active');
    },
    
    showNotificationDetailModal: (notification) => {
        if (!elements.notificationDetailModal) return;
        
        if (elements.notificationMessage) elements.notificationMessage.textContent = notification.message;
        if (elements.notificationOrderId) elements.notificationOrderId.textContent = `#${notification.orderId?.substring(0, 8) || 'N/A'}`;
        if (elements.notificationAddress) elements.notificationAddress.textContent = notification.orderAddress || 'N/A';
        if (elements.notificationAmount) elements.notificationAmount.textContent = utils.formatCurrency(notification.orderAmount || 0);
        if (elements.notificationTimestamp) elements.notificationTimestamp.textContent = 
            `${utils.formatTime(notification.timestamp)} • ${utils.formatDate(notification.timestamp)}`;
        
        // Populate items
        if (elements.notificationItems) {
            elements.notificationItems.innerHTML = '';
            if (notification.items && notification.items.length > 0) {
                const itemsList = document.createElement('div');
                itemsList.className = 'items-list';
                
                notification.items.forEach(item => {
                    const itemRow = document.createElement('div');
                    itemRow.className = 'item-row';
                    itemRow.innerHTML = `
                        <div class="item-info">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                            <span>${item.name} × ${item.quantity}</span>
                        </div>
                        <span>${utils.formatCurrency(item.price * item.quantity)}</span>
                    `;
                    itemsList.appendChild(itemRow);
                });
                
                elements.notificationItems.appendChild(itemsList);
            }
        }
        
        if (elements.viewOrderFromNotification && notification.orderId) {
            elements.viewOrderFromNotification.dataset.orderId = notification.orderId;
        }
        
        if (!notification.read) {
            deliveryBoy.notifications = deliveryBoy.notifications.map(n => 
                n.orderId === notification.orderId ? {...n, read: true} : n
            );
            dataManager.saveDeliveryBoyData();
            notificationManager.updateNotificationCount();
        }
        
        elements.notificationDetailModal.classList.add('active');
        
        // Play notification sound
        if (elements.notificationSound) {
            elements.notificationSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Auto-show order details if this is a new order notification
        if (notification.type === 'new_order' && notification.orderId) {
            setTimeout(() => {
                orderManager.showOrderDetails(notification.orderId);
            }, 500);
        }
    },
    
    loadNotifications: () => {
        if (!elements.notificationList) return;
        
        elements.notificationList.innerHTML = '';
        
        if (!deliveryBoy.notifications || deliveryBoy.notifications.length === 0) {
            elements.notificationList.innerHTML = '<div class="no-notifications">No notifications yet</div>';
            return;
        }
        
        deliveryBoy.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            
            let iconClass = 'fa-bell';
            if (notification.type === 'new_order') iconClass = 'fa-box';
            if (notification.type === 'delivery_completed') iconClass = 'fa-check-circle';
            if (notification.type === 'warning') iconClass = 'fa-exclamation-triangle';
            if (notification.type === 'issue_reported') iconClass = 'fa-exclamation-circle';
            
            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${iconClass} ${notification.type === 'new_order' ? 'text-primary' : notification.type === 'delivery_completed' ? 'text-success' : 'text-warning'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${utils.formatTime(notification.timestamp)}</span>
                        <span class="notification-date">${utils.formatDate(notification.timestamp)}</span>
                    </div>
                    ${notification.orderId ? `<div class="notification-order-id">Order #${notification.orderId.substring(0, 8)}</div>` : ''}
                </div>
            `;
            
            notificationItem.addEventListener('click', () => {
                notificationManager.showNotificationDetailModal(notification);
                if (elements.notificationModal) {
                    elements.notificationModal.classList.remove('active');
                }
                
                if (!notification.read) {
                    notification.read = true;
                    dataManager.saveDeliveryBoyData();
                    notificationManager.updateNotificationCount();
                }
            });
            
            elements.notificationList.appendChild(notificationItem);
        });
    },
    
    markAllAsRead: () => {
        if (deliveryBoy.notifications && deliveryBoy.notifications.some(n => !n.read)) {
            deliveryBoy.notifications = deliveryBoy.notifications.map(n => ({...n, read: true}));
            dataManager.saveDeliveryBoyData();
            notificationManager.updateNotificationCount();
        }
    }
};

// Order Manager
const orderManager = {
    loadOrders: (filter = 'all', tab = 'current') => {
        if (!elements.ordersList && !elements.orderHistoryList) return;
        
        const targetElement = tab === 'current' ? elements.ordersList : elements.orderHistoryList;
        if (!targetElement) return;
        
        targetElement.innerHTML = '';
        let orders = tab === 'current' ? 
            dataManager.getAllOrders() : 
            dataManager.getAllOrders(true).filter(o => o.status === 'delivered' || o.status === 'cancelled');

        if (filter !== 'all') {
            orders = orders.filter(order => order.status === filter);
        }

        if (orders.length === 0) {
            targetElement.innerHTML = '<p class="no-orders">No orders found</p>';
            return;
        }

        // Sort orders by time (newest first)
        orders.sort((a, b) => new Date(b.time) - new Date(a.time));

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.dataset.id = order.id;
            
            // Highlight newly assigned orders (within last 5 minutes)
            const isNew = order.status === 'assigned' && 
                         new Date() - new Date(order.assignedTime || order.time) < 300000;
            
            if (isNew) {
                orderCard.classList.add('new-order');
            }
            
            // Calculate time since assignment for active orders
            let timeInfo = '';
            if (order.status === 'assigned' || order.status === 'accepted' || order.status === 'picked' || order.status === 'issue_reported') {
                const assignedTime = new Date(order.assignedTime || order.time);
                const now = new Date();
                const diffMinutes = Math.floor((now - assignedTime) / (1000 * 60));
                
                if (diffMinutes < 60) {
                    timeInfo = `${diffMinutes} min ago`;
                } else {
                    const diffHours = Math.floor(diffMinutes / 60);
                    timeInfo = `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
                }
            }
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <span class="order-id">#${order.id.substring(0, 8)}</span>
                    <span class="order-status status-${order.status}">${utils.formatStatus(order.status)}</span>
                    ${isNew ? '<span class="new-badge">NEW</span>' : ''}
                </div>
                <div class="order-details">
                    <span><i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress.split(',')[0]}</span>
                    <span><i class="fas fa-clock"></i> ${utils.formatTime(order.time)}</span>
                </div>
                <div class="order-details">
                    <span><i class="fas fa-box"></i> ${order.items.length} item${order.items.length !== 1 ? 's' : ''}</span>
                    <span><i class="fas fa-rupee-sign"></i> ${order.total.toFixed(2)}</span>
                </div>
                ${timeInfo ? `<div class="order-time-info"><i class="fas fa-hourglass-half"></i> ${timeInfo}</div>` : ''}
                <div class="order-actions">
                    <button class="btn-secondary view-details" data-id="${order.id}">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            `;
            targetElement.appendChild(orderCard);
        });

        // Add event listeners to all view details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.dataset.id;
                orderManager.showOrderDetails(orderId);
            });
        });
    },
    
    showOrderDetails: (orderId) => {
        const order = dataManager.getOrderById(orderId);
        if (!order) return;

        // Update modal content
        if (elements.modalOrderId) elements.modalOrderId.textContent = `#${order.id.substring(0, 8)}`;
        if (elements.customerName) elements.customerName.textContent = order.customerName;
        if (elements.customerPhone) elements.customerPhone.textContent = order.customerPhone;
        if (elements.deliveryAddress) elements.deliveryAddress.textContent = order.deliveryAddress;
        if (elements.deliveryInstructions) elements.deliveryInstructions.textContent = order.deliveryInstructions || 'No special instructions';
        if (elements.orderSubtotal) elements.orderSubtotal.textContent = utils.formatCurrency(order.subtotal);
        if (elements.deliveryFee) elements.deliveryFee.textContent = utils.formatCurrency(order.deliveryFee || 30);
        if (elements.orderTotal) elements.orderTotal.textContent = utils.formatCurrency(order.total);

        // Update items list with images if available
        if (elements.modalItemsList) {
            elements.modalItemsList.innerHTML = '';
            order.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'item-row';
                
                // Check if item has an image property
                const itemImage = item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : '';
                
                itemRow.innerHTML = `
                    <div class="item-info">
                        ${itemImage}
                        <span>${item.name}</span>
                    </div>
                    <span>${utils.formatCurrency(item.price * item.quantity)}</span>
                `;
                elements.modalItemsList.appendChild(itemRow);
            });
        }

        // Update timeline
        if (elements.assignedTime) {
            elements.assignedTime.textContent = order.assignedTime ? 
                `${utils.formatTime(order.assignedTime)} • ${utils.formatDate(order.assignedTime)}` : '--:--';
        }
        if (elements.acceptedTime) {
            elements.acceptedTime.textContent = order.acceptedDate ? 
                `${utils.formatTime(order.acceptedDate)} • ${utils.formatDate(order.acceptedDate)}` : '--:--';
        }
        if (elements.pickedTime) {
            elements.pickedTime.textContent = order.pickedDate ? 
                `${utils.formatTime(order.pickedDate)} • ${utils.formatDate(order.pickedDate)}` : '--:--';
        }
        if (elements.deliveredTime) {
            elements.deliveredTime.textContent = order.deliveredDate ? 
                `${utils.formatTime(order.deliveredDate)} • ${utils.formatDate(order.deliveredDate)}` : '--:--';
        }

        // Show/hide OTP section based on order status
        if (elements.otpSection) {
            if (order.status === 'picked') {
                elements.otpSection.style.display = 'block';
                if (elements.otpInput) elements.otpInput.value = '';
                utils.resetOTPTimer();
            } else {
                elements.otpSection.style.display = 'none';
            }
        }

        // Update status button text and actions
        if (elements.updateStatusBtn) {
            let nextAction = '';
            let btnClass = 'btn-primary';
            
            switch (order.status) {
                case 'assigned':
                    nextAction = 'Accept';
                    break;
                case 'accepted':
                    nextAction = 'Pick Up';
                    break;
                case 'picked':
                    nextAction = 'Deliver';
                    btnClass = 'btn-success';
                    break;
                case 'delivered':
                case 'cancelled':
                    nextAction = 'Completed';
                    btnClass = 'btn-secondary';
                    elements.updateStatusBtn.disabled = true;
                    break;
                case 'issue_reported':
                    nextAction = 'Issue Reported';
                    btnClass = 'btn-warning';
                    elements.updateStatusBtn.disabled = true;
                    break;
                default:
                    nextAction = 'Update';
            }

            elements.updateStatusBtn.textContent = nextAction;
            elements.updateStatusBtn.className = `btn ${btnClass} btn-block`;
            elements.updateStatusBtn.dataset.orderId = order.id;
            elements.updateStatusBtn.dataset.currentStatus = order.status;
        }

        // Show contact customer button if order is assigned, accepted or picked
        if (elements.contactCustomerBtn) {
            if (order.status === 'assigned' || order.status === 'accepted' || order.status === 'picked' || order.status === 'issue_reported') {
                elements.contactCustomerBtn.style.display = 'block';
                elements.contactCustomerBtn.dataset.phone = order.customerPhone;
            } else {
                elements.contactCustomerBtn.style.display = 'none';
            }
        }

        // Show report issue buttons if order is picked
        if (elements.missingItemBtn && elements.reportIssueBtn) {
            if (order.status === 'picked') {
                elements.missingItemBtn.style.display = 'block';
                elements.missingItemBtn.dataset.orderId = order.id;
                elements.reportIssueBtn.style.display = 'block';
                elements.reportIssueBtn.dataset.orderId = order.id;
            } else {
                elements.missingItemBtn.style.display = 'none';
                elements.reportIssueBtn.style.display = 'none';
            }
        }

        // Update map with route if order is assigned, accepted or picked
        if (order.status === 'assigned' || order.status === 'accepted' || order.status === 'picked') {
            mapManager.showRoute(deliveryBoy.location, order.location);
        } else {
            mapManager.clearRoute();
        }

        // Show the modal
        if (elements.orderModal) {
            elements.orderModal.classList.add('active');
        }
    },

    updateOrderStatus: function(orderId, currentStatus) {
        let newStatus = '';
        
        switch (currentStatus) {
            case 'assigned':
                newStatus = 'accepted';
                break;
            case 'accepted':
                newStatus = 'picked';
                break;
            case 'picked':
                newStatus = 'delivered';
                break;
            default:
                utils.showToast('No further action available for this order', 'info');
                return;
        }

        dataManager.updateOrderStatus(orderId, newStatus);
    },

    verifyOTP: function(orderId, enteredOTP) {
        const order = dataManager.getOrderById(orderId);
        if (!order) {
            utils.showToast('Order not found', 'error');
            return false;
        }

        if (order.otp == enteredOTP) {
            dataManager.updateOrderStatus(orderId, 'delivered');
            return true;
        } else {
            utils.showToast('Incorrect OTP', 'error');
            return false;
        }
    },
    
    showMissingItemsModal: function(orderId) {
        const order = dataManager.getOrderById(orderId);
        if (!order) return;
        
        if (elements.itemSelectionModal && elements.missingItemsList) {
            elements.missingItemsList.innerHTML = '';
            
            order.items.forEach(item => {
                const itemCheckbox = document.createElement('div');
                itemCheckbox.className = 'form-check';
                itemCheckbox.innerHTML = `
                    <input type="checkbox" class="form-check-input" id="item-${item.id}" value="${item.id}">
                    <label class="form-check-label" for="item-${item.id}">
                        ${item.name} (${item.quantity} × ${utils.formatCurrency(item.price)})
                    </label>
                `;
                elements.missingItemsList.appendChild(itemCheckbox);
            });
            
            if (elements.confirmMissingItemsBtn) {
                elements.confirmMissingItemsBtn.dataset.orderId = orderId;
            }
            
            elements.itemSelectionModal.classList.add('active');
        }
    },
    
    reportMissingItems: function(orderId) {
        const selectedItems = [];
        document.querySelectorAll('#missingItemsList input[type="checkbox"]:checked').forEach(checkbox => {
            const order = dataManager.getOrderById(orderId);
            if (order) {
                const item = order.items.find(i => i.id === checkbox.value);
                if (item) {
                    selectedItems.push({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    });
                }
            }
        });
        
        if (selectedItems.length === 0) {
            utils.showToast('Please select at least one missing item', 'error');
            return;
        }
        
        dataManager.reportOrderIssue(
            orderId, 
            'missing_items', 
            `The following items are missing from the order: ${selectedItems.map(i => i.name).join(', ')}`,
            selectedItems
        );
        
        if (elements.itemSelectionModal) {
            elements.itemSelectionModal.classList.remove('active');
        }
    },
    
    showReportIssueModal: function(orderId) {
        if (elements.issueModal) {
            if (elements.issueTypeSelect) {
                elements.issueTypeSelect.value = 'damaged_items';
            }
            if (elements.issueDescription) {
                elements.issueDescription.value = '';
            }
            if (elements.submitIssueBtn) {
                elements.submitIssueBtn.dataset.orderId = orderId;
            }
            elements.issueModal.classList.add('active');
        }
    },
    
    reportIssue: function(orderId) {
        const issueType = elements.issueTypeSelect?.value || 'other';
        const description = elements.issueDescription?.value || '';
        
        if (!description.trim()) {
            utils.showToast('Please provide a description of the issue', 'error');
            return;
        }
        
        dataManager.reportOrderIssue(
            orderId, 
            issueType, 
            description
        );
        
        if (elements.issueModal) {
            elements.issueModal.classList.remove('active');
        }
    }
};

// Map Manager
const mapManager = {
    initMap: function() {
        if (mapInitialized) return;

        // Initialize Google Map
        map = new google.maps.Map(document.getElementById('map'), {
            center: deliveryBoy.location,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
                {
                    "featureType": "poi",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "transit",
                    "stylers": [{"visibility": "off"}]
                }
            ]
        });

        // Create delivery boy marker
        deliveryBoyMarker = new google.maps.Marker({
            position: deliveryBoy.location,
            map: map,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            },
            title: 'Your Location'
        });

        // Initialize directions service
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 6
            }
        });

        mapInitialized = true;
        mapManager.updateOrderMarkers();
    },

    updateDeliveryBoyLocation: function(newLocation) {
        deliveryBoy.location = newLocation;
        dataManager.saveDeliveryBoyData();

        if (deliveryBoyMarker) {
            deliveryBoyMarker.setPosition(newLocation);
        }

        // Center map to new location if not following an order
        if (!deliveryBoy.currentOrder) {
            map.panTo(newLocation);
        }

        // Update route if currently showing one
        const currentOrder = deliveryBoy.currentOrder ? 
            dataManager.getOrderById(deliveryBoy.currentOrder) : null;
        
        if (currentOrder && (currentOrder.status === 'assigned' || 
                            currentOrder.status === 'accepted' || 
                            currentOrder.status === 'picked')) {
            mapManager.showRoute(newLocation, currentOrder.location);
        }
    },

    updateOrderMarkers: function() {
        // Clear existing markers
        orderMarkers.forEach(marker => marker.setMap(null));
        orderMarkers = [];

        // Get current orders
        const orders = dataManager.getAllOrders();

        // Add markers for each order
        orders.forEach(order => {
            const marker = new google.maps.Marker({
                position: order.location,
                map: map,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(30, 30)
                },
                title: `Order #${order.id.substring(0, 8)}`
            });

            // Add click event to show order details
            marker.addListener('click', () => {
                orderManager.showOrderDetails(order.id);
            });

            orderMarkers.push(marker);
        });
    },

    showRoute: function(start, end) {
        if (!mapInitialized || !directionsService || !directionsRenderer) return;

        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                
                // Update route info
                const route = response.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;
                const earnings = Math.max(30, Math.round(route.legs[0].distance.value / 1000) * 10); // ₹10 per km, min ₹30
                
                if (elements.routeDistance) elements.routeDistance.textContent = distance;
                if (elements.routeTime) elements.routeTime.textContent = duration;
                if (elements.routeEarnings) elements.routeEarnings.textContent = utils.formatCurrency(earnings);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    },

    clearRoute: function() {
        if (directionsRenderer) {
            directionsRenderer.setMap(null);
        }
    },

    centerMapToCurrentLocation: function() {
        if (navigator.geolocation) {
            utils.showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    mapManager.updateDeliveryBoyLocation(pos);
                    utils.hideLoading();
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    utils.showToast('Unable to get current location', 'error');
                    utils.hideLoading();
                }
            );
        } else {
            utils.showToast('Geolocation is not supported by this browser', 'error');
        }
    },

    startTrackingLocation: function() {
        if (watchPositionId !== null) return;

        if (navigator.geolocation) {
            watchPositionId = navigator.geolocation.watchPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    mapManager.updateDeliveryBoyLocation(pos);
                },
                (error) => {
                    console.error('Error tracking location:', error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10000,
                    timeout: 5000
                }
            );
        }
    },

    stopTrackingLocation: function() {
        if (watchPositionId !== null) {
            navigator.geolocation.clearWatch(watchPositionId);
            watchPositionId = null;
        }
    }
};

// Event Listeners
function setupEventListeners() {
    // Toggle delivery status
    if (elements.toggleStatusBtn) {
        elements.toggleStatusBtn.addEventListener('click', function() {
            deliveryBoy.status = deliveryBoy.status === 'online' ? 'offline' : 'online';
            deliveryBoy.isAvailable = deliveryBoy.status === 'online';
            
            if (deliveryBoy.status === 'online') {
                deliveryBoy.lastOnlineTime = new Date().toISOString();
                mapManager.startTrackingLocation();
                // Check for pending orders when going online
                dataManager.autoAssignPendingOrders();
            } else {
                deliveryBoy.onlineTime += (new Date() - new Date(deliveryBoy.lastOnlineTime));
                mapManager.stopTrackingLocation();
            }
            
            dataManager.saveDeliveryBoyData();
            updateUI();
            utils.showToast(`You are now ${deliveryBoy.status === 'online' ? 'online' : 'offline'}`);
        });
    }

    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', function() {
            if (deliveryBoy.status === 'online') {
                deliveryBoy.status = 'offline';
                deliveryBoy.onlineTime += (new Date() - new Date(deliveryBoy.lastOnlineTime));
                dataManager.saveDeliveryBoyData();
                mapManager.stopTrackingLocation();
            }
            
            // Redirect to login page
            window.location.href = 'dellogin.html';
        });
    }

    // Refresh map button
    if (elements.refreshMapBtn) {
        elements.refreshMapBtn.addEventListener('click', function() {
            mapManager.centerMapToCurrentLocation();
        });
    }

    // Current location button
    if (elements.currentLocationBtn) {
        elements.currentLocationBtn.addEventListener('click', function() {
            mapManager.centerMapToCurrentLocation();
        });
    }

    // Order filter
    if (elements.orderFilter) {
        elements.orderFilter.addEventListener('change', function() {
            orderManager.loadOrders(this.value);
        });
    }

    // Close modal button
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', function() {
            if (elements.orderModal) {
                elements.orderModal.classList.remove('active');
            }
        });
    }

    // Update status button
    if (elements.updateStatusBtn) {
        elements.updateStatusBtn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const currentStatus = this.dataset.currentStatus;
            
            if (currentStatus === 'picked') {
                if (elements.otpInput) {
                    const enteredOTP = elements.otpInput.value;
                    if (!enteredOTP || enteredOTP.length !== 4) {
                        utils.showToast('Please enter a valid 4-digit OTP', 'error');
                        return;
                    }
                    
                    orderManager.verifyOTP(orderId, enteredOTP);
                }
            } else {
                orderManager.updateOrderStatus(orderId, currentStatus);
            }
        });
    }

    // Verify OTP button
    if (elements.verifyOTPBtn) {
        elements.verifyOTPBtn.addEventListener('click', function() {
            const orderId = elements.updateStatusBtn?.dataset.orderId;
            if (!orderId) return;
            
            if (elements.otpInput) {
                const enteredOTP = elements.otpInput.value;
                if (!enteredOTP || enteredOTP.length !== 4) {
                    utils.showToast('Please enter a valid 4-digit OTP', 'error');
                    return;
                }
                
                orderManager.verifyOTP(orderId, enteredOTP);
            }
        });
    }

    // Resend OTP button
    if (elements.resendOTPBtn) {
        elements.resendOTPBtn.addEventListener('click', function() {
            const orderId = elements.updateStatusBtn?.dataset.orderId;
            if (!orderId) return;
            
            const order = dataManager.getOrderById(orderId);
            if (!order) return;
            
            // Generate new OTP
            const newOTP = Math.floor(1000 + Math.random() * 9000);
            
            // Update order with new OTP
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].otp = newOTP;
                localStorage.setItem('orders', JSON.stringify(orders));
                
                // Update customer's order with new OTP
                updateCustomerOrderStatus(orderId, 'picked');
                
                utils.resetOTPTimer();
                utils.showToast('New OTP generated and sent to customer', 'success');
            }
        });
    }

    // Contact customer button
    if (elements.contactCustomerBtn) {
        elements.contactCustomerBtn.addEventListener('click', function() {
            const phoneNumber = this.dataset.phone;
            if (!phoneNumber) return;
            
            if (confirm(`Call customer at ${phoneNumber}?`)) {
                window.location.href = `tel:${phoneNumber}`;
            }
        });
    }

    // Notification bell
    if (elements.notificationBell) {
        elements.notificationBell.addEventListener('click', function() {
            notificationManager.showNotificationModal();
            notificationManager.markAllAsRead();
        });
    }

    // Close notification modal
    if (elements.closeNotificationModal) {
        elements.closeNotificationModal.addEventListener('click', function() {
            if (elements.notificationModal) {
                elements.notificationModal.classList.remove('active');
            }
        });
    }

    // View order from notification
    if (elements.viewOrderFromNotification) {
        elements.viewOrderFromNotification.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            if (elements.notificationDetailModal) {
                elements.notificationDetailModal.classList.remove('active');
            }
            
            if (elements.orderModal) {
                orderManager.showOrderDetails(orderId);
            }
        });
    }

    // Close notification detail modal
    if (elements.closeNotificationDetailModal) {
        elements.closeNotificationDetailModal.addEventListener('click', function() {
            if (elements.notificationDetailModal) {
                elements.notificationDetailModal.classList.remove('active');
            }
        });
    }

    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', function() {
            const isDark = document.documentElement.hasAttribute('data-theme');
            utils.toggleDarkMode(!isDark);
        });
    }

    // Navigate button
    if (elements.navigateBtn) {
        elements.navigateBtn.addEventListener('click', function() {
            const orderId = elements.updateStatusBtn?.dataset.orderId;
            if (!orderId) return;
            
            const order = dataManager.getOrderById(orderId);
            if (!order || !order.location) return;
            
            const { lat, lng } = order.location;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
        });
    }

    // Order history tab
    if (elements.orderHistoryTab) {
        elements.orderHistoryTab.addEventListener('click', function() {
            // Highlight active tab
            if (elements.currentOrdersTab) elements.currentOrdersTab.classList.remove('active');
            this.classList.add('active');
            
            // Load order history
            orderManager.loadOrders('all', 'history');
        });
    }

    // Current orders tab
    if (elements.currentOrdersTab) {
        elements.currentOrdersTab.addEventListener('click', function() {
            // Highlight active tab
            if (elements.orderHistoryTab) elements.orderHistoryTab.classList.remove('active');
            this.classList.add('active');
            
            // Load current orders
            orderManager.loadOrders('all', 'current');
        });
    }

    // Missing item button
    if (elements.missingItemBtn) {
        elements.missingItemBtn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            orderManager.showMissingItemsModal(orderId);
        });
    }

    // Report issue button
    if (elements.reportIssueBtn) {
        elements.reportIssueBtn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            orderManager.showReportIssueModal(orderId);
        });
    }

    // Confirm missing items button
    if (elements.confirmMissingItemsBtn) {
        elements.confirmMissingItemsBtn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            orderManager.reportMissingItems(orderId);
        });
    }

    // Submit issue button
    if (elements.submitIssueBtn) {
        elements.submitIssueBtn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            orderManager.reportIssue(orderId);
        });
    }

    // Close issue modal
    if (elements.closeIssueModal) {
        elements.closeIssueModal.addEventListener('click', function() {
            if (elements.issueModal) {
                elements.issueModal.classList.remove('active');
            }
        });
    }

    // Close item selection modal
    if (elements.closeItemSelectionModal) {
        elements.closeItemSelectionModal.addEventListener('click', function() {
            if (elements.itemSelectionModal) {
                elements.itemSelectionModal.classList.remove('active');
            }
        });
    }

    // Handle clicks outside modals to close them
    document.addEventListener('click', function(e) {
        if (elements.orderModal && elements.orderModal.classList.contains('active')) {
            if (e.target === elements.orderModal) {
                elements.orderModal.classList.remove('active');
            }
        }
        
        if (elements.notificationModal && elements.notificationModal.classList.contains('active')) {
            if (e.target === elements.notificationModal) {
                elements.notificationModal.classList.remove('active');
            }
        }
        
        if (elements.notificationDetailModal && elements.notificationDetailModal.classList.contains('active')) {
            if (e.target === elements.notificationDetailModal) {
                elements.notificationDetailModal.classList.remove('active');
            }
        }
        
        if (elements.issueModal && elements.issueModal.classList.contains('active')) {
            if (e.target === elements.issueModal) {
                elements.issueModal.classList.remove('active');
            }
        }
        
        if (elements.itemSelectionModal && elements.itemSelectionModal.classList.contains('active')) {
            if (e.target === elements.itemSelectionModal) {
                elements.itemSelectionModal.classList.remove('active');
            }
        }
    });

    // Handle keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.orderModal && elements.orderModal.classList.contains('active')) {
                elements.orderModal.classList.remove('active');
            }
            if (elements.notificationModal && elements.notificationModal.classList.contains('active')) {
                elements.notificationModal.classList.remove('active');
            }
            if (elements.notificationDetailModal && elements.notificationDetailModal.classList.contains('active')) {
                elements.notificationDetailModal.classList.remove('active');
            }
            if (elements.issueModal && elements.issueModal.classList.contains('active')) {
                elements.issueModal.classList.remove('active');
            }
            if (elements.itemSelectionModal && elements.itemSelectionModal.classList.contains('active')) {
                elements.itemSelectionModal.classList.remove('active');
            }
        }
    });
}

// UI Update Functions
function updateUI() {
    // Update delivery boy info
    if (elements.deliveryBoyName) {
        elements.deliveryBoyName.textContent = deliveryBoy.name;
    }
    
    if (elements.deliveryBoyEmail) {
        elements.deliveryBoyEmail.textContent = deliveryBoy.email;
    }
    
    if (elements.deliveryBoyAvatar) {
        elements.deliveryBoyAvatar.src = deliveryBoy.avatar;
        elements.deliveryBoyAvatar.alt = deliveryBoy.name;
    }
    
    // Update status button
    if (elements.toggleStatusBtn) {
        elements.toggleStatusBtn.innerHTML = deliveryBoy.status === 'online' ? 
            '<i class="fas fa-toggle-on"></i> Online' : 
            '<i class="fas fa-toggle-off"></i> Offline';
        elements.toggleStatusBtn.className = deliveryBoy.status === 'online' ? 
            'btn btn-success' : 'btn btn-secondary';
    }
    
    // Update stats
    if (elements.todayDeliveries) {
        elements.todayDeliveries.textContent = deliveryBoy.deliveriesToday;
    }
    
    if (elements.todayEarnings) {
        elements.todayEarnings.textContent = utils.formatCurrency(deliveryBoy.earnings);
    }
    
    if (elements.deliveryRating) {
        elements.deliveryRating.innerHTML = `${deliveryBoy.rating.toFixed(1)} <i class="fas fa-star"></i>`;
    }
    
    if (elements.activeTime) {
        const hours = Math.floor(deliveryBoy.onlineTime / 3600000);
        const minutes = Math.floor((deliveryBoy.onlineTime % 3600000) / 60000);
        elements.activeTime.textContent = `${hours}h ${minutes}m`;
    }
    
    // Update notification count
    notificationManager.updateNotificationCount();
    
    // Load store products
    utils.loadStoreProducts();
}

// Initialize App
function initApp() {
    // Check for logged in user
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInDeliveryBoy'));
    if (loggedInUser) {
        // Check if this user exists in deliveryBoys array
        const deliveryBoys = JSON.parse(localStorage.getItem('deliveryBoys')) || [];
        const existingUser = deliveryBoys.find(db => db.email === loggedInUser.email);
        
        if (existingUser) {
            // Load existing user data
            deliveryBoy = existingUser;
        } else {
            // Create new delivery boy profile
            deliveryBoy = {
                ...deliveryBoy,
                id: 'db-' + Math.random().toString(36).substr(2, 8),
                name: loggedInUser.name || 'Delivery Partner',
                email: loggedInUser.email,
                avatar: loggedInUser.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            };
            
            // Save to deliveryBoys array
            deliveryBoys.push(deliveryBoy);
            localStorage.setItem('deliveryBoys', JSON.stringify(deliveryBoys));
        }
        
        // Save as current delivery boy
        localStorage.setItem('deliveryBoyData', JSON.stringify(deliveryBoy));
    }
    
    // Initialize sample data if none exists
    dataManager.initializeSampleData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateUI();
    
    // Check dark mode preference
    utils.checkDarkModePreference();
    
    // Load orders
    orderManager.loadOrders();
    
    // Initialize map when Google Maps API is loaded
    if (typeof google !== 'undefined') {
        mapManager.initMap();
        
        // Start tracking location if online
        if (deliveryBoy.status === 'online') {
            mapManager.startTrackingLocation();
            // Check for pending orders immediately
            dataManager.autoAssignPendingOrders();
        }
    } else {
        // Load Google Maps API if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        window.initMap = mapManager.initMap;
    }
    
    // Periodically check for new orders (every 30 seconds)
    setInterval(() => {
        if (deliveryBoy.status === 'online') {
            dataManager.autoAssignPendingOrders();
        }
    }, 30000);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Make functions available globally for Google Maps callback
window.initMap = mapManager.initMap;