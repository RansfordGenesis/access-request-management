import { NextResponse } from 'next/server'
import { createObjectCsvStringifier } from 'csv-writer'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { AccessRequest } from '@/types'

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  const data: AccessRequest[] = await request.json()

  const processedData = data.map((item: AccessRequest) => ({
    id: item.id,
    email: item.email,
    fullName: item.fullName,
    department: item.department,
    jobTitle: item.jobTitle,
    status: item.status,
    createdAt: item.createdAt,
    mainAws: item.mainAws?.join(', ') || 'N/A',
    govAws: item.govAws?.join(', ') || 'N/A',
    graylog: item.graylog?.join(', ') || 'N/A',
    esKibana: item.esKibana?.join(', ') || 'N/A',
    otherAccess: item.otherAccess?.join(', ') || 'N/A',
  }))

  if (format === 'csv') {
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(processedData[0]).map(key => ({ id: key, title: key }))
    })

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(processedData)

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=user_accesses_report.csv'
      }
    })
  } else if (format === 'pdf') {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    })

    doc.setFontSize(18)
    doc.text('User Accesses Report', 14, 15)

    doc.autoTable({
      head: [Object.keys(processedData[0])],
      body: processedData.map(Object.values),
      startY: 25,
      styles: { cellPadding: 2, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 40 }, // Email
        2: { cellWidth: 30 }, // Full Name
        3: { cellWidth: 30 }, // Department
        4: { cellWidth: 30 }, // Job Title
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 30 }, // Created At
        7: { cellWidth: 40 }, // Main AWS
        8: { cellWidth: 40 }, // Gov AWS
        9: { cellWidth: 40 }, // Graylog
        10: { cellWidth: 40 }, // ES/Kibana
        11: { cellWidth: 40 } // Other Access
      },
    })

    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=user_accesses_report.pdf'
      }
    })
  } else {
    return NextResponse.json({ error: 'Invalid format specified' }, { status: 400 })
  }
}
