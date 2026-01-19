import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react";

const salesData = [
  { day: 'Mon', sales: 4200, orders: 45 },
  { day: 'Tue', sales: 3800, orders: 38 },
  { day: 'Wed', sales: 5100, orders: 52 },
  { day: 'Thu', sales: 4600, orders: 48 },
  { day: 'Fri', sales: 6800, orders: 72 },
  { day: 'Sat', sales: 7200, orders: 78 },
  { day: 'Sun', sales: 5400, orders: 56 },
];

const hourlyTraffic = [
  { hour: '11AM', customers: 15 },
  { hour: '12PM', customers: 45 },
  { hour: '1PM', customers: 65 },
  { hour: '2PM', customers: 35 },
  { hour: '3PM', customers: 20 },
  { hour: '4PM', customers: 18 },
  { hour: '5PM', customers: 25 },
  { hour: '6PM', customers: 55 },
  { hour: '7PM', customers: 85 },
  { hour: '8PM', customers: 75 },
  { hour: '9PM', customers: 50 },
  { hour: '10PM', customers: 30 },
];

const topPerformers = [
  { name: "Sarah Mitchell", role: "Server", sales: "$12,450", orders: 156, rating: 4.9 },
  { name: "Mike Rodriguez", role: "Server", sales: "$10,890", orders: 142, rating: 4.8 },
  { name: "Emily Chen", role: "Server", sales: "$9,560", orders: 128, rating: 4.7 },
  { name: "James Thompson", role: "Chef", sales: "-", orders: 890, rating: 4.9 },
];

export default function Reports() {
  return (
    <MainLayout title="Reports" subtitle="Analytics and performance insights">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Select defaultValue="week">
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$37,100</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +12.5% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">389</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +8.2% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$95.37</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +4.1% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +15.3% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Day */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
              <CardDescription>Sales performance for the current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                    <Bar dataKey="sales" fill="hsl(32, 95%, 44%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Traffic */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Hourly Customer Traffic</CardTitle>
              <CardDescription>Average customers per hour today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="customers" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Staff members with highest performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Staff Member</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Sales</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Orders</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topPerformers.map((performer, index) => (
                    <tr key={performer.name} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-foreground">{performer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{performer.role}</td>
                      <td className="py-4 font-semibold text-foreground">{performer.sales}</td>
                      <td className="py-4 text-foreground">{performer.orders}</td>
                      <td className="py-4">
                        <span className="text-warning">★</span> {performer.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
