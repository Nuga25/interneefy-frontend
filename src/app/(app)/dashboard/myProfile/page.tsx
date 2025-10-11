"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Zap,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  UserCheck,
  Globe,
  BookOpen,
} from "lucide-react";
import React from "react";

// --- Mock Data Structures ---

type InternProfile = {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
  };
  academic: {
    university: string;
    major: string;
    gpa: number;
    yearLevel: string;
    graduationYear: number;
  };
  internship: {
    domain: string;
    status: "Active" | "Completed";
    supervisor: string;
    supervisorEmail: string;
    startDate: string;
    endDate: string;
    duration: string;
  };
  skills: {
    technicalSkills: string[];
    areasOfInterest: string[];
  };
  evaluation: {
    status: "Pending" | "Completed";
    expectedCompletion: string;
    feedbackText?: string;
  };
};

const mockInternData: InternProfile = {
  personal: {
    fullName: "Alex Smith",
    email: "alexa@company.com",
    phone: "+1 (555) 567-8901",
    address: "456 Student Ave, College Town, CA 94110",
    emergencyContact: "Sarah Smith - Mother - (555) 876-5432",
  },
  academic: {
    university: "University of California, Berkeley",
    major: "Computer Science",
    gpa: 3.75,
    yearLevel: "Junior",
    graduationYear: 2025,
  },
  internship: {
    domain: "Software Engineering",
    status: "Active",
    supervisor: "Mike Chen",
    supervisorEmail: "mike.chen@company.com",
    startDate: "1/15/2024",
    endDate: "4/15/2024",
    duration: "3 months",
  },
  skills: {
    technicalSkills: [
      "Javascript",
      "React",
      "Node.js",
      "Python",
      "Git",
      "HTML/CSS",
      "TypeScript",
      "MongoDB",
    ],
    areasOfInterest: [
      "Web Development",
      "Machine Learning",
      "Mobile Apps",
      "Open Source",
    ],
  },
  evaluation: {
    status: "Pending",
    expectedCompletion: "near the end of your internship (around 4/15/24)",
    // For testing the completed state:
    // status: 'Completed', feedbackText: "Alex demonstrated exceptional technical aptitude and quickly integrated into the team, consistently exceeding expectations on complex feature development."
  },
};

// Helper component for colored section backgrounds
const ProfileSectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colorClass: string;
  className?: string;
}> = ({ title, icon, children, colorClass, className = "" }) => (
  <Card className={`shadow-xl overflow-hidden ${className} border-none`}>
    {/* Header Band matching the design */}
    <div className={`p-3 text-white ${colorClass} flex items-center`}>
      {/* Type assertion to allow className on React element */}
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: "w-5 h-5 mr-3",
      })}
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </div>
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

// Helper component for label/value pair based on the new, sparse design
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
    {/* Type assertion to allow className on React element */}
    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
      className: "w-4 h-4 text-muted-foreground flex-shrink-0 mt-1",
    })}
    <div className="flex flex-col">
      <span className="text-xs font-light text-muted-foreground">{label}</span>
      <span className={`font-medium text-sm ${valueClass}`}>{value}</span>
    </div>
  </div>
);

// --- Individual Section Components (Refactored to match exact design spacing and layout) ---

const PersonalInformation: React.FC<{ data: InternProfile["personal"] }> = ({
  data,
}) => (
  <div className="space-y-4 text-sm">
    {/* Full Name and Icon */}
    <DataPoint
      label="Full Name"
      value={data.fullName}
      icon={<User />}
      isPadded={false}
    />

    {/* Email */}
    <DataPoint label="Email Address" value={data.email} icon={<Mail />} />

    {/* Phone */}
    <DataPoint label="Phone Number" value={data.phone} icon={<Phone />} />

    {/* Address */}
    <DataPoint label="Address" value={data.address} icon={<MapPin />} />

    {/* Separator and Emergency Contact */}
    <div className="pt-4 border-t border-red-100">
      <DataPoint
        label="Emergency Contact"
        value={data.emergencyContact}
        icon={<AlertTriangle className="text-red-500" />}
        valueClass="text-red-600 font-semibold text-sm"
        isPadded={false}
      />
    </div>
  </div>
);

