// UrjaSaathi - Charts and Data Visualization Module
// Uses Chart.js for energy consumption visualization

class UrjaSaathiCharts {
    constructor() {
        this.charts = {};
        this.currentMetric = 'power'; // 'power' or 'cost'
        this.data = {
            labels: this.generateTimeLabels(),
            datasets: this.initializeDatasets()
        };
        
        this.init();
    }

    init() {
        this.initializeConsumptionChart();
        this.setupChartUpdates();
        this.addChartInteractions();
    }

    generateTimeLabels() {
        // Generate 24-hour timeline
        const labels = [];
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            labels.push(`${hour}:00`);
        }
        return labels;
    }

    initializeDatasets() {
        return [
            {
                label: 'Your Energy Usage',
                data: this.generateConsumptionData(),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            },
            {
                label: 'Solar Generation',
                data: this.generateSolarData(),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Neighborhood Average',
                data: this.generateNeighborhoodData(),
                borderColor: '#9ca3af',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }
        ];
    }

    generateConsumptionData() {
        const data = [];
        const base = 1.2; // Base consumption in kW
        const peakHours = [18, 19, 20, 21];
        
        for (let i = 0; i < 24; i++) {
            let value = base;
            
            // Add daily pattern
            if (i >= 6 && i <= 9) {
                value += 0.3; // Morning peak
            }
            
            if (peakHours.includes(i)) {
                value += 0.8; // Evening peak
            }
            
            if (i >= 0 && i <= 5) {
                value *= 0.4; // Night reduction
            }
            
            // Add randomness
            value += (Math.random() - 0.5) * 0.2;
            
            data.push(Math.max(0.3, value));
        }
        
        return data;
    }

    generateSolarData() {
        const data = [];
        
        for (let i = 0; i < 24; i++) {
            let value = 0;
            
            // Solar only during daylight
            if (i >= 6 && i <= 18) {
                const hourInDay = i - 6;
                const normalizedHour = hourInDay / 12;
                value = Math.sin(normalizedHour * Math.PI) * 3.5;
            }
            
            data.push(Math.max(0, value));
        }
        
        return data;
    }

    generateNeighborhoodData() {
        const data = [];
        const base = 1.4; // Slightly higher than user's base
        
        for (let i = 0; i < 24; i++) {
            let value = base;
            
            if (i >= 18 && i <= 22) {
                value += 1.0;
            }
            
            value += (Math.random() - 0.5) * 0.3;
            
            data.push(Math.max(0.5, value));
        }
        
        return data;
    }

    initializeConsumptionChart() {
        const ctx = document.getElementById('consumptionChart');
        if (!ctx) return;

        this.charts.consumption = new Chart(ctx, {
            type: 'line',
            data: this.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false // We have custom legend
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#6b7280',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (this.currentMetric === 'power') {
                                    label += `${context.parsed.y.toFixed(2)} kW`;
                                } else {
                                    const cost = context.parsed.y * 7.5; // ₹7.5 per kWh
                                    label += `₹${cost.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: (value) => {
                                if (this.currentMetric === 'power') {
                                    return `${value} kW`;
                                } else {
                                    return `₹${value}`;
                                }
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    setupChartUpdates() {
        // Update chart every 5 seconds with new data
        setInterval(() => {
            this.updateLiveData();
        }, 5000);
    }

    updateLiveData() {
        if (!this.charts.consumption) return;

        // Get current hour
        const now = new Date();
        const currentHour = now.getHours();
        
        // Update only the current hour's data for realism
        const datasets = this.charts.consumption.data.datasets;
        
        // Add small fluctuation to user data
        const currentValue = datasets[0].data[currentHour];
        const fluctuation = (Math.random() - 0.5) * 0.1;
        datasets[0].data[currentHour] = Math.max(0.3, currentValue + fluctuation);
        
        // Update solar data based on time
        if (currentHour >= 6 && currentHour <= 18) {
            const hourInDay = currentHour - 6;
            const normalizedHour = hourInDay / 12;
            const solarValue = Math.sin(normalizedHour * Math.PI) * 3.5;
            const solarFluctuation = (Math.random() - 0.5) * 0.2;
            datasets[1].data[currentHour] = Math.max(0, solarValue + solarFluctuation);
        } else {
            datasets[1].data[currentHour] = 0;
        }
        
        // Update chart
        this.charts.consumption.update('none');
    }

    switchMetric(metric) {
        if (this.currentMetric === metric || !this.charts.consumption) return;
        
        this.currentMetric = metric;
        const chart = this.charts.consumption;
        
        // Update Y-axis label and data
        chart.options.scales.y.ticks.callback = (value) => {
            if (metric === 'power') {
                return `${value} kW`;
            } else {
                const cost = value * 7.5; // Convert kW to cost
                return `₹${cost.toFixed(0)}`;
            }
        };
        
        // Update tooltip
        chart.options.plugins.tooltip.callbacks.label = (context) => {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (metric === 'power') {
                label += `${context.parsed.y.toFixed(2)} kW`;
            } else {
                const cost = context.parsed.y * 7.5;
                label += `₹${cost.toFixed(2)}`;
            }
            return label;
        };
        
        // Update chart with animation
        chart.update();
    }

    addChartInteractions() {
        // Add click event to chart for detailed view
        const chartCanvas = document.getElementById('consumptionChart');
        if (chartCanvas) {
            chartCanvas.addEventListener('click', (e) => {
                const chart = this.charts.consumption;
                const points = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                
                if (points.length) {
                    const firstPoint = points[0];
                    const datasetIndex = firstPoint.datasetIndex;
                    const index = firstPoint.index;
                    
                    this.showDataPointDetails(datasetIndex, index);
                }
            });
        }
    }

    showDataPointDetails(datasetIndex, index) {
        const chart = this.charts.consumption;
        const dataset = chart.data.datasets[datasetIndex];
        const value = dataset.data[index];
        const time = chart.data.labels[index];
        
        let message;
        if (this.currentMetric === 'power') {
            const cost = value * 7.5;
            message = `${time}: ${value.toFixed(2)} kW (₹${cost.toFixed(2)})`;
        } else {
            message = `${time}: ₹${value.toFixed(2)}`;
        }
        
        // Show notification
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(`Selected: ${message}`, 'info');
        }
    }

    refresh() {
        if (!this.charts.consumption) return;
        
        // Generate new data
        this.charts.consumption.data.datasets[0].data = this.generateConsumptionData();
        this.charts.consumption.data.datasets[1].data = this.generateSolarData();
        this.charts.consumption.data.datasets[2].data = this.generateNeighborhoodData();
        
        // Update with animation
        this.charts.consumption.update();
        
        // Show refreshing indicator
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('refreshing');
            setTimeout(() => {
                chartContainer.classList.remove('refreshing');
            }, 1000);
        }
    }

    // Generate additional chart types for dashboard.html
    initializeCostBreakdownChart(ctx) {
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cooling', 'Lighting', 'Entertainment', 'Kitchen', 'Heating', 'Other'],
                datasets: [{
                    data: [35, 15, 20, 18, 8, 4],
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
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializeHourlyHeatmap(ctx) {
        if (!ctx) return null;
        
        // Generate heatmap data (7 days x 24 hours)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [];
        
        for (let day = 0; day < 7; day++) {
            const dayData = [];
            for (let hour = 0; hour < 24; hour++) {
                // Higher usage on weekends and evenings
                let value = 0.5;
                
                if (hour >= 18 && hour <= 22) {
                    value += 0.8; // Evening peak
                }
                
                if (day >= 5) { // Weekend
                    value += 0.3;
                }
                
                // Add randomness
                value += (Math.random() - 0.5) * 0.2;
                
                dayData.push(Math.max(0.1, value));
            }
            data.push(dayData);
        }
        
        return new Chart(ctx, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'Energy Usage Heatmap',
                    data: this.generateHeatmapData(data, days),
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
                        type: 'time',
                        offset: true,
                        time: {
                            unit: 'hour',
                            parser: 'HH',
                            displayFormats: {
                                hour: 'HH'
                            }
                        },
                        ticks: {
                            maxTicksLimit: 12
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'category',
                        labels: days,
                        offset: true,
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
                                return `${day} ${hour}:00 - ${value.toFixed(2)} kW`;
                            }
                        }
                    }
                }
            }
        });
    }

    generateHeatmapData(data, days) {
        const heatmapData = [];
        
        for (let day = 0; day < days.length; day++) {
            for (let hour = 0; hour < 24; hour++) {
                heatmapData.push({
                    x: hour,
                    y: day,
                    v: data[day][hour]
                });
            }
        }
        
        return heatmapData;
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

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.UrjaSaathiCharts = new UrjaSaathiCharts();
    
    // Listen for loading complete to ensure proper initialization
    document.addEventListener('loadingComplete', () => {
        if (window.UrjaSaathiCharts) {
            window.UrjaSaathiCharts.refresh();
        }
    });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UrjaSaathiCharts };
}