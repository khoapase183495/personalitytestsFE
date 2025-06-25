// Types dựa trên backend LoginRequest và AccountResponse

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AccountResponse {
  id: string;
  email: string;
  name?: string;
  role?: string;
  token: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginState {
  isLoading: boolean;
  error: string | null;
  formData: LoginFormData;
}

export interface LoginProps {
  onLogin?: (response: AccountResponse) => void;
  onError?: (error: string) => void;
}
