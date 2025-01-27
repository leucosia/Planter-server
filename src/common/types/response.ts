export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type ResponseStatusType = 'SUCCESS' | 'ERROR';
export type ResponseInterface = {
  timestamp: number;
  requestId: string;
  path: string;
  code: number;
};
export type SuccessResponseInterface<T> = {
  data: T;
} & ResponseInterface;

export type ErrorResponseInterface = {
  message?: string;
} & ResponseInterface;
