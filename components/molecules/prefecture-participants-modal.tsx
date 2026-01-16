import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OptimizedAvatar } from "./optimized-image";

interface Participant {
  id: number;
  userId: number | null;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  message: string | null;
  companionCount: number;
  contribution: number;
  prefecture: string | null;
  isAnonymous: boolean;
  followersCount?: number | null;
}

interface PrefectureParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  prefectureName: string;
  participants: Participant[];
}

export function PrefectureParticipantsModal({
  visible,
  onClose,
  prefectureName,
  participants,
}: PrefectureParticipantsModalProps) {
  const router = useRouter();

  const handleParticipantPress = (participant: Participant) => {
    if (participant.userId && !participant.isAnonymous) {
      onClose();
      router.push({ pathname: "/profile/[userId]", params: { userId: participant.userId.toString() } });
    }
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <Pressable
      onPress={() => handleParticipantPress(item)}
      style={({ pressed }) => [
        styles.participantItem,
        pressed && item.userId && !item.isAnonymous ? styles.participantItemPressed : undefined,
      ]}
    >
      <OptimizedAvatar
        source={item.profileImage ? { uri: item.profileImage } : undefined}
        size={44}
        fallbackColor="#EC4899"
        fallbackText={item.displayName.charAt(0)}
      />
      <View style={styles.participantInfo}>
        <View style={styles.participantNameRow}>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.isAnonymous ? "匿名ユーザー" : item.displayName}
          </Text>
          {item.followersCount && item.followersCount > 0 && (
            <View style={styles.followersBadge}>
              <Text style={styles.followersText}>
                {item.followersCount >= 10000
                  ? `${(item.followersCount / 10000).toFixed(1)}万`
                  : item.followersCount.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
        {item.username && !item.isAnonymous && (
          <Text style={styles.participantUsername}>@{item.username}</Text>
        )}
        {item.message && (
          <Text style={styles.participantMessage} numberOfLines={2}>
            {item.message}
          </Text>
        )}
      </View>
      <View style={styles.contributionBadge}>
        <Text style={styles.contributionText}>{item.contribution || 1}人</Text>
      </View>
    </Pressable>
  );

  const totalContribution = participants.reduce((sum, p) => sum + (p.contribution || 1), 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.prefectureName}>{prefectureName}</Text>
              <Text style={styles.participantCount}>
                {participants.length}人が参加（計{totalContribution}人）
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* 参加者リスト */}
          {participants.length > 0 ? (
            <FlatList
              data={participants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderParticipant}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗾</Text>
              <Text style={styles.emptyText}>
                この都道府県からの参加者はまだいません
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1A1D21",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: "40%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  headerContent: {
    flex: 1,
  },
  prefectureName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  participantCount: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#2D3139",
  },
  listContent: {
    padding: 16,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  participantItemPressed: {
    opacity: 0.7,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  followersBadge: {
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  followersText: {
    color: "#EC4899",
    fontSize: 10,
    fontWeight: "bold",
  },
  participantUsername: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  participantMessage: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  contributionBadge: {
    backgroundColor: "#2D3139",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  contributionText: {
    color: "#EC4899",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
});
