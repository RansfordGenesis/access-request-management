import { NextRequest, NextResponse } from 'next/server'
import { dbClient } from '@/lib/db'
import mg from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, requestId } = body.data

    if (action === 'approve' || action === 'reject') {
      let updateExpression = 'SET #status = :status'
      let expressionAttributeNames = { '#status': 'status' }
      let expressionAttributeValues: any = { ':status': action === 'approve' ? 'Approved' : 'Rejected' }

      if (action === 'approve') {
        updateExpression += ', approvedAccess = :approvedAccess'
        expressionAttributeValues[':approvedAccess'] = {
          "Main AWS": body.data.main_aws_access || [],
          "Gov AWS": body.data.gov_aws_access || [],
          "Graylog": body.data.graylog_access || [],
          "ES/Kibana": body.data.es_kibana_access || [],
          "Other": body.data.other_access || []
        }
      }

      const result = await dbClient.update({
        TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
        Key: { id: requestId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      })

      if (result.Attributes) {
        const updatedItem = result.Attributes

        if (action === 'approve' && process.env.NEW_API_GATEWAY_URL) {
          // Submit to API Gateway for provisioning
          await fetch(process.env.NEW_API_GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
          })
        }

        // Send email to user
        const emailSubject = action === 'approve' ? `Access Request Approved: ${requestId}` : `Access Request Rejected: ${requestId}`;
        const emailText = action === 'approve' 
          ? `
            Your access request has been approved:
            Request ID: ${requestId}
            Name: ${updatedItem.fullName}
            Approved Access: ${JSON.stringify(updatedItem.approvedAccess, null, 2)}
            
            If you have any questions, please contact the IT department.
          `
          : `
            Your access request has been rejected:
            Request ID: ${requestId}
            Name: ${updatedItem.fullName}
            
            If you have any questions, please contact the IT department.
          `;

        await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: process.env.MAILGUN_FROM_EMAIL,
          to: updatedItem.email,
          subject: emailSubject,
          text: emailText
        });

        // Send confirmation message back to Teams
        const confirmationMessage = {
          type: "message",
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: {
                type: "AdaptiveCard",
                version: "1.4",
                body: [
                  {
                    type: "TextBlock",
                    size: "Medium",
                    weight: "Bolder",
                    text: `Access Request ${action === 'approve' ? 'Approved' : 'Rejected'}`
                  },
                  {
                    type: "FactSet",
                    facts: [
                      { title: "Request ID:", value: requestId },
                      { title: "Status:", value: action === 'approve' ? 'Approved' : 'Rejected' }
                    ]
                  }
                ]
              }
            }
          ]
        }

        return NextResponse.json(confirmationMessage)
      } else {
        throw new Error('Failed to update request')
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(`Error handling Teams action:`, error)
    return NextResponse.json({ error: `Failed to process request` }, { status: 500 })
  }
}

