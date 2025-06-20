import { useEffect, useRef } from 'react';
import { Chart, registerables, ChartType } from 'chart.js';

Chart.register(...registerables);

interface PieChartProps {
    id: string;
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
        }[];
    };
    options?: any;
}

export function PieChart({ id, data, options = {} }: PieChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            chartInstance.current = new Chart(chartRef.current, {
                type: 'pie',
                data,
                options,
            });
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, options]);

    return <canvas id={id} ref={chartRef} style={{ width: '100%', maxWidth: 400, height: 300 }} />;
} 