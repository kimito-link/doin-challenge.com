import { TouchableOpacity, StyleSheet, Platform, View, Text } from "react-native";
import { useCallback, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  position?: "bottom-right" | "bottom-center";
  color?: string;
  gradientColors?: [string, string];
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const SIZE_CONFIG = {
  small: { button: 48, icon: 24 },
  medium: { button: 56, icon: 28 },
  large: { button: 64, icon: 32 },
};

/**
 * フローティングアクションボタン（FAB）コンポーネント
 * 「しゃべった！」アプリを参考にした、右下の+ボタン
 */
export function FloatingActionButton({
  onPress,
  icon = "add",
  label,
  position = "bottom-right",
  color = "#EC4899",
  gradientColors,
  size = "medium",
  showLabel = false,
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const positionStyle = position === "bottom-center" 
    ? styles.positionCenter 
    : styles.positionRight;

  const ButtonContent = () => (
    <View style={[styles.buttonContent, { width: sizeConfig.button, height: sizeConfig.button }]}>
      <MaterialIcons name={icon as any} size={sizeConfig.icon} color="#fff" />
    </View>
  );

  return (
    <Animated.View style={[styles.container, positionStyle, animatedStyle]}>
      {showLabel && label && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.button,
          { 
            width: sizeConfig.button, 
            height: sizeConfig.button,
            borderRadius: sizeConfig.button / 2,
          }
        ]}
      >
        {gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              { 
                width: sizeConfig.button, 
                height: sizeConfig.button,
                borderRadius: sizeConfig.button / 2,
              }
            ]}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <View 
            style={[
              styles.solidBackground, 
              { 
                backgroundColor: color,
                width: sizeConfig.button, 
                height: sizeConfig.button,
                borderRadius: sizeConfig.button / 2,
              }
            ]}
          >
            <ButtonContent />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * 展開可能なFABコンポーネント
 * タップすると複数のアクションが表示される
 */
interface ExpandableFABAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface ExpandableFABProps {
  actions: ExpandableFABAction[];
  mainIcon?: string;
  mainColor?: string;
}

export function ExpandableFAB({
  actions,
  mainIcon = "add",
  mainColor = "#EC4899",
}: ExpandableFABProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const expansion = useSharedValue(0);

  const toggleExpand = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setExpanded(!expanded);
    rotation.value = withSpring(expanded ? 0 : 45, { damping: 15, stiffness: 300 });
    expansion.value = withTiming(expanded ? 0 : 1, { duration: 200 });
  }, [expanded, rotation, expansion]);

  const handleActionPress = useCallback((action: ExpandableFABAction) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress();
    setExpanded(false);
    rotation.value = withSpring(0, { damping: 15, stiffness: 300 });
    expansion.value = withTiming(0, { duration: 200 });
  }, [rotation, expansion]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.expandableContainer}>
      {/* アクションボタン */}
      {actions.map((action, index) => {
        const actionStyle = useAnimatedStyle(() => ({
          opacity: expansion.value,
          transform: [
            { translateY: interpolate(expansion.value, [0, 1], [0, -(60 * (index + 1))]) },
            { scale: expansion.value },
          ],
        }));

        return (
          <Animated.View key={index} style={[styles.actionItem, actionStyle]}>
            <View style={styles.actionLabelContainer}>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleActionPress(action)}
              style={[styles.actionButton, { backgroundColor: action.color || "#6B7280" }]}
              activeOpacity={0.8}
            >
              <MaterialIcons name={action.icon as any} size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* メインボタン */}
      <Animated.View style={mainButtonStyle}>
        <TouchableOpacity
          onPress={toggleExpand}
          style={[styles.mainButton, { backgroundColor: mainColor }]}
          activeOpacity={0.8}
        >
          <MaterialIcons name={mainIcon as any} size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  positionRight: {
    right: 20,
  },
  positionCenter: {
    left: "50%",
    transform: [{ translateX: -28 }],
  },
  button: {
    overflow: "hidden",
    // シャドウ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  solidBackground: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    // シャドウ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  // 展開可能FAB用スタイル
  expandableContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "flex-end",
    zIndex: 100,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabelContainer: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    // シャドウ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    // シャドウ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default FloatingActionButton;
