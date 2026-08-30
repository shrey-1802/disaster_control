export interface ApiResponseMeta {
  requestId?: string;
  timestamp?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta: ApiResponseMeta;
}

export interface JwtPayload {
  userId: string;
  operatorId: string;
  role: string;
  assignedWarehouseId?: string | null;
  pincode: string;
}

export interface UserDTO {
  id: string;
  operatorId: string;
  name: string;
  role: string;
  pincode: string;
  district: string;
  state: string;
  assignedWarehouseId?: string | null;
}
