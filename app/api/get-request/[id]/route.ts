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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const result = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE_NAME!,
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

