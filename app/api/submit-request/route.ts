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
    <p>Details of Requested Access:</p>
    <ul>
      ${request.mainAws ? `<li>Main AWS: ${request.mainAws.join(', ')}</li>` : ''}
      ${request.govAws ? `<li>Gov AWS: ${request.govAws.join(', ')}</li>` : ''}
      ${request.graylog ? `<li>Graylog: ${request.graylog.join(', ')}</li>` : ''}
      ${request.esKibana ? `<li>ES Kibana: ${request.esKibana.join(', ')}</li>` : ''}
      ${request.otherAccess ? `<li>Other: ${request.otherAccess.join(', ')}</li>` : ''}
    </ul>
    <p>Please review this request.</p>
  `
}

export function generateUserConfirmationEmail(request: any) {
  return `
    <h1>Access Request Received</h1>
    <p>Dear ${request.fullName},</p>
    <p>Your access request has been received and is currently pending review. Here are the details of your submission:</p>
    <ul>
      ${request.mainAws ? `<li>Main AWS: ${request.mainAws.join(', ')}</li>` : ''}
      ${request.govAws ? `<li>Gov AWS: ${request.govAws.join(', ')}</li>` : ''}
      ${request.graylog ? `<li>Graylog: ${request.graylog.join(', ')}</li>` : ''}
      ${request.esKibana ? `<li>ES Kibana: ${request.esKibana.join(', ')}</li>` : ''}
      ${request.otherAccess ? `<li>Other: ${request.otherAccess.join(', ')}</li>` : ''}
    </ul>
    <p>You will be notified once your request has been processed.</p>
    <p>If you have any questions, please contact the Infrastructure department.</p>
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

export async function POST(request: Request) {
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
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Item: item,
    })

    // Send email to admin
    await sendEmail(
      process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      'New Access Request',
      generateRequestEmail(item)
    )

    // Send confirmation email to user
    await sendEmail(
      item.email,
      'Access Request Received',
      generateUserConfirmationEmail(item)
    )

    return NextResponse.json({ message: 'Request submitted successfully', id: item.id }, { status: 200 })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}