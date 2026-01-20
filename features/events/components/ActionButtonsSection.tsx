import { View, Text, TouchableOpacity, StyleSheet, Share, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

export type ActionButtonsSectionProps = {
  isParticipating: boolean;
  isHost: boolean;
  challengeTitle: string;
  shareUrl: string;
  onParticipate: () => void;
  onInvite: () => void;
  onShare: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ActionButtonsSection({
  isParticipating,
  isHost,
  challengeTitle,
  shareUrl,
  onParticipate,
  onInvite,
  onShare,
  onEdit,
  onDelete,
}: ActionButtonsSectionProps) {
  const colors = useColors();

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({
        message: `${challengeTitle}に参加しよう！\n${shareUrl}`,
        url: shareUrl,
      });
      onShare();
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleParticipate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onParticipate();
  };

  const handleInvite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onInvite();
  };

  return (
    <View style={styles.container}>
      {/* メインアクションボタン */}
      {!isParticipating ? (
        <TouchableOpacity
          onPress={handleParticipate}
          activeOpacity={0.8}
          style={styles.mainButtonWrapper}
        >
          <LinearGradient
            colors={[color.accentPrimary, color.accentAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainButton}
          >
            <MaterialIcons name="how-to-reg" size={24} color={color.textWhite} />
            <Text style={styles.mainButtonText}>参加表明する</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.participatingBadge}>
          <MaterialIcons name="check-circle" size={20} color={color.success} />
          <Text style={[styles.participatingText, { color: color.success }]}>
            参加表明済み
          </Text>
        </View>
      )}

      {/* サブアクションボタン */}
      <View style={styles.subButtons}>
        <TouchableOpacity
          onPress={handleInvite}
          style={[styles.subButton, { backgroundColor: color.surface }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="person-add" size={20} color={color.accentPrimary} />
          <Text style={[styles.subButtonText, { color: colors.foreground }]}>
            友達を招待
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.subButton, { backgroundColor: color.surface }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="share" size={20} color={color.accentPrimary} />
          <Text style={[styles.subButtonText, { color: colors.foreground }]}>
            シェア
          </Text>
        </TouchableOpacity>
      </View>

      {/* 主催者用ボタン */}
      {isHost && (
        <View style={styles.hostButtons}>
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.hostButton, { backgroundColor: color.surface }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={18} color={color.textSecondary} />
            <Text style={styles.hostButtonText}>編集</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={[styles.hostButton, { backgroundColor: color.surface }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete" size={18} color={color.danger} />
            <Text style={[styles.hostButtonText, { color: color.danger }]}>削除</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  mainButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  mainButtonText: {
    color: color.textWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  participatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.success + "20",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  participatingText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subButtons: {
    flexDirection: "row",
    gap: 12,
  },
  subButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: color.border,
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hostButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  hostButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: color.border,
  },
  hostButtonText: {
    fontSize: 13,
    color: color.textSecondary,
  },
});
