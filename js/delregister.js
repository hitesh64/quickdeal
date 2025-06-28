document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#3498db"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#3498db",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });

    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Password strength indicator
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const vehicleNumber = document.getElementById('vehicleNumber').value;
        
        // Simple validation
        if (password !== confirmPassword) {
            showError('Passwords do not match!');
            return;
        }
        
        // Check password strength
        if (calculatePasswordStrength(password) < 3) {
            showError('Password is too weak. Please use a stronger password.');
            return;
        }
        
        // Retrieve existing users or initialize empty array
        const registeredUsers = JSON.parse(localStorage.getItem('deliveryUsers')) || [];
        
        // Check if email already exists
        if (registeredUsers.some(user => user.email === email)) {
            showError('Email already registered. Please login instead.');
            return;
        }
        
        // Create new user object
        const newUser = {
            fullName,
            email,
            phone,
            password,
            vehicleNumber
        };
        
        // Add new user to array
        registeredUsers.push(newUser);
        
        // Store updated array in localStorage
        localStorage.setItem('deliveryUsers', JSON.stringify(registeredUsers));
        
        // Show success message with animation
        const btn = document.querySelector('.btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Registration Successful!';
        btn.style.backgroundColor = '#2ecc71';
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'dellogin.html';
        }, 1500);
    });
    
    function updatePasswordStrength(password) {
        const strength = calculatePasswordStrength(password);
        const strengthBars = document.querySelectorAll('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        // Reset all bars
        strengthBars.forEach(bar => {
            bar.style.backgroundColor = '#ddd';
        });
        
        // Update bars based on strength
        for (let i = 0; i < strength; i++) {
            if (i === 0) strengthBars[i].style.backgroundColor = '#e74c3c';
            else if (i === 1) strengthBars[i].style.backgroundColor = '#f39c12';
            else if (i === 2) strengthBars[i].style.backgroundColor = '#2ecc71';
        }
        
        // Update text
        if (strength === 0) strengthText.textContent = 'Very Weak';
        else if (strength === 1) strengthText.textContent = 'Weak';
        else if (strength === 2) strengthText.textContent = 'Medium';
        else if (strength === 3) strengthText.textContent = 'Strong';
    }
    
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        
        // Contains both lower and uppercase
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength++;
        
        // Contains numbers
        if (password.match(/([0-9])/)) strength++;
        
        // Contains special chars
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength++;
        
        return strength;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
});