import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    const result = await dbClient.scan({
      TableName: process.env.NEW_DYNAMODB_TABLE_NAME!,
      Limit: 10,
    });

    const activities = (result.Items || []).map((item: any) => ({
      id: item.id,
      type: item.status === 'Pending' ? 'request' : item.status.toLowerCase(),
      user: item.fullName,
      details: `${item.status === 'Pending' ? 'Requested' : item.status} access for ${item.department}`,
      timestamp: item.createdAt,
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
  }
}