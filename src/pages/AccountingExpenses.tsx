import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Receipt,
  Calendar,
  Building2,
  Utensils,
  Zap,
  Car,
  Wrench,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const expenses = [
  {
    id: 1,
    description: "Monthly Rent Payment",
    category: "Rent",
    amount: 5500.00 * 2400,
    date: "Jan 1, 2026",
    vendor: "Property Management Co.",
    status: "paid",
    icon: Building2
  },
  {
    id: 2,
    description: "Fresh Produce Delivery",
    category: "Food & Supplies",
    amount: 2450.00 * 2400,
    date: "Jan 10, 2026",
    vendor: "Fresh Farms Inc.",
    status: "paid",
    icon: Utensils
  },
  {
    id: 3,
    description: "Electricity Bill - December",
    category: "Utilities",
    amount: 890.00 * 2400,
    date: "Jan 8, 2026",
    vendor: "City Power Co.",
    status: "paid",
    icon: Zap
  },
  {
    id: 4,
    description: "Delivery Vehicle Fuel",
    category: "Transportation",
    amount: 320.00 * 2400,
    date: "Jan 12, 2026",
    vendor: "Gas Station",
    status: "paid",
    icon: Car
  },
  {
    id: 5,
    description: "Kitchen Equipment Repair",
    category: "Maintenance",
    amount: 750.00 * 2400,
    date: "Jan 14, 2026",
    vendor: "Kitchen Tech Services",
    status: "pending",
    icon: Wrench
  },
  {
    id: 6,
    description: "Weekly Meat Supply",
    category: "Food & Supplies",
    amount: 1850.00 * 2400,
    date: "Jan 15, 2026",
    vendor: "Prime Meats Ltd.",
    status: "pending",
    icon: Utensils
  },
];

const categories = [
  "Food & Supplies",
  "Rent",
  "Utilities",
  "Payroll",
  "Marketing",
  "Maintenance",
  "Transportation",
  "Other"
];

export default function AccountingExpenses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === "paid").reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === "pending").reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <MainLayout title="Expenses" subtitle="Record and manage all expenses">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses (This Month)</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalExpenses.toLocaleString('en-US', )}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success mt-1">{paidExpenses.toLocaleString('en-US', )}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <Receipt className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning mt-1">{pendingExpenses.toLocaleString('en-US', )}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search expenses..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                  <DialogDescription>
                    Add a new expense record to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Enter expense description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" placeholder="Enter vendor name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Add any additional notes..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="gradient-primary" onClick={() => setIsDialogOpen(false)}>
                    Save Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{expense.description}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{expense.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{expense.date}</td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      {expense.amount.toLocaleString('en-US', )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={expense.status === "paid" ? "default" : "secondary"}
                        className={expense.status === "paid" ? "bg-success/10 text-success hover:bg-success/20" : "bg-warning/10 text-warning hover:bg-warning/20"}
                      >
                        {expense.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
