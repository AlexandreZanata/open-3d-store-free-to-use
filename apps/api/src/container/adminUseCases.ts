import type { AppConfig } from "../config.js";
import { AuditLogger } from "../application/services/AuditLogger.js";
import { CatalogCacheInvalidator } from "../application/services/CatalogCacheInvalidator.js";
import { CreateProduct } from "../application/use-cases/admin/CreateProduct.js";
import {
  CreateCategory,
  DeleteCategory,
  GetCategoryAdmin,
  ListCategoriesAdmin,
  UpdateCategory,
} from "../application/use-cases/admin/CategoryAdminUseCases.js";
import { DeleteProduct } from "../application/use-cases/admin/DeleteProduct.js";
import { RefreshAdminSession } from "../application/use-cases/admin/RefreshAdminSession.js";
import {
  GetProductAdmin,
  ListProductsAdmin,
} from "../application/use-cases/admin/ListProductsAdmin.js";
import { LoginAdmin } from "../application/use-cases/admin/LoginAdmin.js";
import { LogoutAdmin } from "../application/use-cases/admin/LogoutAdmin.js";
import {
  GetOrderCapture,
  ListOrderCaptures,
} from "../application/use-cases/admin/OrderAdminUseCases.js";
import { UpdateProduct } from "../application/use-cases/admin/UpdateProduct.js";
import { UploadAsset } from "../application/use-cases/admin/UploadAsset.js";
import type { ICatalogEventPublisher } from "../application/ports/ICatalogEventPublisher.js";
import type { IAssetStorage } from "../application/ports/IAssetStorage.js";
import type { IPasswordHasher } from "../application/ports/IPasswordHasher.js";
import type { ICacheService } from "../application/ports/ICacheService.js";
import type { IAdminSessionRepository } from "../domain/repositories/IAdminSessionRepository.js";
import type { IAdminUserRepository } from "../domain/repositories/IAdminUserRepository.js";
import type { IAuditLogRepository } from "../domain/repositories/IAuditLogRepository.js";
import type { ICategoryRepository } from "../domain/repositories/ICategoryRepository.js";
import type { IOrderCaptureRepository } from "../domain/repositories/IOrderCaptureRepository.js";
import type { IProductRepository } from "../domain/repositories/IProductRepository.js";

export type AdminUseCases = {
  loginAdmin: LoginAdmin;
  logoutAdmin: LogoutAdmin;
  refreshAdminSession: RefreshAdminSession;
  createProduct: CreateProduct;
  updateProduct: UpdateProduct;
  deleteProduct: DeleteProduct;
  listProductsAdmin: ListProductsAdmin;
  getProductAdmin: GetProductAdmin;
  createCategory: CreateCategory;
  updateCategory: UpdateCategory;
  deleteCategory: DeleteCategory;
  listCategoriesAdmin: ListCategoriesAdmin;
  getCategoryAdmin: GetCategoryAdmin;
  listOrderCaptures: ListOrderCaptures;
  getOrderCapture: GetOrderCapture;
  uploadAsset: UploadAsset;
};

type AdminUseCaseDeps = {
  config: AppConfig;
  admins: IAdminUserRepository;
  sessions: IAdminSessionRepository;
  auditLogs: IAuditLogRepository;
  products: IProductRepository;
  categories: ICategoryRepository;
  orders: IOrderCaptureRepository;
  cache: ICacheService;
  catalogEvents: ICatalogEventPublisher;
  passwordHasher: IPasswordHasher;
  assetStorage: IAssetStorage;
};

export function createAdminUseCases(deps: AdminUseCaseDeps): AdminUseCases {
  const audit = new AuditLogger(deps.auditLogs);
  const cacheInvalidator = new CatalogCacheInvalidator(deps.cache, deps.catalogEvents);

  return {
    loginAdmin: new LoginAdmin(
      deps.admins,
      deps.sessions,
      deps.passwordHasher,
      audit,
    ),
    logoutAdmin: new LogoutAdmin(deps.sessions, audit),
    refreshAdminSession: new RefreshAdminSession(deps.sessions, deps.admins),
    createProduct: new CreateProduct(
      deps.products,
      deps.categories,
      audit,
      cacheInvalidator,
    ),
    updateProduct: new UpdateProduct(
      deps.products,
      deps.categories,
      audit,
      cacheInvalidator,
    ),
    deleteProduct: new DeleteProduct(
      deps.products,
      audit,
      cacheInvalidator,
    ),
    listProductsAdmin: new ListProductsAdmin(deps.products),
    getProductAdmin: new GetProductAdmin(deps.products),
    createCategory: new CreateCategory(
      deps.categories,
      audit,
      cacheInvalidator,
    ),
    updateCategory: new UpdateCategory(
      deps.categories,
      audit,
      cacheInvalidator,
    ),
    deleteCategory: new DeleteCategory(
      deps.categories,
      audit,
      cacheInvalidator,
    ),
    listCategoriesAdmin: new ListCategoriesAdmin(deps.categories),
    getCategoryAdmin: new GetCategoryAdmin(deps.categories),
    listOrderCaptures: new ListOrderCaptures(deps.orders),
    getOrderCapture: new GetOrderCapture(deps.orders),
    uploadAsset: new UploadAsset(deps.assetStorage, audit),
  };
}