const AcademicInformation: React.FC<{ data: InternProfile["academic"] }> = ({
  data,
}) => (
  <div className="space-y-4 text-sm">
    {/* University */}
    <DataPoint
      label="University"
      value={data.university}
      icon={<GraduationCap />}
      isPadded={false}
    />

    {/* Major */}
    <DataPoint label="Major" value={data.major} icon={<BookOpen />} />

    {/* GPA and Graduation Year - Placed side-by-side in the design */}
    <div className="flex items-end justify-between w-full pt-4">
      <div className="flex space-x-3">
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
        <div className="flex flex-col">
          <span className="text-xs font-light text-muted-foreground">GPA</span>
          <span className="font-bold text-lg text-green-600">
            {data.gpa.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <div className="flex flex-col text-right">
          <span className="text-xs font-light text-muted-foreground">
            Graduation
          </span>
          <span className="font-medium text-lg">{data.graduationYear}</span>
        </div>
      </div>
    </div>

    {/* Year Level - Placed below GPA/Grad Year in the design */}
    <div className="pt-4">
      <DataPoint
        label="Year Level"
        value={data.yearLevel}
        icon={<User />}
        isPadded={false}
      />
    </div>
  </div>
);

const InternshipDetails: React.FC<{ data: InternProfile["internship"] }> = ({
  data,
}) => (
  <div className="space-y-4 text-sm">
    {/* Domain and Status */}
    <div className="flex justify-between items-start pt-1">
      <DataPoint
        label="Domain"
        value={data.domain}
        icon={<Briefcase />}
        isPadded={false}
      />
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          data.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {data.status}
      </span>
    </div>

    {/* Supervisor Details */}
    <DataPoint
      label="Supervisor"
      value={
        <span className="flex flex-col">
          {data.supervisor}
          <span className="text-blue-500 text-xs font-normal">
            {data.supervisorEmail}
          </span>
        </span>
      }
      icon={<UserCheck />}
    />

    {/* Start Date / End Date - Placed side-by-side in the design */}
    <div className="flex justify-start space-x-12 pt-4">
      <DataPoint
        label="Start Date"
        value={data.startDate}
        icon={<Calendar />}
        isPadded={false}
      />
      {/* The end date/duration is typically further down in the design, adjusting for layout */}
    </div>

    {/* Duration / End Date */}
    <div className="flex justify-start space-x-12 pt-4">
      <DataPoint
        label="Duration"
        value={data.duration}
        icon={<Clock />}
        isPadded={false}
      />
      <DataPoint
        label="End Date"
        value={data.endDate}
        icon={<Calendar />}
        isPadded={false}
      />
    </div>
  </div>
);

const SkillsAndInterests: React.FC<{ data: InternProfile["skills"] }> = ({
  data,
}) => (
  <div className="space-y-6 text-sm">
    <div className="space-y-3">
      <h3 className="font-semibold text-base flex items-center">
        <Zap className="w-4 h-4 mr-2 text-orange-600" /> Technical Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.technicalSkills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>

    <div className="pt-4 border-t space-y-3">
      <h3 className="font-semibold text-base flex items-center">
        <Globe className="w-4 h-4 mr-2 text-orange-600" /> Areas of Interest
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.areasOfInterest.map((interest) => (
          <span
            key={interest}
            className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200"
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const FinalEvaluation: React.FC<{ data: InternProfile["evaluation"] }> = ({
  data,
}) => {
  const isPending = data.status === "Pending";

  return (
    <div className="text-center p-8 space-y-6">
      <div className="flex justify-center items-center">
        {isPending ? (
          <AlertTriangle className="w-16 h-16 text-yellow-500" />
        ) : (
          <CheckCircle className="w-16 h-16 text-green-500" />
        )}
      </div>

      <h2 className="text-xl font-bold">
        {isPending ? "Evaluation Pending" : "Evaluation Complete"}
      </h2>

      {isPending ? (
        <>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your final evaluation is not yet ready. Your supervisor will
            complete the evaluation near the end of your internship period.
          </p>
          <p className="text-sm font-medium text-green-600">
            Expected completion:{" "}
            <span className="underline">{data.expectedCompletion}</span>
          </p>
        </>
      ) : (
        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="italic text-gray-700">
            &quot;{data.feedbackText}&quot;
          </p>
          <p className="mt-2 text-sm font-semibold text-right text-green-600">
            - Supervisor
          </p>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function ProfileAndFeedbackPage() {
  // In a real app, this would fetch data based on the authenticated user ID
  const data = mockInternData;

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

      {/* Grid for top two rows (2x2 layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Personal Information (Blue Header) */}
        <ProfileSectionCard
          title="Personal Information"
          icon={<User />}
          colorClass="bg-blue-600"
        >
          <PersonalInformation data={data.personal} />
        </ProfileSectionCard>

        {/* 2. Academic Information (Purple Header) */}
        <ProfileSectionCard
          title="Academic Information"
          icon={<GraduationCap />}
          colorClass="bg-purple-600"
        >
          <AcademicInformation data={data.academic} />
        </ProfileSectionCard>

        {/* 3. Internship Details (Green Header) */}
        <ProfileSectionCard
          title="Internship Details"
          icon={<Briefcase />}
          colorClass="bg-green-600"
        >
          <InternshipDetails data={data.internship} />
        </ProfileSectionCard>

        {/* 4. Skills & Interests (Orange Header) */}
        <ProfileSectionCard
          title="Skills & Interests"
          icon={<Zap />}
          colorClass="bg-orange-600"
        >
          <SkillsAndInterests data={data.skills} />
        </ProfileSectionCard>
      </div>

      {/* Final Evaluation & Feedback (Red Header - Full Width) */}
      <ProfileSectionCard
        title="Final Evaluation & Feedback"
        icon={<MessageCircle />}
        colorClass="bg-red-600"
        className="mt-6"
      >
        <FinalEvaluation data={data.evaluation} />
      </ProfileSectionCard>
    </div>
  );
}
