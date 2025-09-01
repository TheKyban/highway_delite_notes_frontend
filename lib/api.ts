import axios, { AxiosResponse, isAxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiResponse<T = string> {
  success: boolean;
  message?: string;
  data?: T;
}

interface SignupData {
  name: string;
  email: string;
  dob: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  dob: string;
  isVerified: boolean;
  createdAt: string;
}

interface LoginData {
  email: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteData {
  title: string;
  content: string;
}

interface UpdateNoteData {
  title?: string;
  content?: string;
}

class ApiService {
  private async handleResponse<T>(
    response: AxiosResponse
  ): Promise<ApiResponse<T>> {
    return response.data;
  }

  private setupRequestInterceptor() {
    axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  constructor() {
    this.setupRequestInterceptor();
  }

  // Auth Methods
  async signup(userData: SignupData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/signup", userData);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data.message || "Signup failed");
      throw new Error("Signup failed");
    }
  }

  async verifyOTP(otpData: VerifyOTPData): Promise<
    ApiResponse<{
      data: { user: { id: string; email: string; name: string } };
    }>
  > {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", otpData);

      // Extract token from Authorization header
      const authHeader = response.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        localStorage.setItem("authToken", token);
      }

      const result = await this.handleResponse<{
        data: { user: { id: string; email: string; name: string } };
      }>(response);
      return result;
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(
          error.response?.data?.message || "OTP verification failed"
        );
      throw new Error("OTP verification failed");
    }
  }

  async login(loginData: LoginData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/login", loginData);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Login failed");
      throw new Error("Login failed");
    }
  }

  async resendOTP(email: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/resend-otp", { email });
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Resend OTP failed");
      throw new Error("Resend OTP failed");
    }
  }

  async getProfile(): Promise<
    ApiResponse<{
      user: User;
    }>
  > {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Get profile failed");
      throw new Error("Get profile failed");
    }
  }

  // Notes Methods
  async getNotes(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<
    ApiResponse<{
      notes: Note[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalNotes: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>
  > {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      };

      const response = await axiosInstance.get("/notes", { params });
      console.log("Response", response);
      return this.handleResponse(response);
    } catch (error) {
      console.log("Error", error);
      // If token expired, clear localStorage and redirect to signin
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
        }
        throw new Error(error.response?.data?.message || "Get notes failed");
      }
      throw new Error("Get notes failed");
    }
  }

  async createNote(
    noteData: CreateNoteData
  ): Promise<ApiResponse<{ note: Note }>> {
    try {
      const response = await axiosInstance.post("/notes", noteData);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Create note failed");
      throw new Error("Create note failed");
    }
  }

  async updateNote(
    id: string,
    noteData: UpdateNoteData
  ): Promise<ApiResponse<{ note: Note }>> {
    try {
      const response = await axiosInstance.put(`/notes/${id}`, noteData);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Update note failed");
      throw new Error("Update note failed");
    }
  }

  async deleteNote(id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.delete(`/notes/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Delete note failed");
      throw new Error("Delete note failed");
    }
  }

  async getNoteById(id: string): Promise<ApiResponse<{ note: Note }>> {
    try {
      const response = await axiosInstance.get(`/notes/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Get note failed");
      throw new Error("Get note failed");
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/logout");

      // Clear token from localStorage regardless of response
      localStorage.removeItem("authToken");

      return this.handleResponse(response);
    } catch (error) {
      if (isAxiosError(error))
        throw new Error(error.response?.data?.message || "Logout failed");
      throw new Error("Logout failed");
    }
  }

  // Synchronous version for immediate checks
  hasLocalToken(): boolean {
    return !!localStorage.getItem("authToken");
  }
}

export const apiService = new ApiService();
export type {
  Note,
  SignupData,
  LoginData,
  VerifyOTPData,
  CreateNoteData,
  UpdateNoteData,
};
