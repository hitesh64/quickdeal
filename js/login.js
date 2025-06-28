// Switch between login and register forms
document.getElementById('switchToRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('switchToLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Register form submission - ONLY registers, doesn't login
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phoneNumber').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        alert('Please agree to the terms and conditions');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) {
        alert('User with this email already exists');
        return;
    }
    
    // Create user object with password
    const user = {
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password, // Store password (insecure for demo only)
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random`,
        orders: [],
        wishlist: [],
        addresses: [{
            type: "Home",
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "US"
        }],
        points: 0,
        registrationDate: new Date().toISOString()
    };
    
    // Save user to storage
    users[email] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success and switch to login
    alert('Registration successful! Please login with your credentials.');
    document.getElementById('registerForm').reset();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    // Pre-fill email and focus password
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').focus();
});

// Login form submission - ONLY allows access with correct credentials
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Basic validation
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Check user exists
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[email];
    
    if (!user) {
        alert('User not found. Please register first.');
        return;
    }
    
    // Verify password (case-sensitive)
    if (user.password !== password) {
        alert('Incorrect password. Please try again.');
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        return;
    }
    
    // Save session and remember me
    localStorage.setItem('user', JSON.stringify(user));
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    // Only redirect if credentials are correct
    window.location.href = "index.html";
});

// Remember email functionality
window.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
        document.getElementById('loginPassword').focus();
    }
});
// Check if there's a remembered email on page load
window.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
        document.getElementById('loginPassword').focus();
    }
});
// In the login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[email];
    
    if (!user) {
        alert('User not found. Please register first.');
        return;
    }
    
    // In a real app, verify password here
    // For demo, we'll just proceed
    
    // Save current user
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = "index.html";
});
// Update register form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phoneNumber').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        alert('Please agree to the terms and conditions');
        return;
    }
    
    // Create user object
    const user = {
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random`,
        orders: [],
        wishlist: [],
        addresses: [{
            type: "Home",
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "US"
        }],
        points: 0,
        registrationDate: new Date().toISOString()
    };
    
    // Save user to users object
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[email] = user;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = "index.html";
});