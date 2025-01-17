import { AdaptiveCard, AccessRequest } from '@/lib/types'

export function generateTeamsCard(item: AccessRequest): AdaptiveCard {
  return {
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
              size: "Large",
              weight: "Bolder",
              text: `New Access Request: ${item.id}`
            },
            {
              type: "FactSet",
              facts: [
                { title: "Requester:", value: `${item.fullName} (${item.email})` },
                { title: "Department:", value: item.department },
                { title: "Job Title:", value: item.jobTitle }
              ]
            },
            {
              type: "TextBlock",
              text: "Requested Access:",
              weight: "Bolder",
              spacing: "Medium"
            },
            ...generateAccessCheckboxes("Main AWS", item.mainAws),
            ...generateAccessCheckboxes("Gov AWS", item.govAws),
            ...generateAccessCheckboxes("Graylog", item.graylog),
            ...generateAccessCheckboxes("ES/Kibana", item.esKibana),
            ...generateAccessCheckboxes("Other", item.otherAccess)
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Approve Selected",
              style: "positive",
              data: {
                action: "approve",
                requestId: item.id
              }
            },
            {
              type: "Action.Submit",
              title: "Reject",
              style: "destructive",
              data: {
                action: "reject",
                requestId: item.id
              }
            }
          ]
        }
      }
    ]
  }
}

function generateAccessCheckboxes(title: string, items?: string[]): any[] {
  if (!items || items.length === 0) return [];
  
  return [
    {
      type: "TextBlock",
      text: title,
      weight: "Bolder",
      spacing: "Small"
    },
    {
      type: "Input.ChoiceSet",
      id: `${title.toLowerCase().replace(/\s+/g, '_')}_access`,
      isMultiSelect: true,
      choices: items.map(item => ({
        title: item,
        value: item
      }))
    }
  ];
}

