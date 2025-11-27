// In src/components/MoodInsights.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodData {
  mood_rating: number;
  created_at: string;
}

interface MoodInsightsProps {
  moodData: MoodData[];
}

export function MoodInsights({ moodData }: MoodInsightsProps) {
  if (!moodData || moodData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No mood data available yet. Start tracking your mood to see insights.</p>
        </CardContent>
      </Card>
    );
  }

  const labels = moodData.map(item => 
    new Date(item.created_at).toLocaleDateString()
  );
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Mood Rating',
        data: moodData.map(item => item.mood_rating),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}