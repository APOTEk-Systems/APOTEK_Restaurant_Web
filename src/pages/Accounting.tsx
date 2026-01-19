import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, FileText } from "lucide-react";

const revenueData = [
  { month: 'Jul', revenue: 45000 * 2400, expenses: 32000 * 2400 },
  { month: 'Aug', revenue: 52000 * 2400, expenses: 35000 * 2400 },
  { month: 'Sep', revenue: 48000 * 2400, expenses: 33000 * 2400 },
  { month: 'Oct', revenue: 58000 * 2400, expenses: 38000 * 2400 },
  { month: 'Nov', revenue: 65000 * 2400, expenses: 42000 * 2400 },
  { month: 'Dec', revenue: 72000 * 2400, expenses: 45000 * 2400 },
];

const expenseBreakdown = [
  { name: 'Food & Supplies', value: 35, color: 'hsl(32, 95%, 44%)' },
  { name: 'Payroll', value: 30, color: 'hsl(142, 76%, 36%)' },
  { name: 'Utilities', value: 12, color: 'hsl(221, 83%, 53%)' },
  { name: 'Rent', value: 15, color: 'hsl(262, 83%, 58%)' },
  { name: 'Marketing', value: 8, color: 'hsl(340, 75%, 55%)' },
];

const recentTransactions = [
  { id: 1, description: "Daily Sales - Register 1", amount: 4580.00 * 2400, type: "income", date: "Today, 10:00 PM" },
  { id: 2, description: "Supplier Payment - Fresh Farms", amount: -2450.00 * 2400, type: "expense", date: "Today, 3:30 PM" },
  { id: 3, description: "Staff Payroll", amount: -8500.00 * 2400, type: "expense", date: "Jan 5, 2026" },
  { id: 4, description: "Catering Event", amount: 3200.00 * 2400, type: "income", date: "Jan 4, 2026" },
  { id: 5, description: "Equipment Maintenance", amount: -750.00 * 2400, type: "expense", date: "Jan 3, 2026" },
];

export default function Accounting() {
  return (
    <MainLayout title="Accounting" subtitle="Financial overview and transactions">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">{(72580 * 2400).toLocaleString('en-US', )}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" /> +12.5%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-foreground mt-1">{(45230 * 2400).toLocaleString('en-US', )}</p>
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" /> +8.2%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-foreground mt-1">{(27350 * 2400).toLocaleString('en-US', )}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" /> +18.3%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          {/* <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
                <p className="text-2xl font-bold text-foreground mt-1">{(4890 * 2400).toLocaleString('en-US', )}</p>
                <p className="text-sm text-muted-foreground mt-1">12 invoices</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Revenue vs Expenses</h3>
                <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toLocaleString('en-US')}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Expense Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <span className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}>
                  {Math.abs(transaction.amount).toLocaleString('en-US', )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
