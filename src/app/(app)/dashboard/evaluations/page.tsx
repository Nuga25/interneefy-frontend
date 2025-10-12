// app/(app)/dashboard/evaluations/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi, evaluationApi, User } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Calendar,
  Filter,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

type EvaluationWithIntern = {
  id: number;
  internId: number;
  internName: string;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
  overallScore: number;
  comments: string | null;
  submittedAt: string;
};

// Helper to decode JWT
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const EvaluationsPage = () => {
  const token = useAuthStore((state) => state.token);

  const [interns, setInterns] = useState<User[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationWithIntern[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<
    EvaluationWithIntern[]
  >([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [internFilter, setInternFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    internId: "",
    technicalScore: 5,
    communicationScore: 5,
    teamworkScore: 5,
    comments: "",
  });

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get supervisor ID from token
      const tokenPayload = decodeJwt(token);
      const supervisorId = tokenPayload?.userId;

      // Fetch all users
      const allUsers = await userApi.getAll();

      // Filter for interns supervised by this supervisor
      const supervisedInterns = allUsers.filter(
        (user) => user.role === "INTERN" && user.supervisorId === supervisorId
      );

      setInterns(supervisedInterns);

      // Note: Your backend doesn't have an endpoint to get all evaluations
      // You'll need to add this endpoint or fetch individually per intern
      // For now, we'll set empty array - see note below
      setEvaluations([]);
      setFilteredEvaluations([]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load evaluations data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter evaluations
  useEffect(() => {
    if (internFilter === "all") {
      setFilteredEvaluations(evaluations);
    } else {
      setFilteredEvaluations(
        evaluations.filter(
          (evaluation) => evaluation.internId.toString() === internFilter
        )
      );
    }
  }, [internFilter, evaluations]);

  const handleSubmitEvaluation = async () => {
    if (!formData.internId || !formData.comments.trim()) {
      alert("Please select an intern and provide comments.");
      return;
    }

    setIsSubmitting(true);

    try {
      await evaluationApi.submit({
        internId: parseInt(formData.internId),
        technicalScore: formData.technicalScore,
        communicationScore: formData.communicationScore,
        teamworkScore: formData.teamworkScore,
        comments: formData.comments,
      });

      // Create a local evaluation object for display
      const overallScore =
        (formData.technicalScore +
          formData.communicationScore +
          formData.teamworkScore) /
        3;

      const newEvaluation: EvaluationWithIntern = {
        id: evaluations.length + 1,
        internId: parseInt(formData.internId),
        internName:
          interns.find((i) => i.id === parseInt(formData.internId))?.fullName ||
          "",
        technicalScore: formData.technicalScore,
        communicationScore: formData.communicationScore,
        teamworkScore: formData.teamworkScore,
        overallScore: Math.round(overallScore * 10) / 10,
        comments: formData.comments,
        submittedAt: new Date().toISOString(),
      };

      setEvaluations([newEvaluation, ...evaluations]);
      setIsDialogOpen(false);
      resetForm();

      alert("Evaluation submitted successfully!");
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      alert("Failed to submit evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      internId: "",
      technicalScore: 5,
      communicationScore: 5,
      teamworkScore: 5,
      comments: "",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  // Get interns that haven't been evaluated recently
  const internsForEvaluation = interns.filter(
    (intern) =>
      !evaluations.some(
        (evaluation) =>
          evaluation.internId === intern.id &&
          new Date(evaluation.submittedAt).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
      )
  );

  const averageScores = {
    technical:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.technicalScore, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
    communication:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.communicationScore, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
    teamwork:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.teamworkScore, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading evaluations</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchData} className="mt-4" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <header className="shadow-sm p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Evaluations</h1>
            <p className="text-muted-foreground">
              Submit and manage intern evaluations
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Intern Evaluation</DialogTitle>
                <DialogDescription>
                  Rate the intern&apos;s performance across different areas
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="intern">
                    Select Intern <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.internId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, internId: value })
                    }
                  >
                    <SelectTrigger id="intern">
                      <SelectValue placeholder="Choose an intern to evaluate" />
                    </SelectTrigger>
                    <SelectContent>
                      {interns.map((intern) => (
                        <SelectItem
                          key={intern.id}
                          value={intern.id.toString()}
                        >
                          {intern.fullName}
                          {intern.domain && ` - ${intern.domain}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="technical">Technical Skills</Label>
                      <span className="text-2xl font-bold text-primary">
                        {formData.technicalScore}
                      </span>
                    </div>
                    <Slider
                      id="technical"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.technicalScore]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, technicalScore: value[0] })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="communication">Communication</Label>
                      <span className="text-2xl font-bold text-primary">
                        {formData.communicationScore}
                      </span>
                    </div>
                    <Slider
                      id="communication"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.communicationScore]}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          communicationScore: value[0],
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="teamwork">Teamwork</Label>
                      <span className="text-2xl font-bold text-primary">
                        {formData.teamworkScore}
                      </span>
                    </div>
                    <Slider
                      id="teamwork"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.teamworkScore]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teamworkScore: value[0] })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Overall Score</Label>
                      <span className="text-3xl font-bold text-primary">
                        {(
                          (formData.technicalScore +
                            formData.communicationScore +
                            formData.teamworkScore) /
                          3
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">
                    Comments & Feedback <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    placeholder="Provide detailed feedback on the intern's performance, strengths, and areas for improvement..."
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  disabled={
                    !formData.internId ||
                    !formData.comments.trim() ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : evaluations.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Technical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  averageScores.technical
                )}`}
              >
                {isLoading ? "..." : `${averageScores.technical}/10`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  averageScores.communication
                )}`}
              >
                {isLoading ? "..." : `${averageScores.communication}/10`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Teamwork
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  averageScores.teamwork
                )}`}
              >
                {isLoading ? "..." : `${averageScores.teamwork}/10`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interns Ready for Evaluation */}
        {!isLoading && internsForEvaluation.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Interns Ready for Evaluation</CardTitle>
              <CardDescription>
                These interns haven&apos;t been evaluated in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {internsForEvaluation.map((intern) => (
                  <div
                    key={intern.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
                        {intern.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium">{intern.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {intern.domain || "No domain specified"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          internId: intern.id.toString(),
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      Evaluate Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={internFilter} onValueChange={setInternFilter}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Filter by Intern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interns</SelectItem>
                  {interns.map((intern) => (
                    <SelectItem key={intern.id} value={intern.id.toString()}>
                      {intern.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations History */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation History</CardTitle>
            <CardDescription>
              Past evaluations submitted for your interns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No evaluations found</p>
                <p className="text-sm">
                  {evaluations.length === 0
                    ? "Submit your first evaluation to get started!"
                    : "No evaluations match your selected filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center font-medium">
                              {evaluation.internName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {evaluation.internName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Evaluated on{" "}
                                  {new Date(
                                    evaluation.submittedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`px-4 py-2 rounded-lg ${getScoreBgColor(
                                evaluation.overallScore
                              )}`}
                            >
                              <div className="text-center">
                                <div
                                  className={`text-2xl font-bold ${getScoreColor(
                                    evaluation.overallScore
                                  )}`}
                                >
                                  {evaluation.overallScore}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Overall
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-lg font-bold">
                                {evaluation.technicalScore}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Technical
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-lg font-bold">
                                {evaluation.communicationScore}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Communication
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-lg font-bold">
                                {evaluation.teamworkScore}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Teamwork
                              </div>
                            </div>
                          </div>

                          {evaluation.comments && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Feedback & Comments
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {evaluation.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EvaluationsPage;
