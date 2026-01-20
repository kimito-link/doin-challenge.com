import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, ScrollView, Pressable } from "react-native";
import { color } from "@/theme/tokens";
import { useMemo, useState, useEffect } from "react";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface JapanRegionBlocksProps {
  prefectureCounts: { [key: string]: number };
  onPrefecturePress?: (prefecture: string) => void;
  onRegionPress?: (regionName: string, prefectures: string[]) => void;
  userPrefecture?: string; // ユーザーの都道府県（強調表示用）
}

// 地域データ（6ブロック）
const regions = [
  {
    id: "hokkaido-tohoku",
    name: "北海道・東北",
    shortName: "北海道\n東北",
    emoji: "🏔️",
    prefectures: [
      { name: "北海道", short: "北海道" },
      { name: "青森県", short: "青森" },
      { name: "岩手県", short: "岩手" },
      { name: "宮城県", short: "宮城" },
      { name: "秋田県", short: "秋田" },
      { name: "山形県", short: "山形" },
      { name: "福島県", short: "福島" },
    ],
    color: color.regionHokkaido,
    borderColor: color.borderHokkaido,
  },
  {
    id: "kanto",
    name: "関東",
    shortName: "関東",
    emoji: "🗼",
    prefectures: [
      { name: "茨城県", short: "茨城" },
      { name: "栃木県", short: "栃木" },
      { name: "群馬県", short: "群馬" },
      { name: "埼玉県", short: "埼玉" },
      { name: "千葉県", short: "千葉" },
      { name: "東京都", short: "東京" },
      { name: "神奈川県", short: "神奈川" },
    ],
    color: color.regionKanto,
    borderColor: color.borderKanto,
  },
  {
    id: "chubu",
    name: "中部",
    shortName: "中部",
    emoji: "⛰️",
    prefectures: [
      { name: "新潟県", short: "新潟" },
      { name: "富山県", short: "富山" },
      { name: "石川県", short: "石川" },
      { name: "福井県", short: "福井" },
      { name: "山梨県", short: "山梨" },
      { name: "長野県", short: "長野" },
      { name: "岐阜県", short: "岐阜" },
      { name: "静岡県", short: "静岡" },
      { name: "愛知県", short: "愛知" },
    ],
    color: color.regionChubu,
    borderColor: color.borderChubu,
  },
  {
    id: "kansai",
    name: "関西",
    shortName: "関西",
    emoji: "🏯",
    prefectures: [
      { name: "三重県", short: "三重" },
      { name: "滋賀県", short: "滋賀" },
      { name: "京都府", short: "京都" },
      { name: "大阪府", short: "大阪" },
      { name: "兵庫県", short: "兵庫" },
      { name: "奈良県", short: "奈良" },
      { name: "和歌山県", short: "和歌山" },
    ],
    color: color.regionKansai,
    borderColor: color.borderKansai,
  },
  {
    id: "chugoku-shikoku",
    name: "中国・四国",
    shortName: "中国\n四国",
    emoji: "🌊",
    prefectures: [
      { name: "鳥取県", short: "鳥取" },
      { name: "島根県", short: "島根" },
      { name: "岡山県", short: "岡山" },
      { name: "広島県", short: "広島" },
      { name: "山口県", short: "山口" },
      { name: "徳島県", short: "徳島" },
      { name: "香川県", short: "香川" },
      { name: "愛媛県", short: "愛媛" },
      { name: "高知県", short: "高知" },
    ],
    color: color.regionChugokuShikoku,
    borderColor: color.borderChugoku,
  },
  {
    id: "kyushu-okinawa",
    name: "九州・沖縄",
    shortName: "九州\n沖縄",
    emoji: "🌴",
    prefectures: [
      { name: "福岡県", short: "福岡" },
      { name: "佐賀県", short: "佐賀" },
      { name: "長崎県", short: "長崎" },
      { name: "熊本県", short: "熊本" },
      { name: "大分県", short: "大分" },
      { name: "宮崎県", short: "宮崎" },
      { name: "鹿児島県", short: "鹿児島" },
      { name: "沖縄県", short: "沖縄" },
    ],
    color: color.regionKyushuOkinawa,
    borderColor: color.borderKyushu,
  },
];

// 参加者数に応じたアイコン
function getParticipantIcon(count: number): string {
  if (count === 0) return "";
  if (count <= 5) return "🔥";
  if (count <= 20) return "🔥🔥";
  return "🔥🔥🔥";
}

// ヒートマップ色の段階（参加者数に応じて色の濃淡を変化）
type HeatLevel = 0 | 1 | 2 | 3 | 4 | 5;

