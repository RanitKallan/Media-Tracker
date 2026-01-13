document.addEventListener('DOMContentLoaded', function() {
    // Add shimmering effect to buttons
    const addButtonEffects = () => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseover', function() {
                const x = this.offsetLeft + this.offsetWidth / 2;
                const y = this.offsetTop + this.offsetHeight / 2;
                this.style.background = `radial-gradient(circle at ${x}px ${y}px, #4e00ff, #0072ff)`;
            });
            
            button.addEventListener('mouseout', function() {
                this.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
            });
        });
    };
    
    addButtonEffects();

    // Form validation and submission
    if(document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('login-error-message');
    
            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password.';
                errorMessage.style.display = 'block';
                event.preventDefault();
                shakeElement(this);
            } else {
                errorMessage.textContent = '';
                // Add loading animation to button
                const button = this.querySelector('button');
                button.innerHTML = '<span class="spinner"></span> Signing In...';
                button.disabled = true;
            }
        });
    }
    
    if(document.getElementById('signupForm')) {
        document.getElementById('signupForm').addEventListener('submit', function(event) {
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessage = document.getElementById('signup-error-message');
    
            if (!username || !password || !confirmPassword) {
                errorMessage.textContent = 'Please fill in all fields.';
                errorMessage.style.display = 'block';
                event.preventDefault();
                shakeElement(this);
            } else if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match.';
                errorMessage.style.display = 'block';
                event.preventDefault();
                shakeElement(document.getElementById('confirmPassword'));
            } else if (password.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters.';
                errorMessage.style.display = 'block';
                event.preventDefault();
                shakeElement(document.getElementById('signupPassword'));
            } else {
                errorMessage.textContent = '';
                // Add loading animation to button
                const button = this.querySelector('button');
                button.innerHTML = '<span class="spinner"></span> Creating Account...';
                button.disabled = true;
            }
        });
    }

    // Input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('label').style.color = '#00c6ff';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.querySelector('label').style.color = '#e0e0e0';
        });
    });

    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input[type="password"]');
            if(passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    this.textContent = '👁️';
                }
            }
        });
    });

    // Add shake animation for errors
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    // Add CSS for dynamic elements
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        .spinner {
            display: inline-block;
            width: 15px;
            height: 15px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});