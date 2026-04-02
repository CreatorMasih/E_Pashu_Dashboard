import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Profile</h2>
          <p className="text-muted-foreground text-sm">Account and notification preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>Field Admin</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>Operations Manager</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>Rural Cluster North</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Critical alerts</span><span>Enabled</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pregnancy reminders</span><span>Enabled</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily summary</span><span>Enabled</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
