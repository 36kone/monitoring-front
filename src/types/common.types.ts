export interface Pagination {
  total: number;
  size: number;
  current: number;
  pages: number;
  previous: boolean | null;
  next: boolean | null;
}
export interface PaginatedResponse<T> {
  pagination: Pagination;
  list: T[];
}
