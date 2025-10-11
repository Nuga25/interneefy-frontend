"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, User, Building } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data structure for Company Settings
interface CompanySettings {
  logoUrl: string;
  companyName: string;
  timeZone: string;
  dateFormat: string;
}

// Mock data structure for User Profile
interface UserProfile {
  fullName: string;
  email: string;
  role: string;
}

const initialCompanySettings: CompanySettings = {
  logoUrl: "/path/to/techcorp-logo.png", // Mock logo path
  companyName: "TechCorp Solutions",
  timeZone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
};

const initialUserProfile: UserProfile = {
  fullName: "Sarah Johnson",
  email: "sarah.johnson@techcorp.com",
  role: "System Administrator",
};

const SettingsPage = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(
    initialCompanySettings
  );
  const [userProfile, setUserProfile] =
    useState<UserProfile>(initialUserProfile);
  const [isSaving, setIsSaving] = useState(false);

  // --- HANDLERS ---

  const handleCompanyChange = (field: keyof CompanySettings, value: string) => {
    setCompanySettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserChange = (field: keyof UserProfile, value: string) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    console.log("Saving company settings:", companySettings);
    console.log("Saving user profile:", userProfile);

    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      // In a real app, you would show a success toast here
      console.log("All settings saved successfully!");
    }, 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Placeholder: In a real app, use a service to get a secure URL
      const newLogoUrl = URL.createObjectURL(file);
      handleCompanyChange("logoUrl", newLogoUrl);
      console.log("Logo file selected:", file.name);
    }
  };

  return (
    <div className=" mx-auto">
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage system configurations and your personal account profile.
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>SJ</p>
        </div>
      </header>

      <main className="p-4">
        {/* --- 1. COMPANY SETTINGS CARD --- */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Company Configuration</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Update organization branding, time, and date settings.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 rounded-lg shadow-sm">
                  <AvatarImage
                    src={companySettings.logoUrl}
                    alt="Company Logo"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl rounded-lg">
                    TC
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Label htmlFor="company-logo">
                    <Button asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" /> Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 64x64 PNG or JPG
                  </p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="e.g., TechCorp Solutions"
                value={companySettings.companyName}
                onChange={(e) =>
                  handleCompanyChange("companyName", e.target.value)
                }
              />
            </div>

            {/* Time Zone and Date Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-zone">Time Zone</Label>
                <Select
                  value={companySettings.timeZone}
                  onValueChange={(value) =>
                    handleCompanyChange("timeZone", value)
                  }
                >
                  <SelectTrigger id="time-zone">
                    <SelectValue placeholder="Select Time Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time (ET)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (CT)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (PT)
                    </SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={companySettings.dateFormat}
                  onValueChange={(value) =>
                    handleCompanyChange("dateFormat", value)
                  }
                >
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select Date Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- 2. USER PROFILE CARD --- */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Your Profile</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Update your name and other personal account details.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  placeholder="Your full name"
                  value={userProfile.fullName}
                  onChange={(e) => handleUserChange("fullName", e.target.value)}
                />
              </div>
              {/* Email (Disabled since it's typically tied to login) */}
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address</Label>
                <Input
                  id="user-email"
                  value={userProfile.email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            {/* Role Display */}
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Input
                id="user-role"
                value={userProfile.role}
                disabled
                className="bg-gray-50 font-medium cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Your role determines the access and permissions you have across
                the system.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* --- SAVE ALL BUTTON (Sticky) --- */}
        <div className="py-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save All Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
