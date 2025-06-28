document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberMe = document.getElementById('rememberMe');

    // Initialize floating labels
    function initFloatingLabels() {
        document.querySelectorAll('.form-group.floating input').forEach(input => {
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

    // Check for remembered credentials
    function checkRememberedCredentials() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMe.checked = true;
            emailInput.nextElementSibling.style.top = '0';
            emailInput.nextElementSibling.style.left = '0';
            emailInput.nextElementSibling.style.fontSize = '13px';
        }
    }

    // Initialize
    initFloatingLabels();
    checkRememberedCredentials();

 loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Get all registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Find user with matching email
    const user = registeredUsers.find(u => u.email === email);
    
    if (!user) {
        showToast('Email not found', 'error');
        emailInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            emailInput.style.animation = '';
        }, 500);
        return;
    }
    
    // Password verification
    if (password !== user.password) {
        showToast('Incorrect password', 'error');
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
        return;
    }
    
    // Remember credentials if checkbox is checked
    if (rememberMe.checked) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    // Set current user session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Login successful!');
        
        setTimeout(() => {
            window.location.href = 'shopdashboard.html';
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