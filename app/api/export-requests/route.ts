import { NextResponse } from 'next/server'
import { createObjectCsvStringifier } from 'csv-writer'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamodb = DynamoDBDocument.from(new DynamoDB({
  region: process.env.NEW_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY!,
  },
}))

export async function GET() {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.DYNAMODB_TABLE_NAME!,
    })

    const requests = result.Items || []

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'email', title: 'Email' },
        { id: 'fullName', title: 'Full Name' },
        { id: 'department', title: 'Department' },
        { id: 'jobTitle', title: 'Job Title' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'mainAws', title: 'Main AWS' },
        { id: 'govAws', title: 'Gov AWS' },
        { id: 'graylog', title: 'Graylog' },
        { id: 'esKibana', title: 'ES/Kibana' },
        { id: 'otherAccess', title: 'Other Access' },
      ]
    })

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(requests)

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=all_requests.csv'
      }
    })
  } catch (error) {
    console.error('Error exporting requests:', error)
    return NextResponse.json({ error: 'Failed to export requests' }, { status: 500 })
  }
}

