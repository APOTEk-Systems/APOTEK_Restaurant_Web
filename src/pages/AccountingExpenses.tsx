import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Download,
  Receipt,
  MoreHorizontal,
  FolderPlus
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
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseService, ExpenseCategory } from "@/services/expenseService";
import { toast } from "@/components/ui/use-toast";

export default function AccountingExpenses() {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    categoryId: "",
  });
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });
  
  const queryClient = useQueryClient();

  // Get current month's date range in local timezone format
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  // Fetch expenses
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses', startOfMonth, endOfMonth],
    queryFn: async () => {
      return ExpenseService.getAllExpenses({
        startDate: startOfMonth,
        endDate: endOfMonth,
      });
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => ExpenseService.getAllCategories(),
  });

  // Filter expenses based on search and category
  const filteredExpenses = (expenses as any[]).filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || expense.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return ExpenseService.createExpense({
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString(),
        description: data.description || undefined,
        categoryId: parseInt(data.categoryId),
      });
    },
    onSuccess: () => {
      toast({
        title: "Expense Created",
        description: "The expense has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsExpenseDialogOpen(false);
      setFormData({
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        categoryId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense.",
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return ExpenseService.createCategory({
        name: data.name,
        description: data.description || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Category Created",
        description: "The expense category has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      setIsCategoryDialogOpen(false);
      setCategoryData({
        name: "",
        description: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return ExpenseService.deleteExpense(id);
    },
    onSuccess: () => {
      toast({
        title: "Expense Deleted",
        description: "The expense has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense.",
        variant: "destructive",
      });
    },
  });

  const handleExpenseSubmit = () => {
    if (!formData.amount || !formData.categoryId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createExpenseMutation.mutate(formData);
  };

  const handleCategorySubmit = () => {
    if (!categoryData.name) {
      toast({
        title: "Missing Information",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(categoryData);
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <MainLayout title="Expenses" subtitle="Record and manage all expenses">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses (This Month)</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'TZS' })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {filteredExpenses.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <Receipt className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {categories.length}
                </p>
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
              <Input 
                placeholder="Search expenses..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories as ExpenseCategory[]).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Add Expense Dialog */}
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
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
                    <Input 
                      id="description" 
                      placeholder="Enter expense description" 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categories as ExpenseCategory[]).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <FolderPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                          <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                              Create a new expense category.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="categoryName">Category Name</Label>
                              <Input 
                                id="categoryName" 
                                placeholder="e.g., Office Supplies" 
                                value={categoryData.name}
                                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="categoryDescription">Description (Optional)</Label>
                              <Textarea 
                                id="categoryDescription" 
                                placeholder="Enter description..." 
                                value={categoryData.description}
                                onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCategorySubmit}
                              disabled={createCategoryMutation.isPending}
                            >
                              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="gradient-primary" 
                    onClick={handleExpenseSubmit}
                    disabled={createExpenseMutation.isPending}
                  >
                    {createExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingExpenses ? (
              <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No expenses found. Record your first expense above.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.map((expense: any) => (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{expense.description || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {expense.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">
                        {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'TZS' })}
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
                            <DropdownMenuItem className="text-destructive" onClick={() => {
                              if (confirm('Are you sure you want to delete this expense?')) {
                                deleteMutation.mutate(expense.id);
                              }
                            }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
