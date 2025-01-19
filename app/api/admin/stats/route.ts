import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    const result = await dbClient.scan({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
    });

    const requests = result.Items || [];

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
      approvedRequests: requests.filter(r => r.status === 'Approved').length,
      rejectedRequests: requests.filter(r => r.status === 'Rejected').length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

