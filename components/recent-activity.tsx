'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  type: 'request' | 'approval' | 'rejection';
  user: string;
  details: string;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

