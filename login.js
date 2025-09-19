// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        if (currentUser === ADMIN_EMAIL) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'shop.html';
        }
    }
    
    // Setup form listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Setup forgot password link
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPassword();
        });
    }
});

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideRegister() {
    document.getElementById('registerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('registerForm').reset();
}

function validateEmail(email) {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailPattern.test(email);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Check if admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        if (window.loading) {
            window.loading.show('جاري تسجيل دخول المدير...', 1500).then(() => {
                localStorage.setItem('currentUser', email);
                localStorage.setItem('userRole', 'admin');
                if (rememberMe) {
                    localStorage.setItem('rememberLogin', 'true');
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            });
        } else {
            localStorage.setItem('currentUser', email);
            localStorage.setItem('userRole', 'admin');
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
            }
            showAlert('Admin login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        return;
    }

    
    // Check regular users
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
        showAlert('Invalid email or password', 'error');
        return;
    }
    
    try {
        const parsedData = JSON.parse(userData);
        if (parsedData.user.password !== password) {
            showAlert('Invalid email or password', 'error');
            return;
        }
        
        if (window.loading) {
            window.loading.show('جاري تسجيل الدخول...', 1200).then(() => {
                localStorage.setItem('currentUser', email);
                localStorage.setItem('userRole', 'user');
                if (rememberMe) {
                    localStorage.setItem('rememberLogin', 'true');
                }
                

                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 1000);
            });
        } else {
            localStorage.setItem('currentUser', email);
            localStorage.setItem('userRole', 'user');
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
            }
            
            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 1000);
        }
        
    } catch (error) {
        showAlert('Invalid user data', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (email === ADMIN_EMAIL) {
        showAlert('This email is reserved for admin use', 'error');
        return;
    }
    
    // Check if user exists
    const existingUser = localStorage.getItem(`user_${email}`);
    if (existingUser) {
        showAlert('This email is already registered', 'error');
        return;
    }
    
    // Create user
    const userData = {
        name: name,
        email: email,
        password: password,
        loginDate: new Date().toLocaleDateString('en-GB')
    };
    
    if (window.loading) {
        window.loading.show('جاري إنشاء الحساب...', 1500).then(() => {
            localStorage.setItem(`user_${email}`, JSON.stringify({
                user: userData,
                orders: []
            }));
            
            if (window.notify) {
                window.notify.success('تم إنشاء الحساب بنجاح!', 'يمكنك الآن تسجيل الدخول');
            }
            setTimeout(() => {
                hideRegister();
                document.getElementById('email').value = email;
            }, 1000);
        });
    } else {
        localStorage.setItem(`user_${email}`, JSON.stringify({
            user: userData,
            orders: []
        }));
        
        showAlert('Account created successfully! Please login.', 'success');
        setTimeout(() => {
            hideRegister();
            document.getElementById('email').value = email;
        }, 1000);
    }
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add alert styles
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function showForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetCodeSection').style.display = 'none';
}

function backToLogin() {
    hideForgotPassword();
}

function sendResetCode() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showAlert('Please enter your email address', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Email must be in format ******@gmail.com', 'error');
        return;
    }
    
    // Check if admin email
    if (email === ADMIN_EMAIL) {
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(`resetCode_${email}`, resetCode);
        showAlert(`Reset code sent!\nYour code is: ${resetCode}`, 'success');
        document.getElementById('resetCodeSection').style.display = 'block';
        return;
    }
    
    // Check if user exists
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
        showAlert('Email not found. Please check your email or create a new account.', 'error');
        return;
    }
    
    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`resetCode_${email}`, resetCode);
    
    showAlert(`Reset code sent to ${email}\nYour code is: ${resetCode}`, 'success');
    document.getElementById('resetCodeSection').style.display = 'block';
}

function resetPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    const enteredCode = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPasswordReset').value;
    
    if (!enteredCode || !newPassword) {
        showAlert('Please enter both reset code and new password', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    const savedCode = localStorage.getItem(`resetCode_${email}`);
    if (enteredCode !== savedCode) {
        showAlert('Invalid reset code. Please try again.', 'error');
        return;
    }
    
    // Update admin password
    if (email === ADMIN_EMAIL) {
        showAlert('Admin password reset request noted. Contact system administrator.', 'success');
    } else {
        // Update user password
        const userData = JSON.parse(localStorage.getItem(`user_${email}`));
        userData.user.password = newPassword;
        localStorage.setItem(`user_${email}`, JSON.stringify(userData));
        showAlert('Password reset successfully! You can now login with your new password.', 'success');
    }
    
    // Clean up
    localStorage.removeItem(`resetCode_${email}`);
    
    setTimeout(() => {
        hideForgotPassword();
        if (email !== ADMIN_EMAIL) {
            document.getElementById('email').value = email;
        }
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);