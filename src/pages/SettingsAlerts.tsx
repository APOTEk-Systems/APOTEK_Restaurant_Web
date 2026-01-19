import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsAlerts = () => {
  return (
    <MainLayout 
      title="Alerts" 
      subtitle="Configure system alerts and notifications"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Get notified about inventory-related events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when items fall below minimum stock level</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="low-stock-threshold">Default Low Stock Threshold</Label>
                <Input id="low-stock-threshold" type="number" placeholder="10" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="low-stock-frequency">Alert Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Expiring Products Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when products are nearing expiration</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-days">Days Before Expiry to Alert</Label>
              <Input id="expiry-days" type="number" placeholder="7" defaultValue="7" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Alerts</CardTitle>
            <CardDescription>Notifications for order-related events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Order Notification</Label>
                <p className="text-sm text-muted-foreground">Alert when a new order is placed</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Delay Alert</Label>
                <p className="text-sm text-muted-foreground">Notify when orders exceed preparation time</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay-minutes">Delay Threshold (minutes)</Label>
              <Input id="delay-minutes" type="number" placeholder="15" defaultValue="15" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Cancellation Alert</Label>
                <p className="text-sm text-muted-foreground">Notify when an order is cancelled</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Alerts</CardTitle>
            <CardDescription>Notifications for reservations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Reservation Alert</Label>
                <p className="text-sm text-muted-foreground">Notify when a new reservation is made</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Upcoming Reservation Reminder</Label>
                <p className="text-sm text-muted-foreground">Reminder before reservation time</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-minutes">Reminder Time (minutes before)</Label>
              <Input id="reminder-minutes" type="number" placeholder="30" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">Show alerts within the application</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send alerts to your email</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send alerts via text message</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts even when not on the app</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Alert Settings</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsAlerts;
