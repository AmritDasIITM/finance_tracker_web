/**
 * Personal Finance Tracker - Data Management Layer
 * Handles all data operations using localStorage and IndexedDB
 */

class DataManager {
    constructor() {
        this.storagePrefix = 'financeTracker_';
        this.encryptionKey = null;
        this.isEncrypted = false;
        this.initializeDefaults();
    }

    /**
     * Initialize default data structure
     */
    initializeDefaults() {
        // Initialize basic data structures if they don't exist
        if (!this.getData('assets')) {
            this.setData('assets', { assets: [], history: [] });
        }
        
        if (!this.getData('expenses')) {
            this.setData('expenses', { expenses: [] });
        }
        
        if (!this.getData('income')) {
            this.setData('income', { income: [] });
        }
        
        if (!this.getData('goals')) {
            this.setData('goals', { goals: [] });
        }
        
        if (!this.getData('categories')) {
            this.setData('categories', {
                fixed: ["Car Loan EMI", "Home Loan EMI", "Utilities", "Insurance", "Rent"],
                variable: ["Food & Dining", "Transport", "Healthcare", "Entertainment", "Shopping", "Miscellaneous"],
                custom: []
            });
        }
        
        if (!this.getData('settings')) {
            this.setData('settings', {
                theme: 'light',
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY',
                encryptionEnabled: false,
                lastBackup: null
            });
        }
    }

