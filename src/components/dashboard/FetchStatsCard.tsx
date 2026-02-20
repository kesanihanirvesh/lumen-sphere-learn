import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface FetchStatsCardProps {
  table: string;          // Table name (e.g. 'courses', 'students')
  title: string;          // Card title
  icon: React.ElementType; // Icon component (e.g. BookOpen, Users)
  description: string;    // Small text below the number
  redirect: string;       // Page to navigate when clicked
}

export default function FetchStatsCard({
  table,
  title,
  icon: Icon,
  description,
  redirect,
}: FetchStatsCardProps) {
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) setCount(count);
    };
    fetchCount();
  }, [table]);

  return (
    <Card
      onClick={() => navigate(redirect)}
      className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
