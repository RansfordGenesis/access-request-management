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
  approvedAccess?: string[];
  status: string;
  createdAt: string;
  date: string;
}

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'user';
}