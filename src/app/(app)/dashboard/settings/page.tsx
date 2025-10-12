"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Building2,
  Image as ImageIcon,
} from "lucide-react";

type Company = {
  id: number;
  name: string;
  logoUrl: string | null;
  createdAt: string;
};

export default function SettingsPage() {
  const token = useAuthStore((state) => state.token);

  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState(false);

  // Fetch company details on mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCompany(data);
          setCompanyName(data.name);
          setLogoUrl(data.logoUrl || "");
        } else {
          setError("Failed to load company details.");
        }
      } catch (error) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [token]);

  // Reset image error when URL changes
  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/company`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: companyName,
            logoUrl: logoUrl || null,
          }),
        }
      );

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompany(updatedCompany);
        setSuccess("Company details updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update company details.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your company profile and preferences
          </p>
        </div>
      </header>

      <main className="p-6 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Company Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company&apos;s display name and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will be displayed throughout the application
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Company Logo URL (Optional)
                  </Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    disabled={isSaving}
                  />
                  <div className="text-xs text-muted-foreground space-y-2 mt-2">
                    <p>
                      Enter a URL to your company logo. For best results, use a
                      square image (512x512px recommended).
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md border">
                      <p className="font-medium mb-1">
                        Don&apos;t have an image URL? Here&apos;s how to get
                        one:
                      </p>
                      <ul className="space-y-1 ml-4 list-disc">
                        <li>
                          <a
                            href="https://postimages.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Use PostImages
                          </a>{" "}
                          (Free, simple) - Copy the &quot;Direct link&quot;
                          after upload
                        </li>
                        <li>
                          <a
                            href="https://imgbb.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Try ImgBB
                          </a>{" "}
                          (Free hosting) - Use the &quot;Direct link&quot; URL
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Logo Preview */}
                {logoUrl && (
                  <div className="space-y-2">
                    <Label>Logo Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted/20 flex items-center justify-center">
                      {!imageError ? (
                        <div className="relative h-24 w-24">
                          <Image
                            src={logoUrl}
                            alt="Company Logo Preview"
                            fill
                            className="object-contain"
                            unoptimized
                            onError={() => setImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <AlertCircle className="h-8 w-8" />
                          <p className="text-sm">
                            Unable to load image. Please check the URL.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCompanyName(company?.name || "");
                      setLogoUrl(company?.logoUrl || "");
                      setError("");
                      setSuccess("");
                      setImageError(false);
                    }}
                    disabled={isSaving}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Company Info Display Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Read-only company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Company ID</Label>
                <p className="text-sm font-mono">{company?.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created On</Label>
                <p className="text-sm">
                  {company?.createdAt
                    ? new Date(company.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
