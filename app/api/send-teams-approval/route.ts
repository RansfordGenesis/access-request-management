import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!,
  process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
  process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET!
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({ authProvider });

export async function POST(request: NextRequest) {
  try {
    const { requestId, requesterName, requesterEmail, department, accessRequested } = await request.json();

    const message = {
      subject: `Access Request Approval: ${requestId}`,
      importance: "high",
      body: {
        contentType: "html",
        content: `
          <p>A new access request requires your approval:</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Requester:</strong> ${requesterName} (${requesterEmail})</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Access Requested:</strong></p>
          <ul>
            ${accessRequested.map((access: string) => `<li>${access}</li>`).join('')}
          </ul>
          <p>Please review and take action on this request.</p>
        `
      },
      toRecipients: [
        {
          emailAddress: {
            address: process.env.APPROVER_EMAIL
          }
        }
      ]
    };

    await client.api('/users/approver@yourdomain.com/sendMail')
      .post({ message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Teams approval request:', error);
    return NextResponse.json({ error: 'Failed to send approval request' }, { status: 500 });
  }
}