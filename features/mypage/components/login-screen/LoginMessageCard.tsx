/**
 * LoginMessageCard Component
 * グラデーション背景のメインメッセージカード
 */

import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { LoginPattern } from "./constants";

interface LoginMessageCardProps {
  pattern: LoginPattern;
}

export function LoginMessageCard({ pattern }: LoginMessageCardProps) {
  return (
    <LinearGradient
      colors={[...pattern.gradientColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        maxWidth: 400,
        width: "100%",
      }}
    >
      <Text style={{ 
        color: "#fff", 
        fontSize: 20, 
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
      }}>
        {pattern.title}
      </Text>
      <Text style={{ 
        color: "rgba(255,255,255,0.9)", 
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
        marginBottom: 16,
      }}>
        {pattern.message}
      </Text>
      <View style={{ 
        backgroundColor: "rgba(255,255,255,0.2)", 
        borderRadius: 8, 
        padding: 12,
      }}>
        <Text style={{ 
          color: "#fff", 
          fontSize: 16, 
          fontWeight: "bold",
          textAlign: "center",
        }}>
          {pattern.highlight}
        </Text>
      </View>
    </LinearGradient>
  );
}
