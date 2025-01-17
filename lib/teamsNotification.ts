import { AccessRequest } from '@/types'

const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL!;

export async function sendTeamsNotification(request: AccessRequest, action: 'approved' | 'rejected') {
  const title = `Access Request ${action.charAt(0).toUpperCase() + action.slice(1)}`;
  const color = action === 'approved' ? '00ff00' : 'ff0000';

  const accessList = `
**Requested Access:**
${request.mainAws?.length ? `- Main AWS: ${request.mainAws.join(', ')}\n` : ''}
${request.govAws?.length ? `- Gov AWS: ${request.govAws.join(', ')}\n` : ''}
${request.graylog?.length ? `- Graylog: ${request.graylog.join(', ')}\n` : ''}
${request.esKibana?.length ? `- ES/Kibana: ${request.esKibana.join(', ')}\n` : ''}
${request.otherAccess?.length ? `- Other Access: ${request.otherAccess.join(', ')}\n` : ''}
`;

  const message = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": color,
    "summary": title,
    "sections": [{
      "activityTitle": title,
      "activitySubtitle": `Request ID: ${request.id}`,
      "activityImage": "https://example.com/logo.png",
      "facts": [
        {
          "name": "Requester",
          "value": `${request.fullName} (${request.email})`
        },
        {
          "name": "Department",
          "value": request.department
        },
        {
          "name": "Job Title",
          "value": request.jobTitle
        },
        {
          "name": "Status",
          "value": action.charAt(0).toUpperCase() + action.slice(1)
        }
      ],
      "text": accessList
    }]
  };

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending Teams notification:', error);
  }
}