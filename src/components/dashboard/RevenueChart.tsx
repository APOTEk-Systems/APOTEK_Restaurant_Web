import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 420 * 2400, orders: 45 },
  { name: 'Tue', revenue: 380 * 2400, orders: 38 },
  { name: 'Wed', revenue: 510 * 2400, orders: 52 },
  { name: 'Thu', revenue: 460 * 2400, orders: 48 },
  { name: 'Fri', revenue: 680 * 2400, orders: 72 },
  { name: 'Sat', revenue: 720 * 2400, orders: 78 },
  { name: 'Sun', revenue: 540 * 2400, orders: 56 },
];

export function RevenueChart() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Revenue</h3>
        <p className="text-sm text-muted-foreground">Revenue trend for the current week</p>
      </div>
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
              formatter={(value: number) => [value.toLocaleString('en-US', ), 'Revenue']}
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
    </div>
  );
}