    /**
     * Get data from localStorage
     */
    getData(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            if (!data) return null;
            
            if (this.isEncrypted && this.encryptionKey) {
                return this.decryptData(data);
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error getting data for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set data in localStorage
     */
    setData(key, data) {
        try {
            let dataToStore;
            
            if (this.isEncrypted && this.encryptionKey) {
                dataToStore = this.encryptData(data);
            } else {
                dataToStore = JSON.stringify(data);
            }
            
            localStorage.setItem(this.storagePrefix + key, dataToStore);
            return true;
        } catch (error) {
            console.error(`Error setting data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Remove data from localStorage
     */
    removeData(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get all data keys
     */
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix)) {
                keys.push(key.replace(this.storagePrefix, ''));
            }
        }
        return keys;
    }

    /**
     * Asset Management Methods
     */
    
    // Add or update asset
    addAsset(asset) {
        const data = this.getData('assets') || { assets: [], history: [] };
        const now = new Date().toISOString();
        
        // Check if asset already exists
        const existingIndex = data.assets.findIndex(a => a.name === asset.name);
        
        if (existingIndex !== -1) {
            // Update existing asset
            const oldValue = data.assets[existingIndex].value;
            data.assets[existingIndex] = {
                ...asset,
                lastUpdated: now
            };
            
            // Log history
            data.history.push({
                id: this.generateId(),
                name: asset.name,
                type: asset.type,
                value: asset.value,
                previousValue: oldValue,
                timestamp: now,
                action: 'update'
            });
        } else {
            // Add new asset
            data.assets.push({
                ...asset,
                id: this.generateId(),
                created: now,
                lastUpdated: now
            });
            
            // Log history
            data.history.push({
                id: this.generateId(),
                name: asset.name,
                type: asset.type,
                value: asset.value,
                timestamp: now,
                action: 'create'
            });
        }
        
        return this.setData('assets', data);
    }

    // Delete asset
    deleteAsset(assetName) {
        const data = this.getData('assets') || { assets: [], history: [] };
        const assetIndex = data.assets.findIndex(a => a.name === assetName);
        
        if (assetIndex === -1) return false;
        
        const deletedAsset = data.assets[assetIndex];
        data.assets.splice(assetIndex, 1);
        
        // Log history
        data.history.push({
            id: this.generateId(),
            name: deletedAsset.name,
            type: deletedAsset.type,
            value: deletedAsset.value,
            timestamp: new Date().toISOString(),
            action: 'delete'
        });
        
        return this.setData('assets', data);
    }

    // Get all assets
    getAssets() {
        const data = this.getData('assets') || { assets: [], history: [] };
        return data.assets;
    }

    // Get asset history
    getAssetHistory() {
        const data = this.getData('assets') || { assets: [], history: [] };
        return data.history;
    }

    // Get total assets value
    getTotalAssets() {
        const assets = this.getAssets();
        return assets.reduce((total, asset) => total + (asset.value || 0), 0);
    }

    /**
     * Expense Management Methods
     */
    
    // Add expense
    addExpense(expense) {
        const data = this.getData('expenses') || { expenses: [] };
        
        data.expenses.push({
            ...expense,
            id: this.generateId(),
            timestamp: new Date().toISOString()
        });
        
        return this.setData('expenses', data);
    }

    // Delete expense
    deleteExpense(expenseId) {
        const data = this.getData('expenses') || { expenses: [] };
        const expenseIndex = data.expenses.findIndex(e => e.id === expenseId);
        
        if (expenseIndex === -1) return false;
        
        data.expenses.splice(expenseIndex, 1);
        return this.setData('expenses', data);
    }

    // Get all expenses
    getExpenses() {
        const data = this.getData('expenses') || { expenses: [] };
        return data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get expenses by month
    getExpensesByMonth(year, month) {
        const expenses = this.getExpenses();
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        return expenses.filter(e => e.date.startsWith(monthStr));
    }

    // Get monthly expense total
    getMonthlyExpenseTotal(year = null, month = null) {
        if (!year || !month) {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1;
        }
        
        const expenses = this.getExpensesByMonth(year, month);
        return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    }

    // Copy fixed expenses from previous month
    copyFixedExpenses() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const prevMonthExpenses = this.getExpensesByMonth(
            lastMonth.getFullYear(), 
            lastMonth.getMonth() + 1
        );
        
        const fixedExpenses = prevMonthExpenses.filter(e => e.type === 'Fixed');
        let copiedCount = 0;
        
        fixedExpenses.forEach(expense => {
            // Check if already exists for current month
            const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            const currentExpenses = this.getExpensesByMonth(now.getFullYear(), now.getMonth() + 1);
            
            const exists = currentExpenses.some(e => 
                e.description === expense.description && 
                e.type === 'Fixed'
            );
            
            if (!exists) {
                this.addExpense({
                    description: expense.description,
                    amount: expense.amount,
                    category: expense.category,
                    type: 'Fixed',
                    date: `${currentMonthStr}-01`
                });
                copiedCount++;
            }
        });
        
        return copiedCount;
    }

    /**
     * Income Management Methods
     */
    
    // Add income
    addIncome(income) {
        const data = this.getData('income') || { income: [] };
        
        data.income.push({
            ...income,
            id: this.generateId(),
            timestamp: new Date().toISOString()
        });
        
        return this.setData('income', data);
    }

    // Delete income
    deleteIncome(incomeId) {
        const data = this.getData('income') || { income: [] };
        const incomeIndex = data.income.findIndex(i => i.id === incomeId);
        
        if (incomeIndex === -1) return false;
        
        data.income.splice(incomeIndex, 1);
        return this.setData('income', data);
    }

    // Get all income
    getIncome() {
        const data = this.getData('income') || { income: [] };
        return data.income.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get income by month
    getIncomeByMonth(year, month) {
        const income = this.getIncome();
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        return income.filter(i => i.date.startsWith(monthStr));
    }

    // Get monthly income total
    getMonthlyIncomeTotal(year = null, month = null) {
        if (!year || !month) {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1;
        }
        
        const income = this.getIncomeByMonth(year, month);
        return income.reduce((total, inc) => total + (inc.amount || 0), 0);
    }

    /**
     * Goals Management Methods
     */
    
    // Add goal
    addGoal(goal) {
        const data = this.getData('goals') || { goals: [] };
        
        data.goals.push({
            ...goal,
            id: this.generateId(),
            saved: 0,
            savingsDetails: [],
            created: new Date().toISOString()
        });
        
        return this.setData('goals', data);
    }

    // Delete goal
    deleteGoal(goalId) {
        const data = this.getData('goals') || { goals: [] };
        const goalIndex = data.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex === -1) return false;
        
        data.goals.splice(goalIndex, 1);
        return this.setData('goals', data);
    }

    // Update goal savings
    updateGoalSavings(goalId, savingsDetails) {
        const data = this.getData('goals') || { goals: [] };
        const goalIndex = data.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex === -1) return false;
        
        data.goals[goalIndex].savingsDetails = savingsDetails;
        data.goals[goalIndex].saved = savingsDetails.reduce((total, s) => total + s.amount, 0);
        data.goals[goalIndex].lastUpdated = new Date().toISOString();
        
        return this.setData('goals', data);
    }

    // Get all goals
    getGoals() {
        const data = this.getData('goals') || { goals: [] };
        return data.goals;
    }

    /**
     * Analytics and Reporting Methods
     */
    
    // Get monthly summary
    getMonthlySummary(year, month) {
        const income = this.getMonthlyIncomeTotal(year, month);
        const expenses = this.getMonthlyExpenseTotal(year, month);
        
        return {
            year,
            month,
            income,
            expenses,
            savings: income - expenses,
            savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
        };
    }

    // Get expense categories summary
    getExpenseCategories(year, month) {
        const expenses = this.getExpensesByMonth(year, month);
        const categories = {};
        
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += expense.amount;
        });
        
        return categories;
    }

    // Get net worth trend (last 12 months)
    getNetWorthTrend() {
        const history = this.getAssetHistory();
        const monthlyData = {};
        
        // Group asset history by month
        history.forEach(entry => {
            const month = entry.timestamp.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {};
            }
            monthlyData[month][entry.name] = entry.value;
        });
        
        // Calculate total for each month
        const trend = [];
        const sortedMonths = Object.keys(monthlyData).sort();
        
        sortedMonths.forEach(month => {
            const total = Object.values(monthlyData[month]).reduce((sum, value) => sum + value, 0);
            trend.push({
                month,
                value: total
            });
        });
        
        return trend;
    }

    // Get savings rate trend (last 12 months)
    getSavingsRateTrend() {
        const trend = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const summary = this.getMonthlySummary(year, month);
            trend.push({
                month: `${year}-${month.toString().padStart(2, '0')}`,
                savingsRate: summary.savingsRate,
                income: summary.income,
                expenses: summary.expenses
            });
        }
        
        return trend;
    }

    // Get recent transactions (combined income and expenses)
    getRecentTransactions(limit = 10) {
        const income = this.getIncome();
        const expenses = this.getExpenses();
        
        const transactions = [
            ...income.map(i => ({
                ...i,
                type: 'income',
                description: i.source,
                icon: 'fas fa-plus-circle',
                colorClass: 'text-success'
            })),
            ...expenses.map(e => ({
                ...e,
                type: 'expense',
                icon: 'fas fa-minus-circle',
                colorClass: 'text-danger'
            }))
        ];
        
        return transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    /**
     * Data Import/Export Methods
     */
    
    // Export all data
    exportAllData() {
        const allData = {};
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            allData[key] = this.getData(key);
        });
        
        allData.exportDate = new Date().toISOString();
        allData.version = '1.0';
        
        return allData;
    }

    // Import data
    importData(importedData) {
        try {
            // Validate imported data
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Backup current data before import
            const backup = this.exportAllData();
            
            // Import each data type
            Object.keys(importedData).forEach(key => {
                if (key !== 'exportDate' && key !== 'version') {
                    this.setData(key, importedData[key]);
                }
            });
            
            return { success: true, backup };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear all data
    clearAllData() {
        const keys = this.getAllKeys();
        keys.forEach(key => {
            this.removeData(key);
        });
        this.initializeDefaults();
    }

    /**
     * Utility Methods
     */
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Format currency
    formatCurrency(amount, currency = 'INR') {
        if (currency === 'INR') {
            return `₹${amount.toLocaleString('en-IN', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 2 
            })}`;
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format date
    formatDate(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return d.toLocaleDateString();
        }
    }

    // Get storage usage
    getStorageUsage() {
        let totalSize = 0;
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            const data = localStorage.getItem(this.storagePrefix + key);
            if (data) {
                totalSize += data.length;
            }
        });
        
        return {
            totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            keysCount: keys.length
        };
    }

    /**
     * Encryption placeholder methods (will be implemented in security.js)
     */
    
    setEncryptionKey(key) {
        this.encryptionKey = key;
        this.isEncrypted = true;
    }

    removeEncryption() {
        this.encryptionKey = null;
        this.isEncrypted = false;
    }

    encryptData(data) {
        // Placeholder - actual implementation in security.js
        return JSON.stringify(data);
    }

    decryptData(encryptedData) {
        // Placeholder - actual implementation in security.js
        return JSON.parse(encryptedData);
    }
}

// Create global instance
window.dataManager = new DataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
