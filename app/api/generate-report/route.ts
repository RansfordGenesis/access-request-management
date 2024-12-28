import { NextResponse } from 'next/server'
import { createObjectCsvStringifier } from 'csv-writer'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { UserAccess } from '@/types/userAccess'

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  const data: UserAccess[] = await request.json()

  const accessCategories = {
    "Main AWS": ["Main_Aws_Ai_labs", "Main_Aws_Core_payment", "Main_Aws_Hubtel", "Main_Aws_Hubtel_developers", "Main_Aws_Vortex"],
    "Gov AWS": ["Gov_Aws_Backup", "Gov_Aws_Logging", "Gov_Aws_Network", "Gov_Aws_Production"],
    "Graylog": ["Graylog_Fraud_payment", "Graylog_Hubtel_customer_and_merchants", "Graylog_Hubtel_merchants", "Graylog_Hubtel_portals", "Graylog_Hubtel_qc", "Graylog_Hubtel_retailer", "Graylog_Infosec", "Graylog_Instant_services", "Graylog_Messaging_and_ussd", "Graylog_Mobile", "Graylog_Payments"],
    "ES/Kibana": ["ES_Ecommerce_search_es", "ES_Elastic_search_stream_es", "ES_Graylog_es", "ES_Health_os", "ES_Hubtel_paylinks_es", "ES_Instant_services_es", "ES_Internal_audit_os", "ES_Lend_score_os", "ES_Marketing_portal_es", "ES_Messaging_es", "ES_Ml_es", "ES_Receive_money_es", "ES_Risk_profile_os", "ES_Send_money_es"],
    "Others": ["others_Azure_devops", "others_Business_center", "others_Cloudflare", "others_Ghipss_server", "others_Icc", "others_Kannel", "others_Metabase", "others_New_relic", "others_Nita_db_server", "others_Nita_web_server", "others_Spacelift", "others_Webmin", "others_Windows_jumpbox"]
  }

  const processedData = data.map((item: UserAccess) => {
    const processedItem: Record<string, string> = {
      Email: item.Email,
      Name: item.Name,
      Job_Title: item.Job_Title,
      Department: item.Department,
    }

    Object.entries(accessCategories).forEach(([category, accesses]) => {
      const grantedAccesses = accesses.filter(access => item[access as keyof UserAccess] === "Yes")
      processedItem[category] = grantedAccesses.length > 0 ? grantedAccesses.join(", ") : "N/A"
    })

    return processedItem
  })

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
      format: 'a4'
    })

    doc.text('User Accesses Report', 14, 15)
    doc.autoTable({
      head: [Object.keys(processedData[0])],
      body: processedData.map(Object.values),
      startY: 20,
      styles: { cellPadding: 1.5, fontSize: 8 },
      columnStyles: { 
        0: { cellWidth: 40 }, // Email
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 30 }, // Job Title
        3: { cellWidth: 30 }, // Department
        4: { cellWidth: 40 }, // Main AWS
        5: { cellWidth: 40 }, // Gov AWS
        6: { cellWidth: 40 }, // Graylog
        7: { cellWidth: 40 }, // ES/Kibana
        8: { cellWidth: 40 }  // Others
      }
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