/**
 * UX改善ユーティリティ
 * ユーザー体験を向上させるためのヘルパー関数とフック
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard, Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * キーボード表示状態を追跡
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardVisible;
}

/**
 * 触覚フィードバック付きボタンハンドラー
 */
export function useHapticPress(onPress: () => void) {
  return useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);
}

/**
 * フォーム入力の検証状態を管理
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: { [K in keyof T]?: (value: T[K]) => string | null }
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback(
    (field: keyof T, value: any) => {
      const validator = validators[field];
      if (validator) {
        const error = validator(value);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
        return error === null;
      }
      return true;
    },
    [validators]
  );

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validate(field, value);
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validate(field, values[field]);
    },
    [values, validate]
  );

  const validateAll = useCallback(() => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validators).forEach((key) => {
      const field = key as keyof T;
      const validator = validators[field];
      if (validator) {
        const error = validator(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid;
  }, [validators, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * ローディング状態を管理
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        return await fn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return { isLoading, startLoading, stopLoading, withLoading };
}

/**
 * トーストメッセージを管理
 */
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);

  const show = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type, visible: true });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  const hide = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, show, hide };
}

/**
 * 無限スクロールを実装
 */
export function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<T[]>,
  initialPage = 1
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newData = await fetchData(page);
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  return { data, loadMore, hasMore, isLoading, reset };
}

/**
 * 検索機能を実装
 */
export function useSearch<T>(
  items: T[],
  searchKeys: (keyof T)[],
  debounceMs = 300
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!searchQuery) {
        setFilteredItems(items);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = items.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          return false;
        })
      );

      setFilteredItems(filtered);
    }, debounceMs) as unknown as NodeJS.Timeout;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, items, searchKeys, debounceMs]);

  return { searchQuery, setSearchQuery, filteredItems };
}

/**
 * プルトゥリフレッシュを実装
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return { refreshing, onRefresh: handleRefresh };
}

/**
 * アニメーション状態を管理
 */
export function useAnimationState(duration = 300) {
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  return { isAnimating, startAnimation };
}

/**
 * フォーカス状態を追跡
 */
export function useFocusEffect(callback: () => void | (() => void)) {
  useEffect(() => {
    const cleanup = callback();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [callback]);
}

/**
 * スクロール位置を記憶
 */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback((event: any) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  }, []);

  return { scrollY, handleScroll };
}
