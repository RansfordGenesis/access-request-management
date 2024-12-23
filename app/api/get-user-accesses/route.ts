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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const name = searchParams.get('name')
  const department = searchParams.get('department')

  let filterExpression = ''
  let expressionAttributeValues: Record<string, any> = {}

  if (email) {
    filterExpression += 'contains(Email, :email)'
    expressionAttributeValues[':email'] = email
  }

  if (name) {
    if (filterExpression) filterExpression += ' AND '
    filterExpression += 'contains(#name, :name)'
    expressionAttributeValues[':name'] = name
  }

  if (department) {
    if (filterExpression) filterExpression += ' AND '
    filterExpression += 'contains(Department, :department)'
    expressionAttributeValues[':department'] = department
  }

  try {
    const params: any = {
      TableName: process.env.DYNAMODB_USER_ACCESSES_TABLE_NAME!,
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression
      params.ExpressionAttributeValues = expressionAttributeValues
      if (name) {
        params.ExpressionAttributeNames = { '#name': 'Name' }
      }
    }

    const result = await dynamodb.scan(params)

    return NextResponse.json(result.Items, { status: 200 })
  } catch (error) {
    console.error('Error fetching user accesses:', error)
    return NextResponse.json({ error: 'Failed to fetch user accesses' }, { status: 500 })
  }
}

