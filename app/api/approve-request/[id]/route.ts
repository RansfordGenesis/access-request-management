import { NextRequest, NextResponse } from 'next/server';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const dynamodb = DynamoDBDocument.from(new DynamoDB({
  region: process.env.NEW_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY!,
  },
}));

// Define the expected payload type
interface ApprovalPayload {
  "Main AWS"?: string[];
  "Gov AWS"?: string[];
  Graylog?: string[];
  ES?: string[];
  Others?: string[];
}

// Route handler with correct Next.js 13+ typing
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const payload = await request.json() as ApprovalPayload;

    // Update DynamoDB
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
          ...(payload["Main AWS"] || []),
          ...(payload["Gov AWS"] || []),
          ...(payload.Graylog || []),
          ...(payload.ES || []),
          ...(payload.Others || []),
        ],
      },
    });

    // Submit to API Gateway if URL is configured
    const apiGatewayUrl = process.env.API_GATEWAY_URL;
    if (apiGatewayUrl) {
      const apiGatewayResponse = await fetch(apiGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!apiGatewayResponse.ok) {
        throw new Error('Failed to submit approval to API Gateway');
      }
    }

    return NextResponse.json(
      { message: 'Request approved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}