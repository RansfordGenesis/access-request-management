import { NextRequest, NextResponse } from 'next/server'
import { dbClient } from '@/lib/db'
import mg from '@/lib/mailgun'
import { sendTeamsNotification } from '@/lib/teamsNotification';
import { AccessRequest } from '@/types'

export async function POST(
  request: NextRequest,
) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    const result = await dbClient.update({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
      Key: { id },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'Rejected',
      },
      ReturnValues: 'ALL_NEW',
    })

    const updatedRequest = result.Attributes as AccessRequest

    if (!updatedRequest || !updatedRequest.email) {
      return NextResponse.json({ error: 'Failed to update request or retrieve email' }, { status: 500 })
    }

    // Send email to requester
    const emailText = `
  Your access request has been rejected:
  Request ID: ${updatedRequest.id}
  Name: ${updatedRequest.fullName}
  
  Requested Access:
  ${updatedRequest.mainAws ? `Main AWS: ${updatedRequest.mainAws.join(', ')}\n` : ''}
  ${updatedRequest.govAws ? `Gov AWS: ${updatedRequest.govAws.join(', ')}\n` : ''}
  ${updatedRequest.graylog ? `Graylog: ${updatedRequest.graylog.join(', ')}\n` : ''}
  ${updatedRequest.esKibana ? `ES/Kibana: ${updatedRequest.esKibana.join(', ')}\n` : ''}
  ${updatedRequest.otherAccess ? `Other Access: ${updatedRequest.otherAccess.join(', ')}\n` : ''}
  
  If you have any questions, please contact the IT department.
`;
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: updatedRequest.email,
      subject: `Access Request Rejected: ${updatedRequest.id}`,
      text: emailText
    });

    // Send Teams notification
    await sendTeamsNotification(updatedRequest, 'rejected');

    return NextResponse.json({ message: 'Request rejected successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error rejecting request:', error)
    return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 })
  }
}