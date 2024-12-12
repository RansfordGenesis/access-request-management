import { NextResponse } from 'next/server'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const dynamodb = DynamoDBDocument.from(new DynamoDB({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}))

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Email generation functions
export function generateRequestEmail(request: any) {
  return `
    <h1>New Access Request</h1>
    <p>A new access request has been submitted:</p>
    <ul>
      <li>Name: ${request.fullName}</li>
      <li>Email: ${request.email}</li>
      <li>Department: ${request.department}</li>
      <li>Job Title: ${request.jobTitle}</li>
    </ul>
    <p>Please review and approve or reject this request.</p>
  `
}

export function generateApprovalEmail(request: any, approvedAccess: string[], deniedAccess: string[]) {
  return `
    <h1>Access Request Update</h1>
    <p>Your access request has been processed:</p>
    <h2>Approved Access:</h2>
    <ul>
      ${approvedAccess.map(access => `<li>${access}</li>`).join('')}
    </ul>
    <h2>Denied Access:</h2>
    <ul>
      ${deniedAccess.map(access => `<li>${access}</li>`).join('')}
    </ul>
    <p>If you have any questions, please contact the IT department.</p>
  `
}

// Async function to send email using SES
async function sendEmail(to: string, subject: string, htmlBody: string) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: process.env.SES_SENDER_EMAIL!, // Use an environment variable for the sender email
  }

  try {
    await ses.send(new SendEmailCommand(params))
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const payload = await request.json()

    const requestItem = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: { id },
    })

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

    // Prepare access lists
    const approvedAccess = [
      ...payload["Main AWS"],
      ...payload["Gov AWS"],
      ...payload.Graylog,
      ...payload.ES,
      ...payload.Others,
    ]

    const allRequestedAccess = [
      ...(requestItem.Item?.mainAws || []),
      ...(requestItem.Item?.govAws || []),
      ...(requestItem.Item?.graylog || []),
      ...(requestItem.Item?.esKibana || []),
      ...(requestItem.Item?.other || []),
    ]

    const deniedAccess = allRequestedAccess.filter(access => !approvedAccess.includes(access))

    // Send email to user using SES
    await sendEmail(
      requestItem.Item?.email,
      'Access Request Approval',
      generateApprovalEmail(requestItem.Item, approvedAccess, deniedAccess)
    )

    return NextResponse.json({ message: 'Request approved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}