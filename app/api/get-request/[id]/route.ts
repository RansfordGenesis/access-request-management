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

export async function GET(
  request: NextRequest,
) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    const result = await dynamodb.get({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
      Key: { id },
    })

    if (!result.Item) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json(result.Item)
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}