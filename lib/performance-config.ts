/**
 * パフォーマンス最適化設定
 * 速度改善とレスポンシブ化のための設定
 */

export const RESPONSIVE_CONFIG = {
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
  grid: {
    mobile: { columns: 1, gap: 12, padding: 16 },
    tablet: { columns: 2, gap: 16, padding: 24 },
    desktop: { columns: 3, gap: 24, padding: 32 },
    wide: { columns: 4, gap: 24, padding: 48 },
  },
  fontSize: {
    mobile: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
    tablet: { xs: 13, sm: 15, base: 17, lg: 19, xl: 22, '2xl': 26, '3xl': 32 },
    desktop: { xs: 14, sm: 16, base: 18, lg: 20, xl: 24, '2xl': 28, '3xl': 36 },
  },
  touchTarget: { minSize: 44, recommended: 48 },
};

export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5分
  cacheTime: 30 * 60 * 1000, // 30分
};
