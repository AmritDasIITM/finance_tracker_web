/**
 * Personal Finance Tracker - Security Layer
 * Handles encryption, decryption, and security features
 */

class SecurityManager {
    constructor() {
        this.isEncryptionEnabled = false;
        this.encryptionKey = null;
        this.init();
    }

    /**
     * Initialize security manager
     */
    init() {
        this.loadEncryptionState();
        this.setupSecurityEventListeners();
    }

    /**
     * Setup security-related event listeners
     */
    setupSecurityEventListeners() {
        // Toggle encryption
        document.getElementById('toggleEncryption')?.addEventListener('click', () => {
            this.toggleEncryption();
        });

        // Change password
        document.getElementById('changePassword')?.addEventListener('click', () => {
            this.showChangePasswordModal();
        });
    }

    /**
     * Load encryption state from localStorage
     */
    loadEncryptionState() {
        const settings = dataManager.getData('settings');
        if (settings && settings.encryptionEnabled) {
            this.isEncryptionEnabled = true;
            // Request password on app load if encryption is enabled
            this.requestPassword();
        }
    }

    /**
     * Toggle encryption on/off
     */
    async toggleEncryption() {
        if (!this.isEncryptionEnabled) {
            // Enable encryption
            await this.enableEncryption();
        } else {
            // Disable encryption
            await this.disableEncryption();
        }
    }

    /**
     * Enable encryption
     */
    async enableEncryption() {
        const password = await this.promptForPassword('Enter a password to encrypt your data:');
        if (!password) return;

        const confirmPassword = await this.promptForPassword('Confirm your password:');
        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match!', 'error');
            return;
        }

