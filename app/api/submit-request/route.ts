import { NextRequest, NextResponse } from 'next/server'
import { generateTeamsCard } from '@/lib/teams'
import { dbClient } from '@/lib/db'
import { AccessRequest } from '@/types'
import mg from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body: Omit<AccessRequest, 'id' | 'status' | 'createdAt' | 'date'> = await request.json()
    const item: AccessRequest = {
      id: Date.now().toString(),
      ...body,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
    }

    await dbClient.put({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
      Item: item,
    })

    const adaptiveCard = generateTeamsCard(item)

    // Send to Teams webhook
    const teamsResponse = await fetch(process.env.TEAMS_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adaptiveCard)
    })

    if (!teamsResponse.ok) {
      throw new Error('Failed to send Teams notification')
    }

    // Send email to admin
    const adminEmailContent = `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
    .details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
    .details p { margin: 5px 0; }
    .access-list { margin-top: 10px; }
    .access-list h3 { margin-bottom: 5px; }
    .access-list ul { margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>New Access Request Submitted</h1>
    <div class="details">
      <p><strong>Request ID:</strong> ${item.id}</p>
      <p><strong>Requester:</strong> ${item.fullName} (${item.email})</p>
      <p><strong>Department:</strong> ${item.department}</p>
      <p><strong>Job Title:</strong> ${item.jobTitle}</p>
    </div>
    <div class="access-list">
      <h3>Requested Access:</h3>
      ${item.mainAws?.length ? `
        <h4>Main AWS:</h4>
        <ul>
          ${item.mainAws.map(access => `<li>${access}</li>`).join('')}
        </ul>
      ` : ''}
      ${item.govAws?.length ? `
        <h4>Gov AWS:</h4>
        <ul>
          ${item.govAws.map(access => `<li>${access}</li>`).join('')}
        </ul>
      ` : ''}
      ${item.graylog?.length ? `
        <h4>Graylog:</h4>
        <ul>
          ${item.graylog.map(access => `<li>${access}</li>`).join('')}
        </ul>
      ` : ''}
      ${item.esKibana?.length ? `
        <h4>ES/Kibana:</h4>
        <ul>
          ${item.esKibana.map(access => `<li>${access}</li>`).join('')}
        </ul>
      ` : ''}
      ${item.otherAccess?.length ? `
        <h4>Other Access:</h4>
        <ul>
          ${item.otherAccess.map(access => `<li>${access}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  </div>
</body>
</html>
`;

    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Access Request: ${item.id}`,
      html: adminEmailContent
    });

    // Send email to user
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: item.email,
      subject: `Access Request Submitted: ${item.id}`,
      html: `
    <h1>Access Request Submitted</h1>
    <p>Your access request has been submitted successfully.</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Request ID</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.id}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.fullName}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Department</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.department}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Job Title</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.jobTitle}</td>
      </tr>
    </table>
    <h2>Requested Access:</h2>
    <ul>
      ${item.mainAws?.length ? `<li>Main AWS: ${item.mainAws.join(', ')}</li>` : ''}
      ${item.govAws?.length ? `<li>Gov AWS: ${item.govAws.join(', ')}</li>` : ''}
      ${item.graylog?.length ? `<li>Graylog: ${item.graylog.join(', ')}</li>` : ''}
      ${item.esKibana?.length ? `<li>ES/Kibana: ${item.esKibana.join(', ')}</li>` : ''}
      ${item.otherAccess?.length ? `<li>Other Access: ${item.otherAccess.join(', ')}</li>` : ''}
    </ul>
    <p>We will review your request and get back to you soon.</p>
  `
    });

    return NextResponse.json({ message: 'Request submitted successfully', id: item.id }, { status: 200 })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}