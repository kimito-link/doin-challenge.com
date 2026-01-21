/**
 * useOnboarding Hook
 * オンボーディングの状態管理
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_STORAGE_KEY, ONBOARDING_SLIDES } from "../constants";

interface UseOnboardingReturn {
  // State
  hasCompletedOnboarding: boolean | null;
  currentSlideIndex: number;
  isLastSlide: boolean;
  isFirstSlide: boolean;
  totalSlides: number;
  
  // Actions
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  goToSlide: (index: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const totalSlides = ONBOARDING_SLIDES.length;
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  const isFirstSlide = currentSlideIndex === 0;
  
  // 初回起動時にオンボーディング完了状態を確認
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasCompletedOnboarding(completed === "true");
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  const goToNextSlide = useCallback(() => {
    if (!isLastSlide) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [isLastSlide]);
  
  const goToPrevSlide = useCallback(() => {
    if (!isFirstSlide) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [isFirstSlide]);
  
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlideIndex(index);
    }
  }, [totalSlides]);
  
  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  }, []);
  
  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setHasCompletedOnboarding(false);
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error("Failed to reset onboarding status:", error);
    }
  }, []);
  
  return {
    hasCompletedOnboarding,
    currentSlideIndex,
    isLastSlide,
    isFirstSlide,
    totalSlides,
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    completeOnboarding,
    resetOnboarding,
  };
}
