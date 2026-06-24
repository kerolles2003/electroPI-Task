/**
 * Resolved, repository-ready filter for a paginated product query. `category`
 * has already been resolved from a slug to a concrete categoryId by the service.
 */
export interface ProductListFilter {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
}
