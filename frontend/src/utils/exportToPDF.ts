import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportToPDFOptions {
    title: string;
    head: string[];
    body: (string | number)[][];
    fileName?: string;
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    afterTable?: (doc: jsPDF) => Promise<void> | void;
}

export async function exportToPDF({
    title,
    head,
    body,
    fileName = 'relatorio.pdf',
    orientation = 'landscape',
    afterTable
}: ExportToPDFOptions) {
    const doc = new jsPDF({ orientation });
    doc.text(title, 14, 16);
    autoTable(doc, {
        startY: 22,
        head: [head],
        body,
    });
    if (afterTable) {
        doc.addPage();
        await afterTable(doc);
    }
    doc.save(fileName);
}