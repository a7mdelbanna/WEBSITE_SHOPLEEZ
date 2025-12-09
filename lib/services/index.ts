/**
 * Services Index
 *
 * Re-exports all service hooks for convenient imports.
 */

// Home services
export {
  homeQueryKeys,
  useHomePage,
  useHomeCategories,
  useHomeCompanies,
  useSpecialOffers,
  useSpotlightItems,
  useWidgets,
  useWidget,
} from './home';

// Category services
export {
  categoryQueryKeys,
  useCategories,
  useCategoryById,
  useSubCategories,
  useCompaniesByCategory,
} from './categories';

// Product services
export {
  productQueryKeys,
  useProducts,
  useProductById,
  useRelatedProducts,
  useProductByBarcode,
  useProductsByCategory,
  useProductsSimple,
} from './products';

// Cart services
export {
  cartQueryKeys,
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useUpdateCartItemFlavor,
  useRemoveFromCart,
  useClearCart,
  useBulkAddToCart,
  useBulkUpdateCart,
  useCartSuggestions,
  useValidateCoupon,
  useApplyCoupon,
} from './cart';
