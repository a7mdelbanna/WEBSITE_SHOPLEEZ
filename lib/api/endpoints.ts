/**
 * API Endpoints
 *
 * All API endpoint templates organized by module.
 * {storeId} placeholders are replaced at runtime.
 */

export const API_ENDPOINTS = {
  // ============== Authentication ==============
  auth: {
    // OTP-based authentication (Twilio)
    loginByPhone: '/RetailAPI/Auth/AuthenticateByPhoneNumberTwilio/{storeId}',
    generateOtp: '/RetailAPI/Auth/GenerateOTPTwilio/{storeId}',
    verifyOtp: '/RetailAPI/Auth/VerifyOTPTwilio/{storeId}',
    resendOtp: '/RetailAPI/Auth/ResendOtpTwilio',
    registerUser: '/RetailAPI/Auth/RegisterUserTwilio/{storeId}',
    registerShop: '/RetailAPI/Auth/RegisterShopTwilio/{storeId}',
    // Password-based authentication (non-Twilio)
    loginWithPassword: '/RetailAPI/Auth/AuthenticateByPhoneNumber/{storeId}',
    registerUserPassword: '/RetailAPI/Auth/RegisterUser/{storeId}',
    // Common endpoints
    refreshToken: '/RetailAPI/Auth/RefreshToken/{storeId}',
    changePassword: '/RetailAPI/Auth/ChangePassword/{storeId}',
    getProfile: '/RetailAPI/Auth/GetProfile/{storeId}',
    deleteAccount: '/RetailAPI/Auth/DeleteAccount/{storeId}',
    getValidId: '/RetailAPI/Auth/GetValidId',
  },

  // ============== Home ==============
  home: {
    getHomePage: '/RetailAPI/Home/GetHomePage/{storeId}',
  },

  // ============== Categories ==============
  categories: {
    getAll: '/RetailAPI/Customer/Category/GetAllCategories/{storeId}',
    getById: '/RetailAPI/Customer/MainCategory/GetMainCategoryById/{storeId}/{categoryId}',
    getSubCategories: '/RetailAPI/Customer/SubCategory/GetAllSubCategoriesByMainCategoryId/{storeId}/{categoryId}',
  },

  // ============== Companies/Brands ==============
  companies: {
    getAll: '/RetailAPI/Company/GetAllCompanies/{storeId}',
    getById: '/RetailAPI/Company/GetCompanyById/{storeId}/{companyId}',
    getByCategory: '/RetailAPI/Company/GetCompaniesByCategoryId/{storeId}/{categoryId}',
    getCategoriesByCompany: '/RetailAPI/Category/GetAllCategoriesByCompanyId/{storeId}/{companyId}',
  },

  // ============== Products/Items ==============
  products: {
    getAll: '/RetailAPI/Customer/Item/GetAllItems/{storeId}',
    getById: '/RetailAPI/Customer/Item/GetItemById/{storeId}/{itemId}',
    getByCategory: '/RetailAPI/Customer/Item/GetItemsByMainAndSubCategoryId/{storeId}/{categoryId}',
    getByBarcode: '/RetailAPI/Customer/ItemBarcode/GetItemByBarcode/{storeId}/{barcode}',
    getRelated: '/RetailAPI/Customer/RelatedProduct/GetRelatedProducts/{storeId}/{itemId}',
    getSpotlight: '/RetailAPI/Customer/ItemSpotlightAll/GetAllItemSpotlightAll/{storeId}',
    getSpecialOffers: '/RetailAPI/Customer/Offer/GetAllSpecialOffers/{storeId}',
  },

  // ============== Cart ==============
  cart: {
    get: '/RetailAPI/Customer/ShoppingCart/GetShoppingCartInfo/{storeId}',
    addItem: '/RetailAPI/Customer/ShoppingCart/AddItemToShoppingCart/{storeId}',
    updateQuantity: '/RetailAPI/Customer/ShoppingCart/UpdateCartItemQuantity/{storeId}',
    updateFlavor: '/RetailAPI/Customer/ShoppingCart/UpdateCartItemFlavour/{storeId}',
    removeItem: '/RetailAPI/Customer/ShoppingCart/DeleteItemFromShoppingCart/{storeId}/{itemId}',
    clear: '/RetailAPI/Customer/ShoppingCart/ClearAllShoppingCart/{storeId}',
    bulkAdd: '/RetailAPI/Customer/ShoppingCart/BulkAddItems/{storeId}',
    bulkUpdate: '/RetailAPI/Customer/ShoppingCart/BulkUpdateItems/{storeId}',
    getSuggestions: '/RetailAPI/Customer/ShoppingCart/GetItemSuggestions/{storeId}',
  },

  // ============== Orders ==============
  orders: {
    getValidId: '/RetailAPI/Customer/Order/GetValidId/{storeId}',
    checkout: '/RetailAPI/Customer/Order/CheckoutOrder/{storeId}',
    getCheckoutInfo: '/RetailAPI/Customer/Order/GetCheckoutOrderInfo/{storeId}',
    getMyOrders: '/RetailAPI/Customer/Order/GetMyOrders/{storeId}',
    getDetails: '/RetailAPI/Customer/Order/GetOrderDetails/{storeId}/{orderId}',
    leaveTip: '/RetailAPI/Customer/Order/LeaveATip/{storeId}',
    rate: '/RetailAPI/Customer/Order/RateOrder/{storeId}',
    cancel: '/RetailAPI/Customer/Order/CancelOrder/{storeId}/{orderId}',
    getReplacementItems: '/RetailAPI/Customer/Order/GetMyReplacementOrderItems/{storeId}/{orderId}',
    replaceItem: '/RetailAPI/Customer/Order/ReplaceItemFromOrder/{storeId}/{orderId}',
    removeItem: '/RetailAPI/Customer/Order/RemoveItemFromOrder/{storeId}/{orderId}',
  },

  // ============== Addresses ==============
  addresses: {
    getAll: '/RetailAPI/Customer/Address/GetMyAllAddresses/{storeId}',
    getValidId: '/RetailAPI/Customer/Address/GetValidId/{storeId}',
    createByArea: '/RetailAPI/Customer/Address/createCustomerAddressByArea/{storeId}',
    createByDistance: '/RetailAPI/Customer/Address/createCustomerAddressByDistance/{storeId}',
    createShopByArea: '/RetailAPI/Customer/Address/createShopAddressByArea/{storeId}',
    createShopByDistance: '/RetailAPI/Customer/Address/createShopAddressByDistance/{storeId}',
    confirmLocation: '/RetailAPI/Customer/Address/ConfirmAddressLocation/{storeId}',
    delete: '/RetailAPI/Customer/Address/DeleteAddress/{storeId}/{addressId}',
    getDeliveryFee: '/RetailAPI/Customer/DeliveryFee/GetDeliveryFeeByAddressId/{storeId}/{addressId}',
  },

  // ============== Favorites ==============
  favorites: {
    getAll: '/RetailAPI/Customer/Favorite/GetMyFavoriteItems/{storeId}',
    add: '/RetailAPI/Customer/Favorite/AddItemToFavorite/{storeId}/{itemId}',
    remove: '/RetailAPI/Customer/Favorite/RemoveItemFromFavorite/{storeId}/{itemId}',
  },

  // ============== Coupons & Loyalty ==============
  coupons: {
    validate: '/RetailAPI/Customer/Coupon/CheckCouponValidation/{storeId}/{couponCode}',
    apply: '/RetailAPI/Customer/Coupon/ApplyCoupon/{storeId}',
  },
  loyalty: {
    getRedeemCoupons: '/RetailAPI/Customer/Loyalty/GetMyRedeemCoupons/{storeId}',
    redeem: '/RetailAPI/Customer/Loyalty/Redeem/{storeId}',
    checkCoupon: '/RetailAPI/Customer/Loyalty/CheckCouponn/{storeId}',
    getPointsHistory: '/RetailAPI/Customer/Loyalty/GetPointsHistory/{storeId}',
  },

  // ============== Referrals ==============
  referrals: {
    activate: '/RetailAPI/Customer/Referral/ActivateMyReferralCode/{storeId}',
  },

  // ============== Wallet ==============
  wallet: {
    get: '/RetailAPI/Customer/Wallet/GetMyWallet/{storeId}',
    getTransactionHistory: '/RetailAPI/Customer/Wallet/GetMyTransactionHistory/{storeId}',
  },

  // ============== Chat ==============
  chat: {
    getPartners: '/RetailAPI/Chat/GetChatPartners/{storeId}',
    getMessages: '/RetailAPI/Chat/GetPreviousMessages/{storeId}/{partnerId}',
    uploadImage: '/RetailAPI/Chat/UploadChatImage/{storeId}',
  },

  // ============== Notifications ==============
  notifications: {
    getHistory: '/RetailAPI/Notification/GetNotificationsHistory/{storeId}',
    subscribe: '/RetailAPI/FCMSubscribtion/Subscribe/{storeId}',
  },

  // ============== Store Settings ==============
  store: {
    getSettings: '/RetailAPI/Customer/StoreSetting/GetStoreSettingByStoreId/{storeId}',
    getTheme: '/RetailAPI/AppTheme/GetTheme/{storeId}',
    checkVersion: '/RetailAPI/Customer/AppVersion/CheckAppVersionGet/{storeId}',
  },

  // ============== Location ==============
  location: {
    getCities: '/RetailAPI/City/GetAllCities/{storeId}',
    getAreas: '/RetailAPI/Area/GetAllAreas/{storeId}',
  },

  // ============== Widgets ==============
  widgets: {
    getAll: '/RetailAPI/Customer/Widget/RenderAllWidgets/{storeId}',
    getById: '/RetailAPI/Customer/Widget/RenderWidget/{storeId}/{widgetId}',
  },

  // ============== Search ==============
  search: {
    getRecent: '/RetailAPI/Customer/SearchHistory/GetRecentSearches/{storeId}',
    addRecent: '/RetailAPI/Customer/SearchHistory/AddToRecentSearches/{storeId}',
  },
} as const;
