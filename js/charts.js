/**
 * Personal Finance Tracker - Charts and Analytics
 * Handles all chart rendering and analytics visualization
 */

class ChartsManager {
    constructor() {
        this.currentChart = null;
        this.chartColors = {
            primary: '#2E7D32',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            purple: '#9C27B0',
            secondary: '#6c757d'
        };
        this.init();
    }

    /**
     * Initialize charts manager
     */
    init() {
        // Set Chart.js defaults
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Override app's loadChart method
        if (window.app) {
            window.app.loadChart = (chartType) => this.loadChart(chartType);
        }
    }

    /**
     * Load specific chart type
     */
    loadChart(chartType) {
        const canvas = document.getElementById('analyticsChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const ctx = canvas.getContext('2d');

        switch (chartType) {
            case 'networth':
                this.createNetWorthChart(ctx);
                break;
            case 'income-expense':
                this.createIncomeExpenseChart(ctx);
                break;
            case 'categories':
                this.createCategoriesChart(ctx);
                break;
            case 'savings-rate':
                this.createSavingsRateChart(ctx);
                break;
            default:
                this.createNetWorthChart(ctx);
        }
    }

    /**
     * Create Net Worth trend chart
     */
    createNetWorthChart(ctx) {
        const netWorthData = this.getNetWorthChartData();
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: netWorthData.labels,
                datasets: [{
                    label: 'Net Worth',
                    data: netWorthData.data,
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.chartColors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.chartColors.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Net Worth: ₹' + context.parsed.y.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Create Income vs Expenses chart
     */
    createIncomeExpenseChart(ctx) {
        const incomeExpenseData = this.getIncomeExpenseChartData();
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: incomeExpenseData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeExpenseData.income,
                        backgroundColor: this.chartColors.success + '80',
                        borderColor: this.chartColors.success,
                        borderWidth: 2
                    },
                    {
                        label: 'Expenses',
                        data: incomeExpenseData.expenses,
                        backgroundColor: this.chartColors.danger + '80',
                        borderColor: this.chartColors.danger,
                        borderWidth: 2
                    },
                    {
                        label: 'Net Savings',
                        data: incomeExpenseData.savings,
                        backgroundColor: this.chartColors.info + '80',
                        borderColor: this.chartColors.info,
                        borderWidth: 2,
                        type: 'line',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Create Expense Categories pie chart
     */
    createCategoriesChart(ctx) {
        const categoriesData = this.getCategoriesChartData();
        
        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoriesData.labels,
                datasets: [{
                    data: categoriesData.data,
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.success,
                        this.chartColors.danger,
                        this.chartColors.warning,
                        this.chartColors.info,
                        this.chartColors.purple,
                        this.chartColors.secondary,
                        '#fd7e14', // orange
                        '#20c997', // teal
                        '#6f42c1'  // indigo
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₹' + context.parsed.toLocaleString('en-IN') + 
                                       ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Create Savings Rate trend chart
     */
    createSavingsRateChart(ctx) {
        const savingsRateData = this.getSavingsRateChartData();
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: savingsRateData.labels,
                datasets: [{
                    label: 'Savings Rate (%)',
                    data: savingsRateData.data,
                    borderColor: this.chartColors.info,
                    backgroundColor: this.chartColors.info + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.chartColors.info,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Savings Rate: ' + context.parsed.y.toFixed(1) + '%';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Get net worth chart data
     */
    getNetWorthChartData() {
        const assets = dataManager.getAssets();
        const now = new Date();
        const labels = [];
        const data = [];
        
        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toISOString().substring(0, 7);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            // For simplicity, use current asset values (in real app, would track historical values)
            const totalAssets = dataManager.getTotalAssets();
            data.push(totalAssets);
        }
        
        // If no real data, create sample trend
        if (data.every(val => val === 0)) {
            const baseValue = 50000;
            data.forEach((_, index) => {
                data[index] = baseValue + (index * 5000) + (Math.random() * 10000);
            });
        }
        
        return { labels, data };
    }

    /**
     * Get income vs expenses chart data
     */
    getIncomeExpenseChartData() {
        const now = new Date();
        const labels = [];
        const income = [];
        const expenses = [];
        const savings = [];
        
        // Generate last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            const monthlyIncome = dataManager.getMonthlyIncomeTotal(year, month);
            const monthlyExpenses = dataManager.getMonthlyExpenseTotal(year, month);
            const monthlySavings = monthlyIncome - monthlyExpenses;
            
            income.push(monthlyIncome);
            expenses.push(monthlyExpenses);
            savings.push(monthlySavings);
        }
        
        return { labels, income, expenses, savings };
    }

    /**
     * Get categories chart data
     */
    getCategoriesChartData() {
        const now = new Date();
        const categories = dataManager.getExpenseCategories(now.getFullYear(), now.getMonth() + 1);
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        // If no data, create sample data
        if (labels.length === 0) {
            return {
                labels: ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare'],
                data: [15000, 5000, 8000, 3000, 2000]
            };
        }
        
        return { labels, data };
    }

    /**
     * Get savings rate chart data
     */
    getSavingsRateChartData() {
        const savingsRateTrend = dataManager.getSavingsRateTrend();
        
        const labels = savingsRateTrend.map(item => {
            const date = new Date(item.month + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        const data = savingsRateTrend.map(item => item.savingsRate);
        
        return { labels, data };
    }

    /**
     * Create mini dashboard chart
     */
    createMiniChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };

        return new Chart(ctx, {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        });
    }

    /**
     * Create expense trend mini chart for dashboard
     */
    createExpenseTrendMini() {
        const now = new Date();
        const data = [];
        const labels = [];
        
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.getDate().toString());
            
            // Get expenses for this date (simplified)
            const expenses = dataManager.getExpenses().filter(exp => 
                exp.date === date.toISOString().split('T')[0]
            );
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            data.push(total);
        }
        
        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: this.chartColors.danger,
                backgroundColor: this.chartColors.danger + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        return this.createMiniChart('expenseTrendMini', 'line', chartData);
    }

    /**
     * Create income trend mini chart for dashboard
     */
    createIncomeTrendMini() {
        const now = new Date();
        const data = [];
        const labels = [];
        
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push((date.getMonth() + 1).toString());
            
            const monthlyIncome = dataManager.getMonthlyIncomeTotal(
                date.getFullYear(), 
                date.getMonth() + 1
            );
            data.push(monthlyIncome);
        }
        
        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: this.chartColors.success,
                backgroundColor: this.chartColors.success + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        return this.createMiniChart('incomeTrendMini', 'line', chartData);
    }

    /**
     * Update chart theme for dark mode
     */
    updateChartTheme(isDark) {
        if (!this.currentChart) return;
        
        const textColor = isDark ? '#ffffff' : '#000000';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        
        this.currentChart.options.scales.x.ticks.color = textColor;
        this.currentChart.options.scales.y.ticks.color = textColor;
        this.currentChart.options.scales.x.grid.color = gridColor;
        this.currentChart.options.scales.y.grid.color = gridColor;
        this.currentChart.options.plugins.legend.labels.color = textColor;
        
        this.currentChart.update();
    }

    /**
     * Export chart as image
     */
    exportChart(filename = 'chart.png') {
        if (!this.currentChart) return;
        
        const url = this.currentChart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * Get chart summary statistics
     */
    getChartSummaryStats() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        const totalAssets = dataManager.getTotalAssets();
        const monthlyIncome = dataManager.getMonthlyIncomeTotal();
        const monthlyExpenses = dataManager.getMonthlyExpenseTotal();
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
        
        const goals = dataManager.getGoals();
        const completedGoals = goals.filter(goal => (goal.saved / goal.amount) >= 1).length;
        
        return {
            totalAssets,
            monthlyIncome,
            monthlyExpenses,
            netSavings: monthlyIncome - monthlyExpenses,
            savingsRate,
            totalGoals: goals.length,
            completedGoals,
            averageExpensePerCategory: this.getAverageExpensePerCategory()
        };
    }

    /**
     * Get average expense per category
     */
    getAverageExpensePerCategory() {
        const now = new Date();
        const categories = dataManager.getExpenseCategories(now.getFullYear(), now.getMonth() + 1);
        const categoryEntries = Object.entries(categories);
        
        if (categoryEntries.length === 0) return 0;
        
        const totalExpenses = categoryEntries.reduce((sum, [, amount]) => sum + amount, 0);
        return totalExpenses / categoryEntries.length;
    }

    /**
     * Generate financial insights based on chart data
     */
    generateFinancialInsights() {
        const stats = this.getChartSummaryStats();
        const insights = [];
        
        // Savings rate insights
        if (stats.savingsRate > 30) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-thumbs-up',
                message: `Excellent! Your savings rate of ${stats.savingsRate.toFixed(1)}% is well above the recommended 20%.`
            });
        } else if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                message: `Your savings rate of ${stats.savingsRate.toFixed(1)}% is below the recommended 20%. Consider reducing expenses or increasing income.`
            });
        }
        
        // Goal completion insights
        if (stats.completedGoals > 0) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-trophy',
                message: `Great job! You've completed ${stats.completedGoals} out of ${stats.totalGoals} financial goals.`
            });
        }
        
        // Expense category insights
        const categories = dataManager.getExpenseCategories(new Date().getFullYear(), new Date().getMonth() + 1);
        const highestCategory = Object.entries(categories).reduce((max, current) => 
            current[1] > max[1] ? current : max, ['', 0]);
        
        if (highestCategory[1] > stats.monthlyExpenses * 0.4) {
            insights.push({
                type: 'info',
                icon: 'fas fa-chart-pie',
                message: `${highestCategory[0]} represents a large portion of your expenses. Consider if this allocation aligns with your priorities.`
            });
        }
        
        return insights;
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }
}

// Initialize charts manager
document.addEventListener('DOMContentLoaded', () => {
    window.chartsManager = new ChartsManager();
    
    // Listen for theme changes to update charts
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                chartsManager.updateChartTheme(isDark);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsManager;
}
