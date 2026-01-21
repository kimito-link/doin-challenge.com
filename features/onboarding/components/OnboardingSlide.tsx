/**
 * OnboardingSlide Component
 * 個別のオンボーディングスライド
 */

import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import type { OnboardingSlide as SlideType } from "../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingSlideProps {
  slide: SlideType;
  isActive: boolean;
}

export function OnboardingSlide({ slide, isActive }: OnboardingSlideProps) {
  if (!isActive) return null;
  
  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={[styles.container, { backgroundColor: slide.backgroundColor }]}
    >
      {/* Emoji */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(400)}
        style={styles.emojiContainer}
      >
        <Text style={styles.emoji}>{slide.emoji}</Text>
      </Animated.View>
      
      {/* Title */}
      <Animated.View entering={FadeIn.delay(300).duration(400)}>
        <Text style={styles.title}>{slide.title}</Text>
      </Animated.View>
      
      {/* Description */}
      <Animated.View entering={FadeIn.delay(400).duration(400)}>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
      
      {/* Features */}
      {slide.features && (
        <Animated.View 
          entering={FadeIn.delay(500).duration(400)}
          style={styles.featuresContainer}
        >
          {slide.features.map((feature, index) => (
            <Animated.View 
              key={index}
              entering={FadeIn.delay(600 + index * 100).duration(300)}
              style={styles.featureItem}
            >
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 32,
  },
  featuresContainer: {
    width: "100%",
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 15,
    color: "#FFFFFF",
    flex: 1,
  },
});
