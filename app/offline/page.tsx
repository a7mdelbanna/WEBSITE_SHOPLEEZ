import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline',
};

export default function OfflinePage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

  // Store-specific configurations
  const storeConfigs: Record<string, {
    name: string;
    nameAr: string;
    primaryColor: string;
  }> = {
    '1': { name: 'El-Etihad', nameAr: 'الاتحاد', primaryColor: '#f4b324' },
    '20': { name: 'Galala Plus', nameAr: 'جلالة بلس', primaryColor: '#4CAF50' },
    '22': { name: 'Shakaleta', nameAr: 'شكاليطه', primaryColor: '#2196F3' },
    '23': { name: 'Haveniya', nameAr: 'هافنيا', primaryColor: '#9C27B0' },
  };

  const config = storeConfigs[storeId] || storeConfigs['1'];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Arabic Title */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          غير متصل بالإنترنت
        </h1>

        {/* Arabic Message */}
        <p className="mb-8 text-lg text-gray-600" dir="rtl">
          يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى.
        </p>

        {/* English Message */}
        <p className="mb-8 text-sm text-gray-500">
          You are currently offline. Please check your internet connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl"
          style={{ backgroundColor: config.primaryColor }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="font-medium">إعادة المحاولة / Retry</span>
        </button>

        {/* Store Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {config.nameAr} • {config.name}
          </p>
        </div>
      </div>
    </div>
  );
}