function getHeatLevel(count: number, maxCount: number): HeatLevel {
  if (count === 0) return 0;
  if (maxCount === 0) return 1;
  
  const ratio = count / maxCount;
  if (ratio <= 0.2) return 1; // 少ない
  if (ratio <= 0.4) return 2; // やや少ない
  if (ratio <= 0.6) return 3; // 中程度
  if (ratio <= 0.8) return 4; // 多い
  return 5; // 最多
}

// ヒートレベルに応じた色の不透明度を返す
function getHeatOpacity(level: HeatLevel): number {
  switch (level) {
    case 0: return 0.3;  // グレー
    case 1: return 0.5;  // 薄い
    case 2: return 0.65; // やや薄い
    case 3: return 0.8;  // 中程度
    case 4: return 0.9;  // 濃い
    case 5: return 1.0;  // 最も濃い
  }
}

// ヒートレベルに応じたボーダー幅を返す
function getHeatBorderWidth(level: HeatLevel): number {
  switch (level) {
    case 0: return 1;
    case 1: return 2;
    case 2: return 2;
    case 3: return 3;
    case 4: return 3;
    case 5: return 4;
  }
}

export function JapanRegionBlocks({ prefectureCounts, onPrefecturePress, onRegionPress, userPrefecture }: JapanRegionBlocksProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedRegion, setSelectedRegion] = useState<typeof regions[0] | null>(null);
  
  // ユーザーの地域を特定
  const userRegionId = useMemo(() => {
    if (!userPrefecture) return null;
    for (const region of regions) {
      if (region.prefectures.some(p => p.name === userPrefecture || p.short === userPrefecture)) {
        return region.id;
      }
    }
    return null;
  }, [userPrefecture]);
  
  // パルスアニメーション用の値
  const pulseScale = useSharedValue(1);
  
  // ユーザーの地域がある場合、パルスアニメーションを開始
  useEffect(() => {
    if (userRegionId) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // 無限リピート
        true
      );
    }
  }, [userRegionId]);
  
  // パルスアニメーションスタイル
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // 統計情報を計算
  const stats = useMemo(() => {
    const totalPrefectures = Object.keys(prefectureCounts).filter(k => prefectureCounts[k] > 0).length;
    const totalParticipants = Object.values(prefectureCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(prefectureCounts), 0);
    const hotPrefecture = Object.entries(prefectureCounts).find(([_, count]) => count === maxCount)?.[0] || "";
    
    return { totalPrefectures, totalParticipants, maxCount, hotPrefecture };
  }, [prefectureCounts]);

  // 地域ごとの合計を計算
  const regionTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    regions.forEach(region => {
      totals[region.id] = region.prefectures.reduce((sum, pref) => {
        return sum + (prefectureCounts[pref.name] || prefectureCounts[pref.short] || 0);
      }, 0);
    });
    return totals;
  }, [prefectureCounts]);
  
  // 地域ごとの最大参加者数（ヒートマップ計算用）
  const maxRegionCount = useMemo(() => {
    return Math.max(...Object.values(regionTotals), 0);
  }, [regionTotals]);
  
  // 地域ランキング（参加者数の多い順）
  const regionRanking = useMemo(() => {
    return regions
      .map(region => ({
        ...region,
        total: regionTotals[region.id] || 0,
      }))
      .filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [regionTotals]);

  // レスポンシブ設定
  const isSmallScreen = screenWidth < 375;
  const blockSize = Math.floor((screenWidth - 48) / 3) - 8;
  const minBlockSize = 100;
  const actualBlockSize = Math.max(blockSize, minBlockSize);

  // 都道府県詳細モーダルを開く
  const handleRegionPress = (region: typeof regions[0]) => {
    setSelectedRegion(region);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setSelectedRegion(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗾 地域別参加者マップ</Text>
      </View>
      
      {/* 合計人数のメッセージ化 */}
      <View style={styles.totalMessage}>
        <Text style={styles.totalMessageText}>
          全国から <Text style={styles.totalMessageCount}>{stats.totalParticipants}人</Text> が参加中
        </Text>
        {stats.totalParticipants < 10 && (
          <Text style={styles.totalMessageSub}>まだ少ない今がチャンス！</Text>
        )}
      </View>

      {/* 6地域ブロック（2列×3行） */}
      <View style={styles.gridContainer}>
        {regions.map((region) => {
          const total = regionTotals[region.id];
          const hasParticipants = total > 0;
          const fireIcon = getParticipantIcon(total);
          const isUserRegion = region.id === userRegionId;
          
          // ヒートマップ色の計算
          const heatLevel = getHeatLevel(total, maxRegionCount);
          const heatOpacity = getHeatOpacity(heatLevel);
          const heatBorderWidth = getHeatBorderWidth(heatLevel);
          
          const blockContent = (
            <>
              {isUserRegion && (
                <View style={styles.userRegionBadge}>
                  <Text style={styles.userRegionBadgeText}>あなたの地域</Text>
                </View>
              )}
              {/* ヒートレベルインジケーター（最多の場合のみ表示） */}
              {heatLevel === 5 && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>HOT</Text>
                </View>
              )}
              <Text style={styles.regionEmoji}>{region.emoji}</Text>
              <Text style={[
                styles.regionName,
                { color: hasParticipants ? color.textWhite : color.textMuted }
              ]}>
                {region.shortName}
              </Text>
              <Text style={[
                styles.regionCount,
                { color: hasParticipants ? color.textWhite : color.textMuted }
              ]}>
                {total > 0 ? `${total}人` : "-"}
              </Text>
              {fireIcon && (
                <Text style={styles.fireIcon}>{fireIcon}</Text>
              )}
            </>
          );
          
          // ユーザーの地域はアニメーション付き
          if (isUserRegion) {
            return (
              <Animated.View key={region.id} style={pulseAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.regionBlock,
                    styles.userRegionBlock,
                    {
                      width: actualBlockSize,
                      height: actualBlockSize,
                      backgroundColor: region.color,
                      borderColor: color.accentPrimary,
                      borderWidth: 4,
                      opacity: heatOpacity,
                    },
                  ]}
                  onPress={() => handleRegionPress(region)}
                  activeOpacity={0.7}
                >
                  {blockContent}
                </TouchableOpacity>
              </Animated.View>
            );
          }
          
          return (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionBlock,
                {
                  width: actualBlockSize,
                  height: actualBlockSize,
                  backgroundColor: hasParticipants ? region.color : color.mapInactive,
                  borderColor: hasParticipants ? region.borderColor : color.border,
                  borderWidth: heatBorderWidth,
                  opacity: heatOpacity,
                },
              ]}
              onPress={() => handleRegionPress(region)}
              activeOpacity={0.7}
            >
              {blockContent}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 統計サマリー */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalPrefectures}</Text>
          <Text style={styles.statLabel}>都道府県</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalParticipants}</Text>
          <Text style={styles.statLabel}>総参加者</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.maxCount}</Text>
          <Text style={styles.statLabel}>最多</Text>
        </View>
      </View>

      {/* ヒートマップ凡例 */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>色の濃さ = 参加者数</Text>
        <View style={styles.legendBar}>
          <View style={[styles.legendSegment, { backgroundColor: color.mapInactive, opacity: 0.3 }]} />
          <View style={[styles.legendSegment, { backgroundColor: color.accentPrimary, opacity: 0.5 }]} />
          <View style={[styles.legendSegment, { backgroundColor: color.accentPrimary, opacity: 0.65 }]} />
          <View style={[styles.legendSegment, { backgroundColor: color.accentPrimary, opacity: 0.8 }]} />
          <View style={[styles.legendSegment, { backgroundColor: color.accentPrimary, opacity: 0.9 }]} />
          <View style={[styles.legendSegment, { backgroundColor: color.accentPrimary, opacity: 1.0 }]} />
        </View>
        <View style={styles.legendLabels}>
          <Text style={styles.legendLabel}>少</Text>
          <Text style={styles.legendLabel}>多</Text>
        </View>
      </View>

      {/* 地域ランキング */}
      {regionRanking.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏆 地域ランキング</Text>
          {regionRanking.map((region, index) => {
            const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
            const isUserRegion = region.id === userRegionId;
            const barWidth = maxRegionCount > 0 ? (region.total / maxRegionCount) * 100 : 0;
            
            return (
              <View key={region.id} style={[
                styles.rankingItem,
                isUserRegion && styles.rankingItemHighlight
              ]}>
                <View style={styles.rankingLeft}>
                  <Text style={styles.rankingRank}>{rankEmoji}</Text>
                  <Text style={styles.rankingEmoji}>{region.emoji}</Text>
                  <Text style={[
                    styles.rankingName,
                    isUserRegion && styles.rankingNameHighlight
                  ]}>
                    {region.shortName}
                  </Text>
                </View>
                <View style={styles.rankingRight}>
                  <View style={styles.rankingBarContainer}>
                    <View style={[
                      styles.rankingBar,
                      { 
                        width: `${barWidth}%`,
                        backgroundColor: region.color,
                      }
                    ]} />
                  </View>
                  <Text style={styles.rankingCount}>{region.total}人</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 熱い地域ハイライト */}
      {stats.hotPrefecture && stats.maxCount > 0 && (
        <View style={styles.hotHighlight}>
          <Text style={styles.hotIcon}>🔥</Text>
          <View>
            <Text style={styles.hotTitle}>{stats.hotPrefecture}が熱い！</Text>
            <Text style={styles.hotSubtitle}>{stats.maxCount}人が参加表明中</Text>
          </View>
        </View>
      )}

      {/* 地域タップで都道府県詳細モーダル */}
      <Modal
        visible={selectedRegion !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View 
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={styles.modalContent}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {selectedRegion && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalEmoji}>{selectedRegion.emoji}</Text>
                    <Text style={styles.modalTitle}>{selectedRegion.name}</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalSubtitle}>
                    合計 {regionTotals[selectedRegion.id]}人
                  </Text>

                  <ScrollView style={styles.prefectureList}>
                    {selectedRegion.prefectures.map((pref) => {
                      const count = prefectureCounts[pref.name] || prefectureCounts[pref.short] || 0;
                      const hasParticipants = count > 0;
                      
                      return (
                        <TouchableOpacity
                          key={pref.name}
                          style={[
                            styles.prefectureItem,
                            { backgroundColor: hasParticipants ? selectedRegion.color : color.surface }
                          ]}
                          onPress={() => {
                            closeModal();
                            onPrefecturePress?.(pref.name);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.prefectureName,
                            { color: hasParticipants ? color.textWhite : color.textPrimary }
                          ]}>
                            {pref.short}
                          </Text>
                          <View style={styles.prefectureCountContainer}>
                            {hasParticipants ? (
                              <Text style={styles.prefectureFire}>🔥</Text>
                            ) : (
                              <Text style={styles.prefectureWaiting}>😐</Text>
                            )}
                            <Text style={[
                              styles.prefectureCount,
                              { color: hasParticipants ? color.textWhite : color.textMuted }
                            ]}>
                              {count > 0 ? `${count}人` : "待機中"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: selectedRegion.color }]}
                    onPress={() => {
                      closeModal();
                      onRegionPress?.(selectedRegion.name, selectedRegion.prefectures.map(p => p.name));
                    }}
                  >
                    <Text style={styles.viewAllButtonText}>
                      {selectedRegion.name}の参加者を見る
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: color.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: color.textSecondary,
  },
  totalMessage: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  totalMessageText: {
    fontSize: 16,
    color: color.textSecondary,
  },
  totalMessageCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: color.accentPrimary,
  },
  totalMessageSub: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  regionBlock: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    shadowColor: color.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userRegionBlock: {
    shadowColor: color.accentPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  userRegionBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: color.accentPrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userRegionBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: color.textWhite,
  },
  hotBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: color.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: color.textWhite,
  },
  regionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  regionName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 18,
  },
  regionCount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  fireIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: color.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: color.textSubtle,
  },
  legendContainer: {
    backgroundColor: color.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 12,
    color: color.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  legendBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  legendSegment: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: color.textMuted,
  },
  rankingContainer: {
    backgroundColor: color.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textPrimary,
    marginBottom: 12,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: color.surfaceAlt,
  },
  rankingItemHighlight: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  rankingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankingRank: {
    fontSize: 16,
    width: 28,
    textAlign: "center",
  },
  rankingEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  rankingName: {
    fontSize: 14,
    color: color.textPrimary,
  },
  rankingNameHighlight: {
    fontWeight: "bold",
    color: color.accentPrimary,
  },
  rankingRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  rankingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: color.surfaceAlt,
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  rankingBar: {
    height: "100%",
    borderRadius: 4,
  },
  rankingCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textPrimary,
    width: 50,
    textAlign: "right",
  },
  hotHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  hotIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  hotTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.coral,
  },
  hotSubtitle: {
    fontSize: 12,
    color: color.textSecondary,
  },
  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: color.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: color.textSecondary,
  },
  modalSubtitle: {
    fontSize: 16,
    color: color.textSecondary,
    marginBottom: 16,
  },
  prefectureList: {
    maxHeight: 300,
  },
  prefectureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  prefectureName: {
    fontSize: 16,
    fontWeight: "600",
  },
  prefectureCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prefectureFire: {
    fontSize: 14,
  },
  prefectureWaiting: {
    fontSize: 14,
  },
  prefectureCount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewAllButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  viewAllButtonText: {
    color: color.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
});
