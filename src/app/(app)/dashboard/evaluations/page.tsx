"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Star,
  Calendar,
  User,
  Filter,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

type Intern = {
  id: number;
  fullName: string;
  email: string;
  domain: string;
};

type Evaluation = {
  id: number;
  internId: number;
  internName: string;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  overallScore: number;
  comments: string;
  evaluatedAt: string;
};

const EvaluationsPage = () => {
  const token = useAuthStore((state) => state.token);

  const [interns, setInterns] = useState<Intern[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>(
    []
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [internFilter, setInternFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    internId: "",
    technicalSkills: 5,
    communication: 5,
    teamwork: 5,
    comments: "",
  });

  // Mock data - replace with API call
  useEffect(() => {
    if (token) {
      const mockInterns: Intern[] = [
        {
          id: 1,
          fullName: "John Doe",
          email: "john@example.com",
          domain: "Software Development",
        },
        {
          id: 2,
          fullName: "Jane Smith",
          email: "jane@example.com",
          domain: "UI/UX Design",
        },
        {
          id: 3,
          fullName: "Mike Johnson",
          email: "mike@example.com",
          domain: "Data Analytics",
        },
        {
          id: 4,
          fullName: "Sarah Williams",
          email: "sarah@example.com",
          domain: "Software Development",
        },
      ];

      const mockEvaluations: Evaluation[] = [
        {
          id: 1,
          internId: 1,
          internName: "John Doe",
          technicalSkills: 8,
          communication: 9,
          teamwork: 8,
          overallScore: 8.3,
          comments:
            "Excellent progress on API integration. Shows strong problem-solving skills and good communication with the team.",
          evaluatedAt: "2025-09-15",
        },
        {
          id: 2,
          internId: 2,
          internName: "Jane Smith",
          technicalSkills: 9,
          communication: 8,
          teamwork: 9,
          overallScore: 8.7,
          comments:
            "Outstanding design work. Very creative and receptive to feedback. Great collaboration with developers.",
          evaluatedAt: "2025-09-20",
        },
        {
          id: 3,
          internId: 3,
          internName: "Mike Johnson",
          technicalSkills: 7,
          communication: 7,
          teamwork: 8,
          overallScore: 7.3,
          comments:
            "Good analytical skills. Could improve on presentation skills but overall solid performance.",
          evaluatedAt: "2025-09-18",
        },
      ];

      setInterns(mockInterns);
      setEvaluations(mockEvaluations);
      setFilteredEvaluations(mockEvaluations);
    }
  }, [token]);

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

  const handleSubmitEvaluation = () => {
    const overallScore =
      (formData.technicalSkills + formData.communication + formData.teamwork) /
      3;

    const newEvaluation: Evaluation = {
      id: evaluations.length + 1,
      internId: parseInt(formData.internId),
      internName:
        interns.find((i) => i.id === parseInt(formData.internId))?.fullName ||
        "",
      technicalSkills: formData.technicalSkills,
      communication: formData.communication,
      teamwork: formData.teamwork,
      overallScore: Math.round(overallScore * 10) / 10,
      comments: formData.comments,
      evaluatedAt: new Date().toISOString().split("T")[0],
    };

    setEvaluations([newEvaluation, ...evaluations]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      internId: "",
      technicalSkills: 5,
      communication: 5,
      teamwork: 5,
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

  // Get interns that haven't been evaluated recently (mock logic)
  const internsForEvaluation = interns.filter(
    (intern) =>
      !evaluations.some(
        (evaluation) =>
          evaluation.internId === intern.id &&
          new Date(evaluation.evaluatedAt).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
      )
  );

  const averageScores = {
    technical:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.technicalSkills, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
    communication:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.communication, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
    teamwork:
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((acc, e) => acc + e.teamwork, 0) /
              evaluations.length) *
              10
          ) / 10
        : 0,
  };

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
                  <Label htmlFor="intern">Select Intern</Label>
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
                          {intern.fullName} - {intern.domain}
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
                        {formData.technicalSkills}
                      </span>
                    </div>
                    <Slider
                      id="technical"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.technicalSkills]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, technicalSkills: value[0] })
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
                        {formData.communication}
                      </span>
                    </div>
                    <Slider
                      id="communication"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.communication]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, communication: value[0] })
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
                        {formData.teamwork}
                      </span>
                    </div>
                    <Slider
                      id="teamwork"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.teamwork]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teamwork: value[0] })
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
                          (formData.technicalSkills +
                            formData.communication +
                            formData.teamwork) /
                          3
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">Comments & Feedback</Label>
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
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  disabled={!formData.internId || !formData.comments}
                >
                  Submit Evaluation
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
              <div className="text-2xl font-bold">{evaluations.length}</div>
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
                {averageScores.technical}/10
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
                {averageScores.communication}/10
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
                {averageScores.teamwork}/10
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interns Ready for Evaluation */}
        {internsForEvaluation.length > 0 && (
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
                          {intern.domain}
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
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No evaluations found. Submit your first evaluation to get
                started!
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
                                    evaluation.evaluatedAt
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
                                {evaluation.technicalSkills}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Technical
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-lg font-bold">
                                {evaluation.communication}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Communication
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-lg font-bold">
                                {evaluation.teamwork}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Teamwork
                              </div>
                            </div>
                          </div>

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
