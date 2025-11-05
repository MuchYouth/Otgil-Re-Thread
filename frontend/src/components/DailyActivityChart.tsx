import React, { useEffect, useRef } from 'react';
import { DailyActivity } from '../types';

// Assuming Chart.js is loaded globally from a script tag in index.html
declare const Chart: any;

interface DailyActivityChartProps {
    data: DailyActivity[];
    label: string;
}

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data, label }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null); // To hold the chart instance

    useEffect(() => {
        if (chartRef.current) {
            // Destroy the previous chart instance if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(d => d.date),
                        datasets: [{
                            label: label,
                            data: data.map(d => d.count),
                            borderColor: '#6C2C90', // brand-primary
                            backgroundColor: 'rgba(108, 44, 144, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#6C2C90',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#6C2C90'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: '#e7e5e4' // stone-200
                                }
                            },
                            x: {
                                grid: {
                                    display: false,
                                }
                            }
                        }
                    }
                });
            }
        }

        // Cleanup function to destroy the chart on component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, label]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-96">
            <h3 className="text-lg font-semibold text-brand-text mb-4">{label} 트렌드 (최근 7일)</h3>
            <div className="relative h-72">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default DailyActivityChart;