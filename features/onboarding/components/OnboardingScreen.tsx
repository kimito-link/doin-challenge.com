/**
 * OnboardingScreen Component
 * v6.31: 宇宙テーマ対応
 */

import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useOnboarding } from "../hooks/useOnboarding";
import { ONBOARDING_SLIDES } from "../constants";
import { OnboardingSlide } from "./OnboardingSlide";
import { OnboardingNavigation } from "./OnboardingNavigation";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const {
    currentSlideIndex,
    isLastSlide,
    isFirstSlide,
    totalSlides,
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    completeOnboarding,
  } = useOnboarding();
  
  const translateX = useSharedValue(0);
  
  const handleComplete = async () => {
    await completeOnboarding();
    onComplete();
  };
  
  const handleSkip = async () => {
    await completeOnboarding();
    onComplete();
  };
  
  // スワイプジェスチャー
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = 50;
      
      if (event.translationX < -threshold && !isLastSlide) {
        runOnJS(goToNextSlide)();
      } else if (event.translationX > threshold && !isFirstSlide) {
        runOnJS(goToPrevSlide)();
      }
      
      translateX.value = withTiming(0, { duration: 200 });
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }],
  }));
  
  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];
  
  return (
    <View style={[styles.container, { backgroundColor: "#0a1628" }]}>
      <StatusBar barStyle="light-content" />
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slideContainer, animatedStyle]}>
          {ONBOARDING_SLIDES.map((slide, index) => (
            <OnboardingSlide
              key={slide.id}
              slide={slide}
              isActive={index === currentSlideIndex}
            />
          ))}
        </Animated.View>
      </GestureDetector>
      
      <OnboardingNavigation
        currentIndex={currentSlideIndex}
        totalSlides={totalSlides}
        isLastSlide={isLastSlide}
        isFirstSlide={isFirstSlide}
        onNext={goToNextSlide}
        onPrev={goToPrevSlide}
        onSkip={handleSkip}
        onComplete={handleComplete}
        onDotPress={goToSlide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
  },
});
