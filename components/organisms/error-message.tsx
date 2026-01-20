import { View, Text, TouchableOpacity } from "react-native";
import { color, palette } from "@/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: "error" | "warning" | "info";
}

const typeConfig = {
  error: {
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: color.danger,
    iconColor: color.danger,
    icon: "error-outline" as const,
  },
  warning: {
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: color.warning,
    iconColor: color.warning,
    icon: "warning" as const,
  },
  info: {
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: color.info,
    iconColor: color.info,
    icon: "info-outline" as const,
  },
};

export function ErrorMessage({ message, onRetry, type = "error" }: ErrorMessageProps) {
  const config = typeConfig[type];
  
  return (
    <View
      style={{
        backgroundColor: config.bgColor,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: config.borderColor,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <MaterialIcons name={config.icon} size={24} color={config.iconColor} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: color.textWhite, fontSize: 14, lineHeight: 20 }}>
          {message}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            minHeight: 44,
            minWidth: 44,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: config.borderColor,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 12,
          }}
        >
          <Text style={{ color: color.textWhite, fontSize: 14, fontWeight: "600" }}>再試行</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ネットワークエラー用の特化コンポーネント
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      <MaterialIcons name="wifi-off" size={64} color={color.textSubtle} />
      <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
        接続エラー
      </Text>
      <Text style={{ color: color.textMuted, fontSize: 14, textAlign: "center", marginBottom: 20 }}>
        ネットワーク接続を確認してください
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            minHeight: 48,
            paddingHorizontal: 32,
            paddingVertical: 14,
            backgroundColor: color.hostAccentLegacy,
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="refresh" size={20} color={color.textWhite} />
          <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
            再読み込み
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// 空の状態用コンポーネント
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
      <MaterialIcons name={icon} size={64} color={color.textSubtle} />
      <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ color: color.textMuted, fontSize: 14, textAlign: "center" }}>
        {message}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={{
            marginTop: 20,
            minHeight: 48,
            paddingHorizontal: 24,
            paddingVertical: 14,
            backgroundColor: color.hostAccentLegacy,
            borderRadius: 24,
          }}
        >
          <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "bold" }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
