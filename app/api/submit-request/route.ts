import { NextRequest, NextResponse } from 'next/server'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamodb = DynamoDBDocument.from(new DynamoDB({
  region: process.env.NEW_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY!,
  },
}))

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = {
      id: Date.now().toString(),
      ...body,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
    }

    await dynamodb.put({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
      Item: item,
    })

    return NextResponse.json({ message: 'Request submitted successfully', id: item.id }, { status: 200 })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}