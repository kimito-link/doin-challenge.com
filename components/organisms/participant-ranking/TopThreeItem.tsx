/**
 * TopThreeItem - トップ3アイテム
 * 
 * 単一責任: トップ3の単一アイテム表示のみ
 */

import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { RANK_COLORS } from "./constants";
import type { TopThreeItemProps } from "./types";

export function TopThreeItem({ participant, rank, isFirst = false }: TopThreeItemProps) {
  const colors = RANK_COLORS[rank];

  return (
    <View style={[styles.topThreeItem, isFirst && styles.topThreeItemFirst]}>
      <View
        style={[
          styles.topThreeBadge,
          isFirst && styles.topThreeBadgeFirst,
          { backgroundColor: colors.bg },
        ]}
      >
        <Text style={[styles.topThreeBadgeText, { color: colors.text }]}>{rank}</Text>
      </View>

      <View style={isFirst ? styles.topThreeAvatarLarge : styles.topThreeAvatarSmall}>
        {participant.profileImage && !participant.isAnonymous ? (
          <Image
            source={{ uri: participant.profileImage }}
            style={isFirst ? styles.topThreeAvatarImgLarge : styles.topThreeAvatarImg}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons
            name="person"
            size={isFirst ? 32 : 24}
            color={color.textSubtle}
          />
        )}
      </View>

      <Text
        style={[styles.topThreeName, isFirst && styles.topThreeNameFirst]}
        numberOfLines={1}
      >
        {participant.isAnonymous ? "匿名" : participant.displayName}
      </Text>

      <Text style={[styles.topThreeScore, isFirst && styles.topThreeScoreFirst]}>
        {participant.contribution}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topThreeItem: {
    alignItems: "center",
    width: 80,
  },
  topThreeItemFirst: {
    width: 100,
    marginBottom: 16,
  },
  topThreeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  topThreeBadgeFirst: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  topThreeBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  topThreeAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  topThreeAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: color.rankGold,
  },
  topThreeAvatarImg: {
    width: 48,
    height: 48,
  },
  topThreeAvatarImgLarge: {
    width: 64,
    height: 64,
  },
  topThreeName: {
    color: color.textWhite,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
  },
  topThreeNameFirst: {
    fontSize: 14,
    fontWeight: "bold",
  },
  topThreeScore: {
    color: color.hostAccentLegacy,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  topThreeScoreFirst: {
    fontSize: 18,
  },
});
