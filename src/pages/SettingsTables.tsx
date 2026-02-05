import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Users,
  MapPin,
  Edit,
  Trash2
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { TableService, Table } from "@/services/tableService";

const tableSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z.string().min(1, "Capacity is required"),
 // location: z.string().min(1, "Location is required"),
  status: z.string().min(1, "Status is required"),
});

type TableFormValues = z.infer<typeof tableSchema>;

const locations = ["Main Hall", "Patio", "Private Room", "Bar Area", "Outdoor"];

export default function SettingsTables() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => TableService.getAllTables(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { number: number; capacity: number; status: string }) =>
      TableService.create({
        number: data.number, 
        capacity: data.capacity, 
        status: data.status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table added successfully');
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error('Failed to add table');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { number?: number; capacity?: number; status?: string } }) =>
      TableService.update(id, {
        number: data.number, 
        capacity: data.capacity, 
        status: data.status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated successfully');
      setIsDialogOpen(false);
      setEditingTable(null);
      form.reset();
    },
    onError: () => {
      toast.error('Failed to update table');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => TableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete table');
    },
  });

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: "",
      capacity: "",
      // location: "",
      status: "AVAILABLE",
    },
  });

  const onSubmit = (data: TableFormValues) => {
    if (editingTable) {
      updateMutation.mutate({
        id: editingTable.id,
        data: {
          number: parseInt(data.number),
          capacity: parseInt(data.capacity),
          status: data.status,
        },
      });
    } else {
      createMutation.mutate({
        number: parseInt(data.number),
        capacity: parseInt(data.capacity),
        status: data.status,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "AVAILABLE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "OCCUPIED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Occupied</Badge>;
      case "RESERVED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reserved</Badge>;
      case "MAINTENANCE":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTables = tables.filter(table => 
    table.number.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    form.reset({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
      // location: "",
      status: table.status,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTable(null);
    form.reset({
      number: "",
      capacity: "",
      // location: "",
      status: "AVAILABLE",
    });
    setIsDialogOpen(true);
  };

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  if (isLoading) {
    return (
      <MainLayout title="Tables" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <p>Loading tables...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tables" subtitle="Manage restaurant tables and seating">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Tables</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalTables}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{availableTables}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{occupiedTables}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCapacity}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tables..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
                <DialogDescription>
                  {editingTable ? 'Update the table details.' : 'Enter the details for the new table.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seating Capacity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "person" : "people"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="OCCUPIED">Occupied</SelectItem>
                            <SelectItem value="RESERVED">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTable ? 'Save Changes' : 'Add Table'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <div 
              key={table.id} 
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-lg">Table {table.number}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(table)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this table?')) {
                          deleteMutation.mutate(table.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} seats</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                {getStatusBadge(table.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
