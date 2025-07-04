export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
} 