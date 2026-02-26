import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpenseService, ExpenseCategory } from "@/services/expenseService";
import { toast } from "@/components/ui/use-toast";

interface CreateExpenseDialogProps {
  children?: React.ReactNode;
  triggerButton?: React.ReactNode;
}

export interface ExpenseFormData {
  amount: string;
  date: Date;
  description: string;
  categoryId: string;
  paymentMethod: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export function CreateExpenseDialog({ children, triggerButton }: CreateExpenseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: "",
    date: new Date(),
    description: "",
    categoryId: "",
    paymentMethod: "CASH",
  });
  const [categoryData, setCategoryData] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => ExpenseService.getAllCategories(),
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      return ExpenseService.createExpense({
        amount: parseFloat(data.amount.replace(/,/g, '')),
        date: new Date(data.date).toISOString(),
        description: data.description || undefined,
        categoryId: parseInt(data.categoryId),
        paymentMethod: data.paymentMethod || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Expense Created",
        description: "The expense has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsOpen(false);
      setFormData({
        amount: "",
        date: new Date(),
        description: "",
        categoryId: "",
        paymentMethod: "CASH",
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
    mutationFn: async (data: CategoryFormData) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense record to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Date Field with Calendar */}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? formData.date.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Field */}
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

          {/* Amount Field */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => {
                // Allow only numbers and commas
                const value = e.target.value.replace(/[^\d.]/g, '');
                // Format with thousand separators
                const parts = value.split('.');
                const formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts.length > 1 ? '.' + parts[1] : '');
                setFormData({ ...formData, amount: formatted });
              }}
              onBlur={(e) => {
                // Format on blur
                const num = parseFloat(e.target.value.replace(/,/g, ''));
                if (!isNaN(num)) {
                  setFormData({ ...formData, amount: num.toLocaleString('en-US') });
                }
              }}
            />
          </div>

          {/* Payment Method Field */}
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">CASH</SelectItem>
                <SelectItem value="MOBILE">MOBILE</SelectItem>
                <SelectItem value="OTHERS">OTHERS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter expense description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
  );
}