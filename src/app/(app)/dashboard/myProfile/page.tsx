"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  UserCheck,
  Globe,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import React from "react";
import { jwtDecode } from "jwt-decode";

// --- Type Definitions ---
type DecodedToken = {
  userId: number;
  companyId: number;
  role: string;
  fullName: string;
};

type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  domain: string | null;
  startDate: string | null;
  endDate: string | null;
  supervisor: {
    id: number;
    fullName: string;
    email: string;
  } | null;
};

type Evaluation = {
  id: number;
  comments: string | null;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
  submittedAt: string;
};

// --- Helper Components ---
const ProfileSectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colorClass: string;
  className?: string;
}> = ({ title, icon, children, colorClass, className = "" }) => (
  <Card className={`shadow-xl overflow-hidden ${className} border-none`}>
    <div className={`p-3 text-white ${colorClass} flex items-center`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: "w-5 h-5 mr-3",
      })}
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </div>
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

const DataPoint: React.FC<{
  label: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  valueClass?: string;
  isPadded?: boolean;
}> = ({
  label,
  value,
  icon,
  valueClass = "text-foreground",
  isPadded = true,
}) => (
  <div className={`flex space-x-3 ${isPadded ? "pt-2" : ""}`}>
    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
      className: "w-4 h-4 text-muted-foreground flex-shrink-0 mt-1",
    })}
    <div className="flex flex-col">
      <span className="text-xs font-light text-muted-foreground">{label}</span>
      <span className={`font-medium text-sm ${valueClass}`}>{value}</span>
    </div>
  </div>
);

// --- Section Components ---
const PersonalInformation: React.FC<{ profile: UserProfile }> = ({
  profile,
}) => (
  <div className="space-y-4 text-sm">
    <DataPoint
      label="Full Name"
      value={profile.fullName}
      icon={<User />}
      isPadded={false}
    />
    <DataPoint label="Email Address" value={profile.email} icon={<Mail />} />
    <DataPoint
      label="Role"
      value={profile.role}
      icon={<User />}
      valueClass="text-primary font-semibold"
    />
  </div>
);

const InternshipDetails: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const calculateDuration = () => {
    if (!profile.startDate || !profile.endDate) return "Not specified";
    const start = new Date(profile.startDate);
    const end = new Date(profile.endDate);
    const months = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return `${months} month${months !== 1 ? "s" : ""}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isActive = () => {
    if (!profile.endDate) return true;
    return new Date(profile.endDate) > new Date();
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex justify-between items-start pt-1">
        <DataPoint
          label="Domain"
          value={profile.domain || "General"}
          icon={<Briefcase />}
          isPadded={false}
        />
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isActive()
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive() ? "Active" : "Completed"}
        </span>
      </div>

      {profile.supervisor && (
        <DataPoint
          label="Supervisor"
          value={
            <span className="flex flex-col">
              {profile.supervisor.fullName}
              <span className="text-blue-500 text-xs font-normal">
                {profile.supervisor.email}
              </span>
            </span>
          }
          icon={<UserCheck />}
        />
      )}

      <div className="flex justify-start space-x-12 pt-4">
        <DataPoint
          label="Start Date"
          value={formatDate(profile.startDate)}
          icon={<Calendar />}
          isPadded={false}
        />
      </div>

      <div className="flex justify-start space-x-12 pt-4">
        <DataPoint
          label="Duration"
          value={calculateDuration()}
          icon={<Clock />}
          isPadded={false}
        />
        <DataPoint
          label="End Date"
          value={formatDate(profile.endDate)}
          icon={<Calendar />}
          isPadded={false}
        />
      </div>
    </div>
  );
};

const FinalEvaluation: React.FC<{ evaluation: Evaluation | null }> = ({
  evaluation,
}) => {
  if (!evaluation) {
    return (
      <div className="text-center p-8 space-y-6">
        <div className="flex justify-center items-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold">Evaluation Pending</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your final evaluation is not yet ready. Your supervisor will complete
          the evaluation near the end of your internship period.
        </p>
      </div>
    );
  }

  const avgScore =
    (evaluation.technicalScore +
      evaluation.communicationScore +
      evaluation.teamworkScore) /
    3;

  return (
    <div className="text-center p-8 space-y-6">
      <div className="flex justify-center items-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      <h2 className="text-xl font-bold">Evaluation Complete</h2>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {evaluation.technicalScore}
          </p>
          <p className="text-xs text-muted-foreground">Technical</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {evaluation.communicationScore}
          </p>
          <p className="text-xs text-muted-foreground">Communication</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {evaluation.teamworkScore}
          </p>
          <p className="text-xs text-muted-foreground">Teamwork</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold text-primary">{avgScore.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground">Overall Score</p>
      </div>

      {evaluation.comments && (
        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 max-w-lg mx-auto">
          <p className="italic text-gray-700">
            &quot;{evaluation.comments}&quot;
          </p>
          <p className="mt-2 text-sm font-semibold text-right text-green-600">
            - Supervisor
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Completed on{" "}
        {new Date(evaluation.submittedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
};

// --- Main Page Component ---
export default function ProfileAndFeedbackPage() {
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userId = decoded.userId;

        // Fetch user profile
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        } else {
          setError("Failed to load profile data");
        }

        // Fetch evaluation (if exists)
        try {
          const evalResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (evalResponse.ok) {
            const evalData = await evalResponse.json();
            setEvaluation(evalData);
          }
          // If 404, evaluation doesn't exist yet
        } catch (err) {
          console.log("No evaluation found yet");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while loading your profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load profile data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          My Profile & Feedback
        </h1>
        <p className="text-lg text-muted-foreground">
          Your internship information and performance evaluation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileSectionCard
          title="Personal Information"
          icon={<User />}
          colorClass="bg-blue-500"
        >
          <PersonalInformation profile={profile} />
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Internship Details"
          icon={<Briefcase />}
          colorClass="bg-green-500"
        >
          <InternshipDetails profile={profile} />
        </ProfileSectionCard>
      </div>

      <ProfileSectionCard
        title="Final Evaluation & Feedback"
        icon={<Globe />}
        colorClass="bg-purple-500"
        className="mt-6"
      >
        <FinalEvaluation evaluation={evaluation} />
      </ProfileSectionCard>
    </div>
  );
}
