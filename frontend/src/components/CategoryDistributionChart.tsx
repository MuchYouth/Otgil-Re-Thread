import React, { useEffect, useRef } from 'react';
import { CategoryDistribution } from '../types';

// Assuming Chart.js is loaded globally from a script tag in index.html
declare const Chart: any;

interface CategoryDistributionChartProps {
    data: CategoryDistribution[];
}

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
             if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.map(d => d.category),
                        datasets: [{
                            label: '의류 카테고리 분포',
                            data: data.map(d => d.count),
                            backgroundColor: [
                                '#44C2C3', // new brand-secondary (teal)
                                '#6C2C90', // new brand-primary (purple)
                                '#ec4899', // pink-500
                                '#10b981', // emerald-500
                                '#8b5cf6', // violet-500
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 4
                        }]
                    },
                     options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 20,
                                    padding: 20,
                                }
                            },
                        }
                    }
                });
            }
        }
        
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-96">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">카테고리별 의류 분포</h3>
            <div className="relative h-72">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default CategoryDistributionChart;