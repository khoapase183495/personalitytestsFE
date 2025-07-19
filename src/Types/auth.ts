// Backend Response Types based on Java AccountResponse

export interface Role {
  id: number;
  name: string;
}

export interface AccountResponse {
  id: number;
  email: string;
  phone: string;
  username: string;
  role: Role;
  token: string;
}

export interface User {
  id: number;
  email: string;
  phone: string;
  username: string;
  name: string; // Display name (derived from username)
  role: Role;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  login: (loginData: any) => Promise<AccountResponse>;
  register: (registerData: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}
