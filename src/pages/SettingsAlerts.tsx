import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settingsService, GenericSettings } from "@/services/settingsService";
import { toast } from "sonner";

interface AlertSettings extends GenericSettings {
  // Inventory Alerts
  low_stock_alerts?: string;
  low_stock_threshold?: string;
  low_stock_frequency?: string;
  expiring_products_alerts?: string;
  expiry_days?: string;
  
  // Order Alerts
  new_order_notification?: string;
  order_delay_alert?: string;
  delay_minutes?: string;
  order_cancellation_alert?: string;
  
  // Reservation Alerts
  new_reservation_alert?: string;
  upcoming_reservation_reminder?: string;
  reminder_minutes?: string;
}

const ALERT_SETTINGS_KEYS = {
  low_stock_alerts: 'low_stock_alerts',
  low_stock_threshold: 'low_stock_threshold',
  low_stock_frequency: 'low_stock_frequency',
  expiring_products_alerts: 'expiring_products_alerts',
  expiry_days: 'expiry_days',
  new_order_notification: 'new_order_notification',
  order_delay_alert: 'order_delay_alert',
  delay_minutes: 'delay_minutes',
  order_cancellation_alert: 'order_cancellation_alert',
  new_reservation_alert: 'new_reservation_alert',
  upcoming_reservation_reminder: 'upcoming_reservation_reminder',
  reminder_minutes: 'reminder_minutes',
} as const;

const SettingsAlerts = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AlertSettings>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAllSettings(),
  });

  useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData(settings as AlertSettings);
    }
  }, [settings, formData]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: GenericSettings) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Alert settings saved successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save alert settings');
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(settings as AlertSettings || {});
    setIsEditing(false);
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked ? 'true' : 'false' }));
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderViewSwitch = (label: string, description: string, value?: string) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={value === 'true'} disabled />
    </div>
  );

  const renderEditSwitch = (label: string, description: string, key: string) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch 
        checked={formData[key] === 'true'} 
        onCheckedChange={(checked) => handleSwitchChange(key, checked)}
      />
    </div>
  );

  const renderViewInput = (label: string, value?: string, type: string = 'text') => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ''} disabled type={type} />
    </div>
  );

  const renderEditInput = (label: string, key: string, type: string = 'text') => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={formData[key] || ''}
        onChange={(e) => handleInputChange(key, e.target.value)}
      />
    </div>
  );

  const renderViewSelect = (label: string, options: { value: string; label: string }[], value?: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderEditSelect = (label: string, options: { value: string; label: string }[], key: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Select value={formData[key]} onValueChange={(value) => handleSelectChange(key, value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <MainLayout title="Alerts" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <p>Loading alert settings...</p>
        </div>
      </MainLayout>
    );
  }

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
            {isEditing ? (
              <>
                {renderEditSwitch('Low Stock Alerts', 'Notify when items fall below minimum stock level', ALERT_SETTINGS_KEYS.low_stock_alerts)}
                <div className="grid gap-4 md:grid-cols-2">
                  {renderEditInput('Default Low Stock Threshold', ALERT_SETTINGS_KEYS.low_stock_threshold, 'number')}
                  {renderEditSelect('Alert Frequency', [
                    { value: 'immediately', label: 'Immediately' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily Summary' },
                    { value: 'weekly', label: 'Weekly Summary' },
                  ], ALERT_SETTINGS_KEYS.low_stock_frequency)}
                </div>
                {renderEditSwitch('Expiring Products Alerts', 'Notify when products are nearing expiration', ALERT_SETTINGS_KEYS.expiring_products_alerts)}
                {renderEditInput('Days Before Expiry to Alert', ALERT_SETTINGS_KEYS.expiry_days, 'number')}
              </>
            ) : (
              <>
                {renderViewSwitch('Low Stock Alerts', 'Notify when items fall below minimum stock level', settings?.low_stock_alerts)}
                <div className="grid gap-4 md:grid-cols-2">
                  {renderViewInput('Default Low Stock Threshold', settings?.low_stock_threshold, 'number')}
                  {renderViewSelect('Alert Frequency', [
                    { value: 'immediately', label: 'Immediately' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily Summary' },
                    { value: 'weekly', label: 'Weekly Summary' },
                  ], settings?.low_stock_frequency)}
                </div>
                {renderViewSwitch('Expiring Products Alerts', 'Notify when products are nearing expiration', settings?.expiring_products_alerts)}
                {renderViewInput('Days Before Expiry to Alert', settings?.expiry_days, 'number')}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Alerts</CardTitle>
            <CardDescription>Notifications for order-related events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {renderEditSwitch('New Order Notification', 'Alert when a new order is placed', ALERT_SETTINGS_KEYS.new_order_notification)}
                {renderEditSwitch('Order Delay Alert', 'Notify when orders exceed preparation time', ALERT_SETTINGS_KEYS.order_delay_alert)}
                {renderEditInput('Delay Threshold (minutes)', ALERT_SETTINGS_KEYS.delay_minutes, 'number')}
                {renderEditSwitch('Order Cancellation Alert', 'Notify when an order is cancelled', ALERT_SETTINGS_KEYS.order_cancellation_alert)}
              </>
            ) : (
              <>
                {renderViewSwitch('New Order Notification', 'Alert when a new order is placed', settings?.new_order_notification)}
                {renderViewSwitch('Order Delay Alert', 'Notify when orders exceed preparation time', settings?.order_delay_alert)}
                {renderViewInput('Delay Threshold (minutes)', settings?.delay_minutes, 'number')}
                {renderViewSwitch('Order Cancellation Alert', 'Notify when an order is cancelled', settings?.order_cancellation_alert)}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Alerts</CardTitle>
            <CardDescription>Notifications for reservations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {renderEditSwitch('New Reservation Alert', 'Notify when a new reservation is made', ALERT_SETTINGS_KEYS.new_reservation_alert)}
                {renderEditSwitch('Upcoming Reservation Reminder', 'Reminder before reservation time', ALERT_SETTINGS_KEYS.upcoming_reservation_reminder)}
                {renderEditInput('Reminder Time (minutes before)', ALERT_SETTINGS_KEYS.reminder_minutes, 'number')}
              </>
            ) : (
              <>
                {renderViewSwitch('New Reservation Alert', 'Notify when a new reservation is made', settings?.new_reservation_alert)}
                {renderViewSwitch('Upcoming Reservation Reminder', 'Reminder before reservation time', settings?.upcoming_reservation_reminder)}
                {renderViewInput('Reminder Time (minutes before)', settings?.reminder_minutes, 'number')}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateSettingsMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Alert Settings'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
              Edit Alert Settings
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsAlerts;
