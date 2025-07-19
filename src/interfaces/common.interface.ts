export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface UserRequest extends Request {
  user: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletInfo {
  address: string;
  balance: string;
  label?: string;
  isMain: boolean;
}

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  amount: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
  timestamp: number;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
}

export interface TransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransferResponse {
  hash: string;
  from: string;
  to: string;
  amount: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
}

export interface UserAnalytics {
  totalWallets: number;
  totalTransactions: number;
  totalVolume: string;
  averageTransactionAmount: string;
  lastTransactionDate?: Date;
}

export interface SystemAnalytics {
  totalUsers: number;
  totalWallets: number;
  totalTransactions: number;
  totalVolume: string;
  adminGasPaid: string;
  userGasPaid: string;
} 