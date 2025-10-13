import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// === USER ENDPOINTS ===
export const userApi = {
  // Get all users (filtered by company)
  getAll: () => apiRequest<User[]>("/api/users"),

  // Get single user by ID
  getById: (id: number) => apiRequest<User>(`/api/users/${id}`),

  // Create new user (Admin only)
  create: (userData: CreateUserData) =>
    apiRequest<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Delete user (Admin only)
  delete: (id: number) =>
    apiRequest<void>(`/api/users/${id}`, {
      method: "DELETE",
    }),
};

// === TASK ENDPOINTS ===
export const taskApi = {
  // Get all tasks (for Interns - their assigned tasks)
  getMyTasks: () => apiRequest<Task[]>("/api/tasks"),

  // Get all tasks supervised by the logged-in supervisor
  getSupervisionTasks: () => apiRequest<Task[]>("/api/supervision/tasks"),

  // Get single task by ID
  getById: (id: number) => apiRequest<Task>(`/api/tasks/${id}`),

  // Create new task (Supervisor only)
  create: (taskData: CreateTaskData) =>
    apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),

  // Update task (Intern can update status, Supervisor can update all fields)
  update: (id: number, updates: UpdateTaskData) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
};

// === EVALUATION ENDPOINTS ===
export const evaluationApi = {
  // Get evaluation for current intern
  getMyEvaluation: () => apiRequest<Evaluation>("/api/evaluations/me"),

  // Get all evaluations for a supervisor's interns
  getSupervisorEvaluations: () =>
    apiRequest<Evaluation[]>("/api/evaluations/supervisor"),

  // Submit evaluation (Supervisor only)
  submit: (evaluationData: CreateEvaluationData) =>
    apiRequest<Evaluation>("/api/evaluations", {
      method: "POST",
      body: JSON.stringify(evaluationData),
    }),
};

// === STATISTICS ENDPOINTS ===
export const statisticsApi = {
  // Get enrollment statistics (Admin only)
  getEnrollment: () =>
    apiRequest<EnrollmentData[]>("/api/statistics/enrollment"),

  // Get domain statistics (Admin only)
  getDomains: () => apiRequest<DomainData[]>("/api/statistics/domains"),
};

// === COMPANY ENDPOINTS ===
export const companyApi = {
  // Get company details
  get: () => apiRequest<Company>("/api/company"),

  // Update company details (Admin only)
  update: (companyData: UpdateCompanyData) =>
    apiRequest<Company>("/api/company", {
      method: "PUT",
      body: JSON.stringify(companyData),
    }),
};

// === AUTH ENDPOINTS ===
export const authApi = {
  // Register company
  registerCompany: (data: RegisterCompanyData) =>
    apiRequest<{ message: string; company: any }>(
      "/api/auth/register-company",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Login
  login: (credentials: LoginCredentials) =>
    apiRequest<{ message: string; token: string; role: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    ),
};

// === TYPE DEFINITIONS ===

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
  domain?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  experience?: number | null;
  supervisorId?: number | null;
  supervisor?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  supervisees?: {
    fullName: string;
  }[];
};

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  category?: string | null;
  dueDate?: string | null;
  createdAt: string;
  supervisorId: number;
  internId: number;
  supervisor?: {
    fullName: string;
    email: string;
  };
  intern?: {
    id: number;
    fullName: string;
    email: string;
  };
};

export type Evaluation = {
  id: number;
  comments?: string | null;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
  submittedAt: string;
};

export type CreateUserData = {
  fullName: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
  supervisorId?: number;
  domain?: string;
  startDate?: string;
  endDate?: string;
};

export type CreateTaskData = {
  title: string;
  description?: string;
  dueDate?: string;
  internId: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
};

export type UpdateTaskData = {
  status?: "TODO" | "IN_PROGRESS" | "COMPLETED";
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  internId?: number;
};

export type CreateEvaluationData = {
  internId: number;
  comments?: string;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
};

export type EnrollmentData = {
  name: string;
  interns: number;
};

export type DomainData = {
  name: string;
  value: number;
};

export type Company = {
  id: number;
  name: string;
  logoUrl?: string | null;
  createdAt: string;
};

export type UpdateCompanyData = {
  name: string;
  logoUrl?: string;
};

export type RegisterCompanyData = {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
