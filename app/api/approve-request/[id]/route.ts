import { NextResponse } from 'next/server'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamodb = DynamoDBDocument.from(new DynamoDB({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}))

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const payload = await request.json()

    await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: { id },
      UpdateExpression: 'SET #status = :status, approvedAccess = :approvedAccess',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'Approved',
        ':approvedAccess': [
          ...payload["Main AWS"],
          ...payload["Gov AWS"],
          ...payload.Graylog,
          ...payload.ES,
          ...payload.Others,
        ],
      },
    })

    // Submit to API Gateway
    const apiGatewayUrl = process.env.API_GATEWAY_URL!
    const apiGatewayResponse = await fetch(apiGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!apiGatewayResponse.ok) {
      throw new Error('Failed to submit approval to API Gateway')
    }

    return NextResponse.json({ message: 'Request approved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}

