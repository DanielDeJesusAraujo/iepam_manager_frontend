import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportToPDFOptions {
    title: string;
    head: string[];
    body: (string | number)[][];
    fileName?: string;
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    afterTable?: (doc: jsPDF) => Promise<void> | void;
    total?: {
        label: string;
        value: string | number;
    };
}

export async function exportToPDF({
    title,
    head,
    body,
    fileName = 'relatorio.pdf',
    orientation = 'landscape',
    afterTable,
    total
}: ExportToPDFOptions) {
    const doc = new jsPDF({ orientation });
    doc.text(title, 14, 16);
    
    autoTable(doc, {
        startY: 22,
        head: [head],
        body,
    });
    
    // Adicionar total se fornecido
    if (total) {
        const finalY = (doc as any).lastAutoTable.finalY || 22;
        doc.text(`${total.label}: ${total.value}`, 14, finalY + 10);
    }
    
    if (afterTable) {
        doc.addPage();
        await afterTable(doc);
    }
    doc.save(fileName);
}