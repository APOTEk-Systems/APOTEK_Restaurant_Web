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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const tableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required").max(10, "Table number must be less than 10 characters"),
  capacity: z.string().min(1, "Capacity is required"),
  location: z.string().min(1, "Location is required").max(50, "Location must be less than 50 characters"),
  status: z.string().min(1, "Status is required"),
});

type TableFormValues = z.infer<typeof tableSchema>;

const tables = [
  { id: 1, tableNumber: "T-01", capacity: 4, location: "Main Hall", status: "available" },
  { id: 2, tableNumber: "T-02", capacity: 2, location: "Main Hall", status: "occupied" },
  { id: 3, tableNumber: "T-03", capacity: 6, location: "Main Hall", status: "available" },
  { id: 4, tableNumber: "T-04", capacity: 4, location: "Patio", status: "reserved" },
  { id: 5, tableNumber: "T-05", capacity: 8, location: "Private Room", status: "available" },
  { id: 6, tableNumber: "T-06", capacity: 2, location: "Bar Area", status: "occupied" },
  { id: 7, tableNumber: "T-07", capacity: 4, location: "Patio", status: "available" },
  { id: 8, tableNumber: "T-08", capacity: 10, location: "Private Room", status: "maintenance" },
];

const locations = ["Main Hall", "Patio", "Private Room", "Bar Area", "Outdoor"];
const statuses = ["available", "occupied", "reserved", "maintenance"];

export default function SettingsTables() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: "",
      capacity: "",
      location: "",
      status: "available",
    },
  });

  const onSubmit = (data: TableFormValues) => {
    toast.success(`Table ${data.tableNumber} has been added successfully`);
    setIsDialogOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Available</Badge>;
      case "occupied":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Occupied</Badge>;
      case "reserved":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Reserved</Badge>;
      case "maintenance":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTables = tables.filter(table => 
    table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Tables" subtitle="Manage restaurant tables and seating">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Tables</p>
            <p className="text-2xl font-bold text-foreground mt-1">{tables.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-success mt-1">
              {tables.filter(t => t.status === "available").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {tables.filter(t => t.status === "occupied").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </p>
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
              <Button className="gradient-primary shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogDescription>
                  Enter the details for the new table.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tableNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., T-09" {...field} />
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
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
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
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
                    <Button type="submit" className="gradient-primary">
                      Add Table
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
                  <span className="font-semibold text-foreground text-lg">{table.tableNumber}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{table.location}</span>
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
