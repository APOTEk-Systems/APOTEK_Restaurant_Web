import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Package, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["Meat", "Seafood", "Vegetables", "Dairy", "Pantry", "Beverages", "Spices", "Frozen"];
const units = ["lbs", "kg", "oz", "gal", "liters", "bottles", "heads", "units", "pcs", "qt"];
const suppliers = ["Farm Fresh Co.", "Ocean Catch Ltd.", "Valley Dairy", "Prime Meats Inc.", "Wholesale Foods"];

export default function InventoryNew() {
  return (
    <MainLayout title="Add Inventory Item" subtitle="Add a new item to your inventory">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Back Button */}
        <Link to="/inventory">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input id="name" placeholder="e.g., Fresh Salmon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Item Code</Label>
                  <Input id="sku" placeholder="e.g., INV-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Preferred Supplier</Label>
                  <Select>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier} value={supplier.toLowerCase().replace(/\s+/g, '-')}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Item description, specifications, etc." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Stock & Pricing */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Stock & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Current Quantity *</Label>
                  <Input id="quantity" type="number" min="0" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price ($) *</Label>
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input id="minStock" type="number" min="0" placeholder="Alert when below this" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock Level</Label>
                  <Input id="maxStock" type="number" min="0" placeholder="Maximum capacity" />
                </div>
              </div>
              
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Input id="location" placeholder="e.g., Walk-in Cooler A" />
                </div>
                
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="trackExpiry" className="font-medium">Track Expiry Dates</Label>
                  <p className="text-sm text-muted-foreground">Get alerts before items expire</p>
                </div>
                <Switch id="trackExpiry" />
              </div>
              {/* <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="autoReorder" className="font-medium">Enable Auto-Reorder</Label>
                  <p className="text-sm text-muted-foreground">Automatically create purchase orders</p>
                </div>
                <Switch id="autoReorder" />
              </div> */}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to="/inventory">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Package className="h-4 w-4 mr-2" />
              Add Inventory Item
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
