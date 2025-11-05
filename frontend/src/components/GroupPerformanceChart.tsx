import React, { useEffect, useRef } from 'react';
import { AdminGroupPerformance } from '../types';

declare const Chart: any;

interface GroupPerformanceChartProps {
    data: AdminGroupPerformance[];
}

const GroupPerformanceChart: React.FC<GroupPerformanceChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                // Sort data for better visualization
                const sortedData = [...data].sort((a, b) => b.exchanges - a.exchanges);
                
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: sortedData.map(d => d.groupName),
                        datasets: [{
                            label: '교환 실적',
                            data: sortedData.map(d => d.exchanges),
                            backgroundColor: [
                                'rgba(20, 184, 166, 0.8)',
                                'rgba(13, 148, 136, 0.8)',
                                'rgba(15, 118, 110, 0.8)',
                            ],
                            borderColor: [
                                'rgb(20, 184, 166)',
                                'rgb(13, 148, 136)',
                                'rgb(15, 118, 110)',
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y', // Horizontal bar chart
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: '교환 건수'
                                }
                            }
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
            <h3 className="text-lg font-semibold text-stone-800 mb-4">그룹별 교환 실적</h3>
            <div className="relative h-72">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default GroupPerformanceChart;