import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseService, ExpenseCategory, Expense } from "@/services/expenseService";
import { toast } from "@/components/ui/use-toast";
import { CreateExpenseDialog } from "@/components/expense/CreateExpenseDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AccountingExpenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  
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

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <MainLayout title="Expenses" subtitle="Record and manage all expenses">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
       

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 ">
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
           

            {/* Add Expense Dialog - Using separate component */}
            <CreateExpenseDialog
              triggerButton={
                <Button className="gradient-primary shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
              }
            />
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
                     <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                       <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                 
                  
                 
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                       <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Updated By</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.map((expense: Expense) => (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                       <td className="py-3 px-4 text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {expense.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                     
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {expense.paymentMethod || 'CASH'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-left font-semibold text-foreground">
                        {expense.amount.toLocaleString('en-US', { maximumFractionDigits:0 })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{expense.createdBy.username || 'N/A'}</span>
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
                              setExpenseToDelete(expense.id);
                              setDeleteDialogOpen(true);
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Expense"
          description="Are you sure you want to delete this expense? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          onConfirm={() => {
            if (expenseToDelete) {
              deleteMutation.mutate(expenseToDelete);
              setExpenseToDelete(null);
            }
          }}
        />
      </div>
    </MainLayout>
  );
}
