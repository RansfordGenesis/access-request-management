export interface AdaptiveCard {
    type: string;
    attachments: {
      contentType: string;
      content: {
        type: string;
        version: string;
        body: any[];
        actions?: any[];
      };
    }[];
  }
  
  export interface AccessRequest {
    id: string;
    fullName: string;
    email: string;
    department: string;
    jobTitle: string;
    mainAws?: string[];
    govAws?: string[];
    graylog?: string[];
    esKibana?: string[];
    otherAccess?: string[];
    status: string;
    createdAt: string;
    date: string;
  }
  
  