import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { expenseCategoryService, ExpenseCategory } from "@/services/expenseCategoryService";
import { toast } from "sonner";

const SettingsExpenseCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseCategoryService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });

  if (isLoading) {
    return (
      <MainLayout 
        title="Expense Categories" 
        subtitle="Loading..."
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading categories...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Expense Categories" 
      subtitle="Manage expense categories for financial tracking"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Define categories to organize and track your restaurant expenses.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Categories used for organizing expenses in accounting</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category?')) {
                              deleteMutation.mutate(category.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsExpenseCategories;
