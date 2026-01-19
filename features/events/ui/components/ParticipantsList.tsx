// features/events/ui/components/ParticipantsList.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import type { ParticipationVM, FanVM } from "../../mappers/participationVM";

export type ParticipantsListProps = {
  participants: ParticipationVM[];
  onPressFan: (fan: FanVM) => void;
  onPressDelete?: (p: ParticipationVM) => void;
  showPrefecture?: boolean;
  maxItems?: number;
};

export function ParticipantsList(props: ParticipantsListProps) {
  const { 
    participants, 
    onPressFan, 
    onPressDelete, 
    showPrefecture = true,
    maxItems 
  } = props;
  const colors = useColors();

  if (!participants.length) {
    return (
      <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          参加者はまだいません
        </Text>
      </View>
    );
  }

  const displayParticipants = maxItems 
    ? participants.slice(0, maxItems) 
    : participants;

  return (
    <View style={styles.container}>
      {displayParticipants.map((p) => {
        const fan: FanVM = {
          twitterId: p.twitterId,
          username: p.username,
          displayName: p.displayName,
          profileImage: p.profileImage,
        };

        return (
          <View
            key={p.id}
            style={[
              styles.card,
              { 
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }
            ]}
          >
            {/* アバター */}
            {p.profileImage ? (
              <Image 
                source={{ uri: p.profileImage }} 
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderColor: colors.border }]} />
            )}

            {/* コンテンツ */}
            <TouchableOpacity 
              style={styles.content} 
              onPress={() => onPressFan(fan)}
              activeOpacity={0.7}
            >
              <Text style={[styles.displayName, { color: colors.foreground }]}>
                {p.displayName}
              </Text>
              {!!p.username && (
                <Text style={[styles.username, { color: colors.muted }]}>
                  @{p.username}
                </Text>
              )}
              {showPrefecture && !!p.prefecture && (
                <Text style={[styles.prefecture, { color: colors.muted }]}>
                  {p.prefecture}
                </Text>
              )}
              {!!p.message && (
                <Text 
                  style={[styles.message, { color: colors.foreground }]} 
                  numberOfLines={2}
                >
                  {p.message}
                </Text>
              )}
            </TouchableOpacity>

            {/* 削除ボタン */}
            {!!onPressDelete && (
              <TouchableOpacity 
                onPress={() => onPressDelete(p)} 
                style={[styles.deleteButton, { borderColor: colors.error }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteText, { color: colors.error }]}>
                  削除
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      
      {maxItems && participants.length > maxItems && (
        <Text style={[styles.moreText, { color: colors.muted }]}>
          他 {participants.length - maxItems} 人
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  emptyContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "700",
  },
  username: {
    marginTop: 2,
    fontSize: 12,
  },
  prefecture: {
    marginTop: 2,
    fontSize: 12,
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  deleteText: {
    fontSize: 12,
  },
  moreText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
  },
});
