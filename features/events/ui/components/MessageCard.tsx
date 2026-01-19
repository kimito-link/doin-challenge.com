// features/events/ui/components/MessageCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import type { FanVM } from "../../mappers/participationVM";

export type MessageVM = {
  id: string;
  twitterId?: string | null;
  displayName: string;
  username?: string | null;
  profileImage?: string | null;
  message: string;
  createdAtText?: string; // "1時間前" 等
};

export type MessageCardProps = {
  message: MessageVM;
  onPressFan?: (fan: FanVM) => void;
};

export function MessageCard(props: MessageCardProps) {
  const { message, onPressFan } = props;
  const colors = useColors();

  const canOpenFan = !!onPressFan && !!message.twitterId;

  const fan: FanVM | null = message.twitterId
    ? {
        twitterId: message.twitterId,
        username: message.username ?? null,
        displayName: message.displayName,
        profileImage: message.profileImage ?? null,
      }
    : null;

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {/* ヘッダー */}
      <View style={styles.header}>
        {message.profileImage ? (
          <Image 
            source={{ uri: message.profileImage }} 
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { borderColor: colors.border }]} />
        )}

        <TouchableOpacity 
          disabled={!canOpenFan} 
          onPress={() => fan && onPressFan?.(fan)} 
          style={styles.userInfo}
          activeOpacity={canOpenFan ? 0.7 : 1}
        >
          <Text style={[styles.displayName, { color: colors.foreground }]}>
            {message.displayName}
          </Text>
          {!!message.username && (
            <Text style={[styles.username, { color: colors.muted }]}>
              @{message.username}
            </Text>
          )}
          {!!message.createdAtText && (
            <Text style={[styles.timestamp, { color: colors.muted }]}>
              {message.createdAtText}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* メッセージ本文 */}
      <Text style={[styles.messageText, { color: colors.foreground }]}>
        {message.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  userInfo: {
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
  timestamp: {
    marginTop: 2,
    fontSize: 11,
  },
  messageText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
});
