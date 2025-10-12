"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddInternFormProps {
  onUserAdded: () => void;
  supervisors?: Array<{ id: number; fullName: string }>;
}

export function AddInternForm({
  onUserAdded,
  supervisors = [],
}: AddInternFormProps) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = useAuthStore((state) => state.token);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setDomain("");
    setSupervisor("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    // NEW: Convert dates to YYYY-MM-DD strings for backend
    const startDateStr = startDate
      ? startDate.toISOString().split("T")[0]
      : undefined;
    const endDateStr = endDate
      ? endDate.toISOString().split("T")[0]
      : undefined;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            email,
            role: "INTERN",
            supervisorId: supervisor ? parseInt(supervisor) : null,
            domain, // FIXED: Now included (full domain string)
            startDate: startDateStr, // FIXED: Send as string
            endDate: endDateStr, // FIXED: Send as string
            // notes, // OPTIONAL: Add if you extend schema/backend to handle it
          }),
        }
      );

      if (response.ok) {
        onUserAdded();
        setOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add intern. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Intern
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Intern</DialogTitle>
          <DialogDescription>
            Create a new intern profile and assign them to a supervisor.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter intern's full name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="intern@company.com"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>{" "}
            {/* FIXED: Made required for domain */}
            <Select
              onValueChange={setDomain}
              value={domain}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {/* FIXED: Changed values to full domain names (matches backend/pie chart) */}
                <SelectItem value="Software Engineering">
                  Software Engineering
                </SelectItem>
                <SelectItem value="Product Design">Product Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="UX/UI Design">UX/UI Design</SelectItem>
                {/* Add more domains here */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor</Label>
            <Select
              onValueChange={setSupervisor}
              value={supervisor}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.length > 0 ? (
                  supervisors.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id.toString()}>
                      {sup.fullName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No supervisors available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or comments..."
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Intern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
