/**
 * Personal Finance Tracker - Main Application Controller
 * Handles UI interactions, navigation, and connects with data manager
 */

class FinanceTrackerApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentChart = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.setupDateDefaults();
        this.loadDashboard();
        this.initializeReportYears();
        
        // Load theme preference
        this.loadTheme();
        
        console.log('Finance Tracker App initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('data-section'));
            });
        });

        // Forms
        this.setupFormHandlers();
        
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Security menu
        this.setupSecurityHandlers();
        
        // Quick actions
        this.setupQuickActions();
        
        // Report handlers
        this.setupReportHandlers();
        
        // Analytics handlers
        this.setupAnalyticsHandlers();
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        // Asset form
        document.getElementById('assetForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAssetSubmit();
        });

        // Expense form
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });

        // Income form
        document.getElementById('incomeForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIncomeSubmit();
        });

        // Goal form
        document.getElementById('goalForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGoalSubmit();
        });

        // Quick expense form
        document.getElementById('quickExpenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickExpense();
        });

        // Copy fixed expenses
        document.getElementById('copyFixedExpenses')?.addEventListener('click', () => {
            this.copyFixedExpenses();
        });
    }

    /**
     * Setup security handlers
     */
    setupSecurityHandlers() {
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData')?.addEventListener('click', () => {
            this.importData();
        });
    }

    /**
     * Setup quick actions
     */
    setupQuickActions() {
        // Quick action buttons in dashboard
        document.querySelectorAll('[data-bs-target^="#quick"]').forEach(btn => {
            btn.addEventListener('click', () => {
                // Clear previous form data
                const modalId = btn.getAttribute('data-bs-target').substring(1);
                const form = document.querySelector(`#${modalId} form`);
                if (form) form.reset();
            });
        });
    }

    /**
     * Setup report handlers
     */
    setupReportHandlers() {
        document.getElementById('generateReport')?.addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('exportReport')?.addEventListener('click', () => {
            this.exportReportPDF();
        });

        document.getElementById('exportCSV')?.addEventListener('click', () => {
            this.exportReportCSV();
        });
    }

    /**
     * Setup analytics handlers
     */
    setupAnalyticsHandlers() {
        document.querySelectorAll('[data-chart]').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('[data-chart]').forEach(b => {
                    b.classList.remove('active');
                });
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Load chart
                const chartType = btn.getAttribute('data-chart');
                this.loadChart(chartType);
            });
        });
    }

    /**
     * Setup default dates
     */
    setupDateDefaults() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Set default dates to today
        const dateInputs = ['expenseDate', 'incomeDate', 'goalDate'];
        dateInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = todayStr;
        });
    }

    /**
     * Initialize report years
     */
    initializeReportYears() {
        const yearSelect = document.getElementById('reportYear');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        // Add years from 2020 to current year + 1
        for (let year = 2020; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
        
        // Set current month
        const monthSelect = document.getElementById('reportMonth');
        if (monthSelect) {
            monthSelect.value = currentMonth.toString().padStart(2, '0');
        }
    }

    /**
     * Show specific section
     */
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('fade-in');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    /**
     * Load section-specific data
     */
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'assets':
                this.loadAssets();
                break;
            case 'expenses':
                this.loadExpenses();
                break;
            case 'income':
                this.loadIncome();
                break;
            case 'goals':
                this.loadGoals();
                break;
            case 'analytics':
                this.loadChart('networth');
                break;
        }
    }

    /**
     * Load dashboard data
     */
    loadDashboard() {
        this.updateMetricCards();
        this.loadGoalProgress();
        this.loadInsights();
        this.loadRecentTransactions();
    }

    /**
     * Update metric cards
     */
    updateMetricCards() {
        const totalAssets = dataManager.getTotalAssets();
        const monthlyIncome = dataManager.getMonthlyIncomeTotal();
        const monthlyExpenses = dataManager.getMonthlyExpenseTotal();
        const netSavings = monthlyIncome - monthlyExpenses;
        
        // Update card values
        this.updateElement('totalAssets', dataManager.formatCurrency(totalAssets));
        this.updateElement('monthlyIncome', dataManager.formatCurrency(monthlyIncome));
        this.updateElement('monthlyExpenses', dataManager.formatCurrency(monthlyExpenses));
        this.updateElement('netSavings', dataManager.formatCurrency(netSavings));
        
        // Update net savings card color
        const netSavingsCard = document.getElementById('netSavingsCard');
        if (netSavingsCard) {
            netSavingsCard.className = 'card text-white metric-card ' + 
                (netSavings >= 0 ? 'bg-success' : 'bg-danger');
        }
    }

    /**
     * Load goal progress
     */
    loadGoalProgress() {
        const goals = dataManager.getGoals();
        const container = document.getElementById('goalProgress');
        
        if (!container) return;
        
        if (goals.length === 0) {
            container.innerHTML = '<p class="text-muted">No goals set yet. Add some financial goals!</p>';
            return;
        }
        
        container.innerHTML = goals.slice(0, 3).map(goal => {
            const progress = goal.amount > 0 ? (goal.saved / goal.amount) * 100 : 0;
            return `
                <div class="goal-progress-item">
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-amount">
                        ${dataManager.formatCurrency(goal.saved)} / ${dataManager.formatCurrency(goal.amount)}
                    </div>
                    <div class="progress">
                        <div class="progress-bar bg-success" style="width: ${progress}%"></div>
                    </div>
                    <small class="text-muted">${progress.toFixed(1)}% complete</small>
                </div>
            `;
        }).join('');
    }

    /**
     * Load insights
     */
    loadInsights() {
        const container = document.getElementById('insights');
        if (!container) return;
        
        const insights = this.generateInsights();
        
        if (insights.length === 0) {
            container.innerHTML = '<p class="text-muted">Add some transactions to see personalized insights!</p>';
            return;
        }
        
        container.innerHTML = insights.map(insight => `
            <div class="mb-2">
                <i class="${insight.icon} me-2 ${insight.color}"></i>
                <small>${insight.text}</small>
            </div>
        `).join('');
    }

    /**
     * Generate insights from data
     */
    generateInsights() {
        const insights = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        const summary = dataManager.getMonthlySummary(currentYear, currentMonth);
        
        if (summary.savingsRate > 20) {
            insights.push({
                icon: 'fas fa-thumbs-up',
                color: 'text-success',
                text: `Great job! You're saving ${summary.savingsRate.toFixed(1)}% of your income.`
            });
        } else if (summary.savingsRate < 10) {
            insights.push({
                icon: 'fas fa-exclamation-triangle',
                color: 'text-warning',
                text: `Consider increasing your savings rate. Currently at ${summary.savingsRate.toFixed(1)}%.`
            });
        }
        
        const categories = dataManager.getExpenseCategories(currentYear, currentMonth);
        const topCategory = Object.keys(categories).reduce((a, b) => 
            categories[a] > categories[b] ? a : b, Object.keys(categories)[0]);
        
        if (topCategory && categories[topCategory] > summary.expenses * 0.3) {
            insights.push({
                icon: 'fas fa-chart-pie',
                color: 'text-info',
                text: `${topCategory} is your largest expense category this month.`
            });
        }
        
        return insights;
    }

    /**
     * Load recent transactions
     */
    loadRecentTransactions() {
        const transactions = dataManager.getRecentTransactions(5);
        const tbody = document.querySelector('#recentTransactionsTable tbody');
        
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No recent transactions</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${dataManager.formatDate(transaction.date)}</td>
                <td>
                    <i class="${transaction.icon} me-2 ${transaction.colorClass}"></i>
                    ${transaction.description}
                </td>
                <td>${transaction.category || 'Income'}</td>
                <td class="${transaction.colorClass}">
                    ${transaction.type === 'income' ? '+' : '-'}${dataManager.formatCurrency(transaction.amount)}
                </td>
            </tr>
        `).join('');
    }

    /**
     * Handle form submissions
     */
    handleAssetSubmit() {
        const form = document.getElementById('assetForm');
        const formData = new FormData(form);
        
        const asset = {
            name: formData.get('assetName'),
            type: formData.get('assetType'),
            value: parseFloat(formData.get('assetValue'))
        };
        
        if (dataManager.addAsset(asset)) {
            form.reset();
            this.loadAssets();
            this.updateMetricCards();
            this.showToast('Asset added successfully!', 'success');
        } else {
            this.showToast('Error adding asset. Please try again.', 'error');
        }
    }

    handleExpenseSubmit() {
        const form = document.getElementById('expenseForm');
        const formData = new FormData(form);
        
        const expense = {
            description: formData.get('expenseDescription'),
            amount: parseFloat(formData.get('expenseAmount')),
            category: formData.get('expenseCategory'),
            type: formData.get('expenseType'),
            date: formData.get('expenseDate')
        };
        
        if (dataManager.addExpense(expense)) {
            form.reset();
            this.setupDateDefaults();
            this.loadExpenses();
            this.updateMetricCards();
            this.showToast('Expense added successfully!', 'success');
        } else {
            this.showToast('Error adding expense. Please try again.', 'error');
        }
    }

    handleIncomeSubmit() {
        const form = document.getElementById('incomeForm');
        const formData = new FormData(form);
        
        const income = {
            source: formData.get('incomeSource'),
            amount: parseFloat(formData.get('incomeAmount')),
            date: formData.get('incomeDate')
        };
        
        if (dataManager.addIncome(income)) {
            form.reset();
            this.setupDateDefaults();
            this.loadIncome();
            this.updateMetricCards();
            this.showToast('Income added successfully!', 'success');
        } else {
            this.showToast('Error adding income. Please try again.', 'error');
        }
    }

    handleGoalSubmit() {
        const form = document.getElementById('goalForm');
        const formData = new FormData(form);
        
        const goal = {
            name: formData.get('goalName'),
            amount: parseFloat(formData.get('goalAmount')),
            date: formData.get('goalDate')
        };
        
        if (dataManager.addGoal(goal)) {
            form.reset();
            this.setupDateDefaults();
            this.loadGoals();
            this.loadGoalProgress();
            this.showToast('Goal added successfully!', 'success');
        } else {
            this.showToast('Error adding goal. Please try again.', 'error');
        }
    }

    handleQuickExpense() {
        const form = document.getElementById('quickExpenseForm');
        const formData = new FormData(form);
        
        const expense = {
            description: formData.get('quickExpenseDesc'),
            amount: parseFloat(formData.get('quickExpenseAmount')),
            category: formData.get('quickExpenseCategory'),
            type: 'Variable',
            date: new Date().toISOString().split('T')[0]
        };
        
        if (dataManager.addExpense(expense)) {
            form.reset();
            this.updateMetricCards();
            this.loadRecentTransactions();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickExpenseModal'));
            modal?.hide();
            
            this.showToast('Quick expense added successfully!', 'success');
        } else {
            this.showToast('Error adding expense. Please try again.', 'error');
        }
    }

    /**
     * Load data for different sections
     */
    loadAssets() {
        const assets = dataManager.getAssets();
        const tbody = document.querySelector('#assetsTable tbody');
        
        if (!tbody) return;
        
        if (assets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No assets added yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = assets.map(asset => `
            <tr>
                <td>${asset.name}</td>
                <td><span class="badge bg-secondary">${asset.type}</span></td>
                <td class="fw-bold">${dataManager.formatCurrency(asset.value)}</td>
                <td>${dataManager.formatDate(asset.lastUpdated)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteAsset('${asset.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadExpenses() {
        const expenses = dataManager.getExpenses();
        const tbody = document.querySelector('#expensesTable tbody');
        
        if (!tbody) return;
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No expenses recorded yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = expenses.slice(0, 50).map(expense => `
            <tr>
                <td>${dataManager.formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td><span class="badge bg-info">${expense.category}</span></td>
                <td><span class="badge ${expense.type === 'Fixed' ? 'bg-warning' : 'bg-success'}">${expense.type}</span></td>
                <td class="fw-bold text-danger">${dataManager.formatCurrency(expense.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadIncome() {
        const income = dataManager.getIncome();
        const tbody = document.querySelector('#incomeTable tbody');
        
        if (!tbody) return;
        
        if (income.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No income recorded yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = income.slice(0, 50).map(inc => `
            <tr>
                <td>${dataManager.formatDate(inc.date)}</td>
                <td>${inc.source}</td>
                <td class="fw-bold text-success">${dataManager.formatCurrency(inc.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteIncome('${inc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadGoals() {
        const goals = dataManager.getGoals();
        const tbody = document.querySelector('#goalsTable tbody');
        
        if (!tbody) return;
        
        if (goals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No goals set yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = goals.map(goal => {
            const progress = goal.amount > 0 ? (goal.saved / goal.amount) * 100 : 0;
            return `
                <tr>
                    <td>${goal.name}</td>
                    <td class="fw-bold">${dataManager.formatCurrency(goal.amount)}</td>
                    <td class="text-success">${dataManager.formatCurrency(goal.saved)}</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-success" style="width: ${progress}%">
                                ${progress.toFixed(1)}%
                            </div>
                        </div>
                    </td>
                    <td>${dataManager.formatDate(goal.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteGoal('${goal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Delete methods
     */
    deleteAsset(assetName) {
        if (confirm(`Are you sure you want to delete asset "${assetName}"?`)) {
            if (dataManager.deleteAsset(assetName)) {
                this.loadAssets();
                this.updateMetricCards();
                this.showToast('Asset deleted successfully!', 'success');
            } else {
                this.showToast('Error deleting asset.', 'error');
            }
        }
    }

    deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            if (dataManager.deleteExpense(expenseId)) {
                this.loadExpenses();
                this.updateMetricCards();
                this.showToast('Expense deleted successfully!', 'success');
            } else {
                this.showToast('Error deleting expense.', 'error');
            }
        }
    }

    deleteIncome(incomeId) {
        if (confirm('Are you sure you want to delete this income?')) {
            if (dataManager.deleteIncome(incomeId)) {
                this.loadIncome();
                this.updateMetricCards();
                this.showToast('Income deleted successfully!', 'success');
            } else {
                this.showToast('Error deleting income.', 'error');
            }
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            if (dataManager.deleteGoal(goalId)) {
                this.loadGoals();
                this.loadGoalProgress();
                this.showToast('Goal deleted successfully!', 'success');
            } else {
                this.showToast('Error deleting goal.', 'error');
            }
        }
    }

    /**
     * Utility methods
     */
    copyFixedExpenses() {
        const copiedCount = dataManager.copyFixedExpenses();
        if (copiedCount > 0) {
            this.loadExpenses();
            this.updateMetricCards();
            this.showToast(`Copied ${copiedCount} fixed expenses from last month!`, 'success');
        } else {
            this.showToast('No fixed expenses to copy or they already exist for this month.', 'info');
        }
    }

    exportData() {
        const data = dataManager.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const result = dataManager.importData(data);
                    
                    if (result.success) {
                        this.loadSectionData(this.currentSection);
                        this.showToast('Data imported successfully!', 'success');
                    } else {
                        this.showToast(`Import failed: ${result.error}`, 'error');
                    }
                } catch (error) {
                    this.showToast('Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    generateReport() {
        const year = document.getElementById('reportYear')?.value;
        const month = document.getElementById('reportMonth')?.value;
        
        if (!year || !month) return;
        
        const summary = dataManager.getMonthlySummary(parseInt(year), parseInt(month));
        const categories = dataManager.getExpenseCategories(parseInt(year), parseInt(month));
        
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;
        
        reportContent.innerHTML = `
            <h4>Financial Report - ${year}/${month}</h4>
            <div class="row mt-4">
                <div class="col-md-6">
                    <h5>Summary</h5>
                    <table class="table">
                        <tr><td>Total Income:</td><td class="text-success fw-bold">${dataManager.formatCurrency(summary.income)}</td></tr>
                        <tr><td>Total Expenses:</td><td class="text-danger fw-bold">${dataManager.formatCurrency(summary.expenses)}</td></tr>
                        <tr><td>Net Savings:</td><td class="fw-bold ${summary.savings >= 0 ? 'text-success' : 'text-danger'}">${dataManager.formatCurrency(summary.savings)}</td></tr>
                        <tr><td>Savings Rate:</td><td class="fw-bold">${summary.savingsRate.toFixed(2)}%</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Expense Categories</h5>
                    <table class="table">
                        ${Object.entries(categories).map(([category, amount]) => 
                            `<tr><td>${category}:</td><td class="text-danger fw-bold">${dataManager.formatCurrency(amount)}</td></tr>`
                        ).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    loadChart(chartType) {
        // Placeholder for chart loading - will be implemented in charts.js
        console.log(`Loading chart: ${chartType}`);
    }

    exportReportPDF() {
        this.showToast('PDF export feature coming soon!', 'info');
    }

    exportReportCSV() {
        this.showToast('CSV export feature coming soon!', 'info');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    }

    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 80px; right: 20px; z-index: 10000; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceTrackerApp();
});
