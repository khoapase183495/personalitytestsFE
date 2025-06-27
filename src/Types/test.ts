// Test type definition cho TypeScript
export interface Test {
  id: number;
  title: string;
  description: string;
  isDeleted: boolean;
  createAt: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface TestRequest {
  title: string;
  description: string;
}
