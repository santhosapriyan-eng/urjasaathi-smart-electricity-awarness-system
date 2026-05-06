// UrjaSaathi - Dashboard Analytics Module
// Handles advanced analytics and chart visualizations

class DashboardAnalytics {
    constructor() {
        this.dateRange = 'today';
        this.charts = {};
        this.init();
    }

    init() {
        this.initializeCharts();
        this.setupEventListeners();
        this.loadAnalyticsData();
    }

    initializeCharts() {
        this.initializeMainConsumptionChart();
        this.initializeCostBreakdownChart();
        this.initializeHourlyHeatmap();
        this.initializePeakChart();
    }

    initializeMainConsumptionChart() {
        const ctx = document.getElementById('mainConsumptionChart');
        if (!ctx) return;

        // Generate data based on date range
        const data = this.generateConsumptionData(this.dateRange);

        this.charts.mainConsumption = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Energy Consumption (kWh)',
                        data: data.values,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                            callback: (value) => `${value} kWh`
                        }
                    }
                }
            }
        });
    }

    initializeCostBreakdownChart() {
        const ctx = document.getElementById('costBreakdownChart');
        if (!ctx) return;

        const appliances = [
            { name: 'Air Conditioner', cost: 315 },
            { name: 'Refrigerator', cost: 157 },
            { name: 'Lighting', cost: 112 },
            { name: 'TV & Entertainment', cost: 210 },
            { name: 'Computer', cost: 180 },
            { name: 'Others', cost: 286 }
        ];

        this.charts.costBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: appliances.map(a => a.name),
                datasets: [{
                    data: appliances.map(a => a.cost),
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ef4444',
                        '#9ca3af'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = appliances.reduce((sum, a) => sum + a.cost, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ₹${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializeHourlyHeatmap() {
        const ctx = document.getElementById('hourlyHeatmap');
        if (!ctx) return;

        // Generate heatmap data for a week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        // Generate random data for demonstration
        const data = [];
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                let value = 0.5;
                
                // Higher usage during evenings
                if (hour >= 18 && hour <= 22) {
                    value += 0.8;
                }
                
                // Higher usage on weekends
                if (day >= 5) {
                    value += 0.3;
                }
                
                value += (Math.random() - 0.5) * 0.2;
                value = Math.max(0.1, value);
                
                data.push({
                    x: hour,
                    y: day,
                    v: value
                });
            }
        }

        this.charts.heatmap = new Chart(ctx, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'Energy Usage (kWh)',
                    data: data,
                    backgroundColor: (context) => {
                        const value = context.dataset.data[context.dataIndex].v;
                        const alpha = Math.min(1, value / 2);
                        return `rgba(37, 99, 235, ${alpha})`;
                    },
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
                    height: ({ chart }) => (chart.chartArea || {}).height / 7 - 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        offset: true,
                        min: 0,
                        max: 23,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => `${value}:00`
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        offset: true,
                        min: 0,
                        max: 6,
                        ticks: {
                            stepSize: 1,
                            callback: (value, index) => days[index]
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: () => '',
                            label: (context) => {
                                const day = days[context.dataIndex % 7];
                                const hour = Math.floor(context.dataIndex / 7);
                                const value = context.dataset.data[context.dataIndex].v;
                                return `${day} ${hour}:00 - ${value.toFixed(2)} kWh`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializePeakChart() {
        const ctx = document.getElementById('peakChart');
        if (!ctx) return;

        this.charts.peakChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Peak Hours (18:00-22:00)',
                        data: [8.2, 7.9, 8.5, 8.1, 8.8, 9.2, 9.5],
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    },
                    {
                        label: 'Off-Peak Hours',
                        data: [4.1, 3.9, 4.2, 4.0, 4.3, 5.1, 5.4],
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Energy Consumption (kWh)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    generateConsumptionData(range) {
        let labels = [];
        let values = [];

        switch (range) {
            case 'today':
                labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
                values = Array.from({ length: 24 }, () => {
                    let base = 1.2;
                    base += (Math.random() - 0.5) * 0.3;
                    return Math.max(0.5, base);
                });
                break;

            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                values = labels.map(() => {
                    let base = 28;
                    base += (Math.random() - 0.5) * 4;
                    return Math.max(20, base);
                });
                break;

            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                values = labels.map(() => {
                    let base = 120;
                    base += (Math.random() - 0.5) * 20;
                    return Math.max(80, base);
                });
                break;

            case 'year':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                values = labels.map(() => {
                    let base = 340;
                    base += (Math.random() - 0.5) * 40;
                    return Math.max(280, base);
                });
                break;
        }

        return { labels, values };
    }

    setupEventListeners() {
        // Date range buttons
        document.querySelectorAll('.date-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const range = e.target.dataset.range;
                this.setDateRange(range);
            });
        });

        // Custom date range
        const customRangeBtn = document.querySelector('[data-range="custom"]');
        const customDatePicker = document.getElementById('customDatePicker');
        const applyDateRangeBtn = document.getElementById('applyDateRange');

        if (customRangeBtn) {
            customRangeBtn.addEventListener('click', () => {
                customDatePicker.style.display = 'flex';
            });
        }

        if (applyDateRangeBtn) {
            applyDateRangeBtn.addEventListener('click', () => {
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                
                if (startDate && endDate) {
                    this.setCustomDateRange(startDate, endDate);
                    customDatePicker.style.display = 'none';
                }
            });
        }

        // Export buttons
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportAsPDF());
        document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportAsCSV());
        document.getElementById('printDashboardBtn')?.addEventListener('click', () => this.printDashboard());
        document.getElementById('shareDashboardBtn')?.addEventListener('click', () => this.shareDashboard());
        document.getElementById('exportChartBtn')?.addEventListener('click', () => this.exportChart());
    }

    setDateRange(range) {
        this.dateRange = range;
        
        // Update button states
        document.querySelectorAll('.date-range-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-range="${range}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Hide custom date picker if showing
        if (range !== 'custom') {
            document.getElementById('customDatePicker').style.display = 'none';
        }
        
        // Update charts
        this.updateCharts();
    }

    setCustomDateRange(startDate, endDate) {
        this.dateRange = 'custom';
        this.customRange = { startDate, endDate };
        
        // Update button states
        document.querySelectorAll('.date-range-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const customBtn = document.querySelector('[data-range="custom"]');
        if (customBtn) {
            customBtn.classList.add('active');
        }
        
        // Update charts with custom data
        this.updateCharts();
    }

    updateCharts() {
        if (this.charts.mainConsumption) {
            const data = this.generateConsumptionData(this.dateRange);
            
            this.charts.mainConsumption.data.labels = data.labels;
            this.charts.mainConsumption.data.datasets[0].data = data.values;
            this.charts.mainConsumption.update();
        }
    }

    loadAnalyticsData() {
        // In a real app, this would fetch from an API
        console.log('Loading analytics data for range:', this.dateRange);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Analytics data loaded');
        }, 500);
    }

    exportAsPDF() {
        // In a real app, this would generate a PDF
        console.log('Exporting dashboard as PDF');
        this.showNotification('Preparing PDF export...', 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            this.showNotification('PDF exported successfully', 'success');
        }, 1500);
    }

    exportAsCSV() {
        console.log('Exporting dashboard as CSV');
        this.showNotification('Preparing CSV export...', 'info');
        
        // Generate CSV data
        const data = this.generateConsumptionData(this.dateRange);
        const csvContent = this.convertToCSV(data);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `urjasaathi-analytics-${this.dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('CSV exported successfully', 'success');
    }

    convertToCSV(data) {
        const headers = ['Time', 'Energy Consumption (kWh)'];
        const rows = data.labels.map((label, index) => [label, data.values[index]]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    printDashboard() {
        console.log('Printing dashboard');
        window.print();
    }

    shareDashboard() {
        console.log('Sharing dashboard');
        
        if (navigator.share) {
            navigator.share({
                title: 'My Energy Analytics - UrjaSaathi',
                text: 'Check out my energy consumption analytics from UrjaSaathi!',
                url: window.location.href
            })
            .then(() => console.log('Shared successfully'))
            .catch((error) => console.log('Sharing failed:', error));
        } else {
            this.showNotification('Web Share API not supported in this browser', 'info');
        }
    }

    exportChart() {
        console.log('Exporting chart image');
        
        if (this.charts.mainConsumption) {
            const chartCanvas = this.charts.mainConsumption.canvas;
            const image = chartCanvas.toDataURL('image/png');
            
            const a = document.createElement('a');
            a.href = image;
            a.download = 'urjasaathi-chart.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            this.showNotification('Chart exported as PNG', 'success');
        }
    }

    showNotification(message, type = 'info') {
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }

    // Cleanup method
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Initialize dashboard analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.DashboardAnalytics = new DashboardAnalytics();
});