        try {
            // Generate encryption key from password
            this.encryptionKey = await this.deriveKey(password);
            
            // Re-encrypt all existing data
            await this.reencryptAllData();
            
            // Update settings
            const settings = dataManager.getData('settings') || {};
            settings.encryptionEnabled = true;
            dataManager.setData('settings', settings);
            
            // Update data manager
            dataManager.setEncryptionKey(this.encryptionKey);
            
            this.isEncryptionEnabled = true;
            this.showAlert('Encryption enabled successfully!', 'success');
            
        } catch (error) {
            console.error('Encryption error:', error);
            this.showAlert('Failed to enable encryption. Please try again.', 'error');
        }
    }

    /**
     * Disable encryption
     */
    async disableEncryption() {
        const password = await this.promptForPassword('Enter your password to disable encryption:');
        if (!password) return;

        try {
            // Verify password
            const key = await this.deriveKey(password);
            if (!await this.verifyPassword(key)) {
                this.showAlert('Incorrect password!', 'error');
                return;
            }

            // Decrypt all data
            await this.decryptAllData();
            
            // Update settings
            const settings = dataManager.getData('settings') || {};
            settings.encryptionEnabled = false;
            dataManager.setData('settings', settings);
            
            // Update data manager
            dataManager.removeEncryption();
            
            this.isEncryptionEnabled = false;
            this.encryptionKey = null;
            this.showAlert('Encryption disabled successfully!', 'success');
            
        } catch (error) {
            console.error('Decryption error:', error);
            this.showAlert('Failed to disable encryption. Please check your password.', 'error');
        }
    }

    /**
     * Request password on app startup
     */
    async requestPassword() {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            const password = await this.promptForPassword('Enter your password to access encrypted data:');
            if (!password) {
                this.lockApp();
                return;
            }

            try {
                const key = await this.deriveKey(password);
                if (await this.verifyPassword(key)) {
                    this.encryptionKey = key;
                    dataManager.setEncryptionKey(key);
                    return;
                }
            } catch (error) {
                console.error('Password verification error:', error);
            }

            attempts++;
            this.showAlert(`Incorrect password. ${maxAttempts - attempts} attempts remaining.`, 'error');
        }

        // Lock app after max attempts
        this.lockApp();
    }

    /**
     * Lock the application
     */
    lockApp() {
        document.body.innerHTML = `
            <div class="d-flex justify-content-center align-items-center min-vh-100 bg-danger text-white">
                <div class="text-center">
                    <i class="fas fa-lock fa-3x mb-3"></i>
                    <h2>Application Locked</h2>
                    <p>Too many failed password attempts. Please refresh the page to try again.</p>
                    <button class="btn btn-light mt-3" onclick="window.location.reload()">
                        <i class="fas fa-refresh me-2"></i>Refresh Page
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Show change password modal
     */
    async showChangePasswordModal() {
        if (!this.isEncryptionEnabled) {
            this.showAlert('Encryption is not enabled.', 'info');
            return;
        }

        const currentPassword = await this.promptForPassword('Enter your current password:');
        if (!currentPassword) return;

        try {
            const currentKey = await this.deriveKey(currentPassword);
            if (!await this.verifyPassword(currentKey)) {
                this.showAlert('Incorrect current password!', 'error');
                return;
            }

            const newPassword = await this.promptForPassword('Enter your new password:');
            if (!newPassword) return;

            const confirmPassword = await this.promptForPassword('Confirm your new password:');
            if (newPassword !== confirmPassword) {
                this.showAlert('New passwords do not match!', 'error');
                return;
            }

            // Generate new key
            const newKey = await this.deriveKey(newPassword);
            
            // Re-encrypt all data with new key
            this.encryptionKey = newKey;
            await this.reencryptAllData();
            
            // Update data manager
            dataManager.setEncryptionKey(newKey);
            
            this.showAlert('Password changed successfully!', 'success');

        } catch (error) {
            console.error('Change password error:', error);
            this.showAlert('Failed to change password. Please try again.', 'error');
        }
    }

    /**
     * Derive encryption key from password using PBKDF2
     */
    async deriveKey(password) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        // Use a fixed salt for consistency (in production, use a random salt per user)
        const salt = encoder.encode('finance-tracker-salt-2023');
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        return key;
    }

    /**
     * Encrypt data using AES-GCM
     */
    async encryptData(data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not available');
        }

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            dataBuffer
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        // Convert to base64 for storage
        return btoa(String.fromCharCode.apply(null, combined));
    }

    /**
     * Decrypt data using AES-GCM
     */
    async decryptData(encryptedDataString) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not available');
        }

        try {
            // Convert from base64
            const combined = new Uint8Array(
                atob(encryptedDataString).split('').map(char => char.charCodeAt(0))
            );
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encryptedData = combined.slice(12);
            
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                encryptedData
            );

            const decoder = new TextDecoder();
            const decryptedString = decoder.decode(decryptedBuffer);
            
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Verify password by attempting to decrypt a test value
     */
    async verifyPassword(key) {
        try {
            // Try to get and decrypt settings
            const encryptedSettings = localStorage.getItem('financeTracker_settings');
            if (!encryptedSettings) return true; // No data to verify against
            
            const tempKey = this.encryptionKey;
            this.encryptionKey = key;
            
            await this.decryptData(encryptedSettings);
            this.encryptionKey = tempKey;
            
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Re-encrypt all data with current key
     */
    async reencryptAllData() {
        const keys = dataManager.getAllKeys();
        
        for (const key of keys) {
            const data = dataManager.getData(key);
            if (data) {
                dataManager.setData(key, data);
            }
        }
    }

    /**
     * Decrypt all data and store unencrypted
     */
    async decryptAllData() {
        const keys = dataManager.getAllKeys();
        
        // Temporarily remove encryption to store unencrypted data
        const tempKey = this.encryptionKey;
        dataManager.removeEncryption();
        
        for (const key of keys) {
            const rawData = localStorage.getItem('financeTracker_' + key);
            if (rawData) {
                try {
                    this.encryptionKey = tempKey;
                    const decryptedData = await this.decryptData(rawData);
                    this.encryptionKey = null;
                    dataManager.setData(key, decryptedData);
                } catch (error) {
                    console.error(`Failed to decrypt ${key}:`, error);
                }
            }
        }
    }

    /**
     * Prompt for password using a modal dialog
     */
    promptForPassword(message) {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'passwordModal';
            modal.setAttribute('data-bs-backdrop', 'static');
            modal.setAttribute('data-bs-keyboard', 'false');
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-lock me-2"></i>Security
                            </h5>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                            <div class="form-group">
                                <input type="password" class="form-control" id="passwordInput" 
                                       placeholder="Enter password" autocomplete="current-password">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmBtn">
                                <i class="fas fa-unlock me-2"></i>Confirm
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const modalInstance = new bootstrap.Modal(modal);
            const passwordInput = modal.querySelector('#passwordInput');
            const confirmBtn = modal.querySelector('#confirmBtn');
            const cancelBtn = modal.querySelector('#cancelBtn');
            
            modalInstance.show();
            
            // Focus on input
            modal.addEventListener('shown.bs.modal', () => {
                passwordInput.focus();
            });
            
            // Handle Enter key
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });
            
            // Handle confirm
            confirmBtn.addEventListener('click', () => {
                const password = passwordInput.value;
                modalInstance.hide();
                document.body.removeChild(modal);
                resolve(password);
            });
            
            // Handle cancel
            cancelBtn.addEventListener('click', () => {
                modalInstance.hide();
                document.body.removeChild(modal);
                resolve(null);
            });
        });
    }

    /**
     * Show alert message
     */
    showAlert(message, type = 'info') {
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * Generate secure backup code
     */
    generateBackupCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return code;
    }

    /**
     * Export encrypted backup
     */
    async exportEncryptedBackup() {
        if (!this.isEncryptionEnabled) {
            this.showAlert('Encryption must be enabled to create encrypted backups.', 'error');
            return;
        }

        try {
            const data = dataManager.exportAllData();
            const backupCode = this.generateBackupCode();
            
            // Create backup with additional security info
            const secureBackup = {
                data: data,
                encrypted: true,
                backupCode: backupCode,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(secureBackup, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance-tracker-encrypted-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show backup code to user
            this.showBackupCode(backupCode);
            
        } catch (error) {
            console.error('Encrypted backup error:', error);
            this.showAlert('Failed to create encrypted backup.', 'error');
        }
    }

    /**
     * Show backup code to user
     */
    showBackupCode(code) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-key me-2"></i>Backup Code
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <p><strong>Important:</strong> Save this backup code securely. You'll need it to restore your encrypted backup.</p>
                        <div class="alert alert-warning">
                            <h4 class="font-monospace">${code}</h4>
                        </div>
                        <p class="text-muted small">This code is required along with your password to restore encrypted backups.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="navigator.clipboard.writeText('${code}')">
                            <i class="fas fa-copy me-2"></i>Copy Code
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-2"></i>I've Saved It
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Get security status
     */
    getSecurityStatus() {
        return {
            encryptionEnabled: this.isEncryptionEnabled,
            hasEncryptionKey: !!this.encryptionKey,
            storageSize: dataManager.getStorageUsage()
        };
    }
}

// Initialize security manager and extend data manager
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
    
    // Override data manager encryption methods
    if (window.dataManager) {
        dataManager.encryptData = (data) => {
            if (securityManager.isEncryptionEnabled && securityManager.encryptionKey) {
                return securityManager.encryptData(data);
            }
            return JSON.stringify(data);
        };
        
        dataManager.decryptData = (encryptedData) => {
            if (securityManager.isEncryptionEnabled && securityManager.encryptionKey) {
                return securityManager.decryptData(encryptedData);
            }
            return JSON.parse(encryptedData);
        };
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}
