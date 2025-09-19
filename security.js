// Simple Security Manager - No Encryption
class SecurityManager {
    constructor() {
        console.log('Simple security initialized');
    }

    // Simple user registration
    async secureRegister(name, email, password) {
        const userData = {
            name: name,
            email: email,
            password: password,
            loginDate: new Date().toLocaleDateString('en-GB'),
            isActive: true
        };
        
        localStorage.setItem(`user_${email}`, JSON.stringify({
            user: userData,
            orders: []
        }));
        
        return userData;
    }

    // Simple user login
    async secureLogin(email, password) {
        const userData = localStorage.getItem(`user_${email}`);
        if (!userData) {
            throw new Error('Invalid email or password.');
        }
        
        const parsedData = JSON.parse(userData);
        if (parsedData.user.password !== password) {
            throw new Error('Invalid email or password.');
        }
        
        return parsedData.user;
    }

    // Simple logout
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberLogin');
        return true;
    }

    // Dummy functions for compatibility
    createSession(userData) {
        return 'session_' + Date.now();
    }

    validateSession() {
        return true;
    }

    destroySession() {
        return true;
    }
}

// Initialize global security manager
window.securityManager = new SecurityManager();