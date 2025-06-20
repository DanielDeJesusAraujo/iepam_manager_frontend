import { Chart } from 'chart.js';
import { exportToPDF } from '@/utils/exportToPDF';
import { InventoryItem, GroupByOption } from '../types';
import { groupItems } from './groupUtils';
import { getStatusLabel } from './statusUtils';

export const exportInventoryPDF = async (items: InventoryItem[], groupBy: GroupByOption = 'none') => {
    // Create temporary canvas element in the DOM
    const tempCanvas = document.createElement('canvas');
    tempCanvas.style.position = 'absolute';
    tempCanvas.style.left = '-9999px';
    tempCanvas.width = 300;
    tempCanvas.height = 200;
    document.body.appendChild(tempCanvas);

    // Count items by location
    const locationCounts: Record<string, number> = {};

    items.forEach(item => {
        const loc = item.location?.name || 'Sem localização';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const colors = [
        'rgba(10, 138, 223, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];

    // Create location chart
    const ctx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(locationCounts),
            datasets: [{
                label: 'Quantidade por Localização',
                data: Object.values(locationCounts),
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: 'white'
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
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Localização',
                    font: {
                        size: 16
                    }
                }
            },
            animation: {
                duration: 0
            }
        }
    });

    // Aguarda o gráfico renderizar
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // Força a renderização do gráfico
        chart.update();

        // Aguarda mais um pouco para garantir a renderização
        await new Promise(resolve => setTimeout(resolve, 500));

        const chartImg = tempCanvas.toDataURL('image/png', 1.0);

        // Verifica se a imagem foi gerada corretamente
        if (!chartImg) {
            throw new Error('Erro ao gerar imagem do gráfico');
        }

        // Limpa os recursos
        chart.destroy();
        document.body.removeChild(tempCanvas);

        // Agrupa os itens
        const groupedItems = groupItems(items, groupBy);

        // Gera o PDF
        await exportToPDF({
            title: 'Relatório de Inventário',
            head: [
                'Item', 'Nome', 'Modelo', 'Nº Série', 'Localização', 'Ambiente', 'Categoria', 'Subcategoria'
            ],
            body: Object.entries(groupedItems).flatMap(([groupName, groupItems]) => {
                // Traduz o nome do grupo se for status
                const translatedGroupName = groupBy === 'status' ? getStatusLabel(groupName as any) : groupName;

                // Adiciona uma linha de cabeçalho para cada grupo
                const groupHeader = [[translatedGroupName, '', '', '', '', '', '', '']];
                // Adiciona os itens do grupo
                const groupRows = groupItems.map(item => [
                    item.item,
                    item.name,
                    item.model,
                    item.serial_number,
                    item.location?.name || '-',
                    item.locale?.name || '-',
                    item.category?.label || '-',
                    item.subcategory?.label || '-'
                ]);
                return [...groupHeader, ...groupRows];
            }),
            fileName: 'inventario.pdf',
            orientation: 'landscape',
            afterTable: (doc) => {
                // Nova página para o gráfico
                doc.addPage();

                // Configuração do cabeçalho
                doc.setFontSize(20);
                doc.text('Análise de Distribuição', 14, 20);

                // Gráfico de Localização
                doc.setFontSize(16);
                doc.text('Distribuição por Localização', 14, 40);
                doc.addImage(chartImg, 'PNG', 14, 50, 250, 150);

                // Adiciona legenda explicativa
                doc.setFontSize(10);
                doc.text('Este relatório foi gerado automaticamente pelo sistema de inventário.', 14, 220);
                doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 230);
            }
        });
    } catch (error) {
        chart.destroy();
        document.body.removeChild(tempCanvas);
        throw error;
    }
}; 