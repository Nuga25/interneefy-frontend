"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image"; // Import Image component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Zap, BarChart } from "lucide-react"; // Icons for features

export default function SignUpPage() {
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again");
      return;
    }

    if (!agreedToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-company`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName, fullName, email, password }),
        }
      );

      if (response.ok) {
        alert("Registration successful! Please log in.");
        router.push("/login");
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      alert(`An error occured. Please try again.`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-40 max-w-7xl mx-auto md:p-8">
      {/* Left Column - Image */}
      <div className="md:w-1/2 relative min-h-[300px] md:min-h-auto">
        <Image
          src="/images/signup-hero.jpg" // <-- Replace with your actual image path
          alt="Students collaborating"
          layout="fill"
          objectFit="cover"
          className="hidden md:block" // Hide image on small screens
        />
        {/* Placeholder/simple logo for mobile view if image is hidden */}
        <div className="flex md:hidden items-center justify-center h-full bg-primary/10 p-4">
          <Link href="/" className="flex flex-col items-center gap-2">
            <img
              src="/logo.svg"
              alt="Interneefy Logo"
              className="h-12 w-12 text-primary"
            />
            <span className="font-bold text-3xl text-foreground">
              interneefy
            </span>
          </Link>
        </div>
      </div>

      {/* Right Column - Form centered */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Top Logo (for mobile view if image is hidden) */}
          <div className="flex md:hidden justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="Interneefy Logo"
                className="h-8 w-8 text-primary"
              />
              <span className="font-bold text-2xl text-foreground">
                interneefy
              </span>
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create Your Account</h1>
            <p className="text-muted-foreground">
              Fill in your details to get started.
            </p>
          </div>

          {/* Feature Highlights (New) */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex flex-col items-center text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                <Zap className="h-5 w-5" />
              </div>
              Quick Setup
            </div>
            <div className="flex flex-col items-center text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-primary mb-1">
                <Lock className="h-5 w-5" />
              </div>
              Secure Data
            </div>
            <div className="flex flex-col items-center text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-primary mb-1">
                <BarChart className="h-5 w-5" />
              </div>
              Grow Easily
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Your Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal text-muted-foreground"
              >
                I agree to the{" "}
                <Link href="#" className="underline hover:text-primary">
                  Terms of Service and Privacy Policy
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full">
              Create Free Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
