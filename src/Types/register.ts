// Types dựa trên backend RegisterRequest và AccountResponse

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: string;
}

export interface AccountResponse {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  token?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: string;
}

export interface RegisterState {
  isLoading: boolean;
  error: string | null;
  formData: RegisterFormData;
}

export interface RegisterProps {
  onRegister?: (response: AccountResponse) => void;
  onError?: (error: string) => void;
}
