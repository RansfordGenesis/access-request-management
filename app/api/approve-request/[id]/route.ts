import { NextRequest, NextResponse } from 'next/server'
import { dbClient } from '@/lib/db'
import mg from '@/lib/mailgun'
import { sendTeamsNotification } from '@/lib/teamsNotification';
import { AccessRequest } from '@/types';

export async function POST(
  request: NextRequest,
) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    const payload = await request.json()
    const approver = payload.approver;
    const comments = payload.comments;

    const result = await dbClient.update({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
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
      ReturnValues: 'ALL_NEW',
    })

    if (result.Attributes) {
      const updatedItem = result.Attributes as AccessRequest

      // Send email to user
      const emailHtml = `
        <h1>Access Request Approved</h1>
        <p>Your access request has been approved:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Request ID</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${updatedItem.id}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${updatedItem.fullName}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Approved by</th>
            <td style="border: 1px solid #ddd; padding: 8px;">${approver}</td>
          </tr>
        </table>
        <h2>Approved Access:</h2>
        <ul>
          ${updatedItem.approvedAccess?.map((access: string) => `<li>${access}</li>`).join('')}
        </ul>
        <h2>Not Granted at This Time:</h2>
        <ul>
          ${[...updatedItem.mainAws || [], ...updatedItem.govAws || [], ...updatedItem.graylog || [], ...updatedItem.esKibana || [], ...updatedItem.otherAccess || []]
            .filter(access => !updatedItem.approvedAccess?.includes(access))
            .map(access => `<li>${access}</li>`)
            .join('')}
        </ul>
        <p>Comments: ${comments || 'No comments provided'}</p>
        <p>If you have any questions, please contact the IT department.</p>
      `;
      await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: process.env.MAILGUN_FROM_EMAIL,
        to: updatedItem.email,
        subject: `Access Request Approved: ${updatedItem.id}`,
        html: emailHtml
      });

      // Send Teams notification
      await sendTeamsNotification(updatedItem, 'approved', updatedItem.approvedAccess);

      return NextResponse.json({ message: 'Request approved successfully' }, { status: 200 })
    } else {
      throw new Error('Failed to update request')
    }

  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}