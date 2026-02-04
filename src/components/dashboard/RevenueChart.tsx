import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface RevenueChartProps {
  orders: any[];
  isLoading: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RevenueChart({ orders = [], isLoading }: RevenueChartProps) {
  // Calculate daily revenue for the current week
  const calculateWeeklyData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const weeklyData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      const revenue = dayOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const orderCount = dayOrders.length;
      
      weeklyData.push({
        name: dayNames[i],
        revenue,
        orders: orderCount,
      });
    }
    
    return weeklyData;
  };

  const data = isLoading ? [] : calculateWeeklyData();

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Revenue</h3>
        <p className="text-sm text-muted-foreground">Revenue trend for the current week</p>
      </div>
      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      ) : (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(32, 95%, 44%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(32, 95%, 44%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
              tickFormatter={(value) => `${(value).toLocaleString('en-US')}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString('en-US'), 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(32, 95%, 44%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
