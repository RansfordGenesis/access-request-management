import { NextResponse } from 'next/server';
import { createObjectCsvStringifier } from 'csv-writer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const data = await request.json();
  const currentDate = new Date().toLocaleString();

  const accessCategories = {
    'Main AWS': [
      'Main_Aws_Ai_labs',
      'Main_Aws_Core_payment',
      'Main_Aws_Hubtel',
      'Main_Aws_Hubtel_developers',
      'Main_Aws_Vortex',
    ],
    'Gov AWS': [
      'Gov_Aws_Backup',
      'Gov_Aws_Logging',
      'Gov_Aws_Network',
      'Gov_Aws_Production',
    ],
    'Graylog': [
      'Graylog_Fraud_payment',
      'Graylog_Hubtel_customer_and_merchants',
      'Graylog_Hubtel_merchants',
      'Graylog_Hubtel_portals',
      'Graylog_Hubtel_qc',
    ],
    'ES/Kibana': [
      'ES_Ecommerce_search_es',
      'ES_Elastic_search_stream_es',
      'ES_Graylog_es',
      'ES_Health_os',
    ],
    'Others': [
      'others_Azure_devops',
      'others_Business_center',
      'others_Cloudflare',
      'others_Ghipss_server',
    ],
  };

  const processedData = data.map((item: any) => {
    const accessData: any = {
      Email: item.Email || '',
      Name: item.Name || '',
      Job_Title: item.Job_Title || '',
      Department: item.Department || '',
    };
    
    for (const [category, keys] of Object.entries(accessCategories)) {
      accessData[category] = keys
        .filter(key => item[key] === 'Yes')
        .map(key => key.replace(/^[^_]+_/, '').replace(/_/g, ' '))
        .join(', ') || 'N/A';
    }

    return accessData;
  });

  if (format === 'csv') {
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(processedData[0]).map(key => ({ id: key, title: key }))
    });

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(processedData);

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=user_accesses_report.csv'
      }
    });
  } else if (format === 'pdf') {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 90, 140);
    doc.setFontSize(24);
    doc.text('User Accesses Report', 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${currentDate}`, 14, 25);

    doc.autoTable({
      head: [Object.keys(processedData[0])],
      body: processedData.map(Object.values),
      startY: 35,
      styles: { cellPadding: 8, fontSize: 10, halign: 'left', textColor: 30 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [48, 48, 48], textColor: 255 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: 0 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } },
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Confidential - Company Internal Use Only', 14, doc.internal.pageSize.height - 10);

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=user_accesses_report.pdf'
      }
    });
  } else {
    return NextResponse.json({ error: 'Invalid format specified' }, { status: 400 });
  }
}
