document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    // Navigation buttons
    const nextToStep2Btn = document.getElementById('nextToStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const nextToStep3Btn = document.getElementById('nextToStep3');
    const backToStep2Btn = document.getElementById('backToStep2');
    const completeRegistrationBtn = document.getElementById('completeRegistration');
    
    // Form fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const shopNameInput = document.getElementById('shopName');
    const shopCategoryInput = document.getElementById('shopCategory');
    const shopDescriptionInput = document.getElementById('shopDescription');
    
    // Review sections
    const reviewOwnerInfo = document.getElementById('reviewOwnerInfo');
    const reviewShopInfo = document.getElementById('reviewShopInfo');
    
    // Progress bar
    const progressBar = document.querySelector('.progress-bar');
    
    // Current step
    let currentStep = 1;
    // Add these variables at the top with other DOM elements
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Modify the completeRegistrationBtn event listener to include password validation
completeRegistrationBtn.addEventListener('click', () => {
    if (!document.getElementById('agreeTerms').checked) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }

    // Password validation
    if (passwordInput.value !== confirmPasswordInput.value) {
        showToast('Passwords do not match', 'error');
        passwordInput.style.animation = 'shake 0.5s';
        confirmPasswordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
            confirmPasswordInput.style.animation = '';
        }, 500);
        return;
    }

    if (passwordInput.value.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
        return;
    }

    // Add loading state to button
    completeRegistrationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    completeRegistrationBtn.disabled = true;

    // Simulate API call with timeout
    setTimeout(() => {
        // Save shop data to localStorage
        const shopData = {
            owner: {
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                phone: phoneInput.value
            },
            shop: {
                name: shopNameInput.value,
                category: shopCategoryInput.value,
                description: shopDescriptionInput.value,
                createdAt: new Date().toISOString()
            }
        };
        
        localStorage.setItem('shopData', JSON.stringify(shopData));
        localStorage.setItem('currentUser', JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value, // Store password (in real app, this should be hashed)
            isShopOwner: true
        }));
        
        showToast('Registration successful! Redirecting...', 'success');
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'loginshop.html?from=registration';
        }, 1500);
    }, 1000);
});
    // Initialize floating labels
    function initFloatingLabels() {
        document.querySelectorAll('.form-group.floating .form-control').forEach(input => {
            if (input.value) {
                input.nextElementSibling.style.top = '0';
                input.nextElementSibling.style.left = '0';
                input.nextElementSibling.style.fontSize = '13px';
            }
            
            input.addEventListener('focus', function() {
                this.nextElementSibling.style.top = '0';
                this.nextElementSibling.style.left = '0';
                this.nextElementSibling.style.fontSize = '13px';
                this.nextElementSibling.style.color = 'var(--primary-color)';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.nextElementSibling.style.top = '30px';
                    this.nextElementSibling.style.left = '15px';
                    this.nextElementSibling.style.fontSize = '16px';
                    this.nextElementSibling.style.color = '#999';
                }
            });
        });
    }
    
    // Navigation functions
    function goToStep(step) {
        // Hide current step with animation
        document.getElementById(`step${currentStep}`).classList.add('leaving');
        
        // Update progress bar
        progressBar.style.width = `${((step - 1) / 2) * 100}%`;
        
        // After animation completes, switch steps
        setTimeout(() => {
            document.getElementById(`step${currentStep}`).classList.remove('active', 'leaving');
            
            // Update step indicator
            document.querySelectorAll('.step-item').forEach(item => {
                item.classList.remove('active', 'completed');
                const stepNum = parseInt(item.getAttribute('data-step'));
                
                if (stepNum === step) {
                    item.classList.add('active');
                } else if (stepNum < step) {
                    item.classList.add('completed');
                }
            });
            
            // Show new step
            document.getElementById(`step${step}`).classList.add('active');
            currentStep = step;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Reinitialize floating labels for the new step
            initFloatingLabels();
        }, 300);
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        let icon;
        switch(type) {
            case 'error':
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                break;
            default:
                icon = 'fas fa-check-circle';
        }
        
        toast.innerHTML = `<i class="${icon}"></i> ${message}`;
        document.body.appendChild(toast);
        
        // Remove toast after delay
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }
    
    // Initialize floating labels
    initFloatingLabels();
    
    // Event listeners for navigation
    nextToStep2Btn.addEventListener('click', () => {
        if (document.getElementById('basicInfoForm').checkValidity()) {
            goToStep(2);
        } else {
            showToast('Please fill in all required fields', 'error');
            // Add shake animation to invalid fields
            document.querySelectorAll('#basicInfoForm input:invalid').forEach(input => {
                input.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    input.style.animation = '';
                }, 500);
            });
        }
    });
    
    backToStep1Btn.addEventListener('click', () => goToStep(1));
    
    nextToStep3Btn.addEventListener('click', () => {
        if (document.getElementById('shopDetailsForm').checkValidity()) {
            // Update review sections
            reviewOwnerInfo.innerHTML = `
                <p><strong>Name:</strong> ${firstNameInput.value} ${lastNameInput.value}</p>
                <p><strong>Email:</strong> ${emailInput.value}</p>
                <p><strong>Phone:</strong> ${phoneInput.value}</p>
            `;
            
            reviewShopInfo.innerHTML = `
                <p><strong>Shop Name:</strong> ${shopNameInput.value}</p>
                <p><strong>Category:</strong> ${shopCategoryInput.options[shopCategoryInput.selectedIndex].text}</p>
                <p><strong>Description:</strong> ${shopDescriptionInput.value || 'Not provided'}</p>
            `;
            
            goToStep(3);
        } else {
            showToast('Please fill in all required fields', 'error');
            // Add shake animation to invalid fields
            document.querySelectorAll('#shopDetailsForm input:invalid, #shopDetailsForm select:invalid').forEach(input => {
                input.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    input.style.animation = '';
                }, 500);
            });
        }
    });
    
    backToStep2Btn.addEventListener('click', () => goToStep(2));
    
   completeRegistrationBtn.addEventListener('click', () => {
    if (!document.getElementById('agreeTerms').checked) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }

    // Password validation
    if (passwordInput.value !== confirmPasswordInput.value) {
        showToast('Passwords do not match', 'error');
        passwordInput.style.animation = 'shake 0.5s';
        confirmPasswordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
            confirmPasswordInput.style.animation = '';
        }, 500);
        return;
    }

    if (passwordInput.value.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
        return;
    }

    // Add loading state to button
    completeRegistrationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    completeRegistrationBtn.disabled = true;

    // Simulate API call with timeout
    setTimeout(() => {
        // Get existing users or create new array
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Check if email already exists
        if (registeredUsers.some(user => user.email === emailInput.value)) {
            showToast('Email already registered', 'error');
            completeRegistrationBtn.innerHTML = 'Complete Registration';
            completeRegistrationBtn.disabled = false;
            return;
        }

        // Create new user object
        const newUser = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            password: passwordInput.value, // In production, this should be hashed
            shop: {
                name: shopNameInput.value,
                category: shopCategoryInput.value,
                description: shopDescriptionInput.value,
                createdAt: new Date().toISOString()
            },
            isShopOwner: true
        };

        // Add to registered users
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Also set as current user for immediate login after registration
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        showToast('Registration successful! Redirecting...', 'success');
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'loginshop.html'; // Redirect directly to dashboard
        }, 1500);
    }, 1000);
});
    
    // Add shake animation for invalid fields
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});