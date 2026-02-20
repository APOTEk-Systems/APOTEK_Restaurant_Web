import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Loader2, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { accountingService } from "@/services/accountingService";

const COLORS = ['hsl(32, 95%, 44%)', 'hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)'];

export default function Accounting() {
  // Fetch accounting summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['accounting-summary'],
    queryFn: () => accountingService.getSummary(),
  });

  // Fetch recent transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['accounting-transactions'],
    queryFn: () => accountingService.getTransactions(10),
  });

  // Fetch daily summary for chart
  const { data: dailyData = [], isLoading: loadingDaily } = useQuery({
    queryKey: ['accounting-daily'],
    queryFn: () => accountingService.getDailySummary(30),
  });

  // Fetch expense breakdown
  const { data: expenseBreakdown = [], isLoading: loadingBreakdown } = useQuery({
    queryKey: ['accounting-expense-breakdown'],
    queryFn: () => accountingService.getExpenseBreakdown(),
  });

  const isLoading = loadingSummary || loadingTransactions || loadingDaily || loadingBreakdown;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US",{maximumFractionDigits:0})
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Accounting" subtitle="Financial overview and transactions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  const revenue = summary?.totalRevenue || 0;
  const purchases = summary?.totalPurchases || 0;
  const expenses = summary?.totalExpenses || 0;
  const profit = summary?.netProfit || 0;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <MainLayout title="Accounting" subtitle="Financial overview and transactions">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(revenue)}
                </p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  {summary?.revenueChange ? summary.revenueChange.toFixed(1) : 0}%
                </p>
              </div>
             
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Purchases</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(purchases)}
                </p>
                <p className="text-sm text-warning flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  {summary?.purchaseChange ? summary.purchaseChange.toFixed(1) : 0}%
                </p>
              </div>
            
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(expenses)}
                </p>
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  {summary?.expenseChange ? summary.expenseChange.toFixed(1) : 0}%
                </p>
              </div>
            
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(profit)}
                </p>
                <p className={`text-sm flex items-center gap-1 mt-1 ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {margin}% margin
                </p>
              </div>
             
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Revenue vs Expenses</h3>
                <p className="text-sm text-muted-foreground">Last 30 days comparison</p>
              </div>
            
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                    tickFormatter={(v) => `${(v/1000).toLocaleString('en-US')}k`}
                  />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
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
                  <Pie 
                    data={expenseBreakdown} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    dataKey="amount" 
                    paddingAngle={2}
                    nameKey="category"
                  >
                    {expenseBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expenseBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.category}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </MainLayout>
  );
}
