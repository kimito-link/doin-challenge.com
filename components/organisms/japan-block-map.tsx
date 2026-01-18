import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useMemo } from "react";

const screenWidth = Dimensions.get("window").width;

interface JapanBlockMapProps {
  prefectureCounts: { [key: string]: number };
  onPrefecturePress?: (prefecture: string) => void;
  onRegionPress?: (regionName: string, prefectures: string[]) => void;
}

// 地域ごとの色設定
const regionColors = {
  "北海道": { bg: "#4FC3F7", text: "#000" },      // 水色
  "東北": { bg: "#B39DDB", text: "#000" },        // 紫
  "関東": { bg: "#81C784", text: "#000" },        // 緑
  "中部": { bg: "#FFF176", text: "#000" },        // 黄色
  "関西": { bg: "#FFB74D", text: "#000" },        // オレンジ
  "中国・四国": { bg: "#F48FB1", text: "#000" },  // ピンク
  "九州・沖縄": { bg: "#EF5350", text: "#fff" },  // 赤
};

// 地域と都道府県のマッピング
const regions = [
  {
    name: "北海道",
    prefectures: [{ name: "北海道", short: "北海道" }],
  },
  {
    name: "東北",
    prefectures: [
      { name: "青森県", short: "青森" },
      { name: "岩手県", short: "岩手" },
      { name: "秋田県", short: "秋田" },
      { name: "宮城県", short: "宮城" },
      { name: "山形県", short: "山形" },
      { name: "福島県", short: "福島" },
    ],
  },
  {
    name: "関東",
    prefectures: [
      { name: "茨城県", short: "茨城" },
      { name: "栃木県", short: "栃木" },
      { name: "群馬県", short: "群馬" },
      { name: "埼玉県", short: "埼玉" },
      { name: "千葉県", short: "千葉" },
      { name: "東京都", short: "東京" },
      { name: "神奈川県", short: "神奈川" },
    ],
  },
  {
    name: "中部",
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
  },
  {
    name: "関西",
    prefectures: [
      { name: "三重県", short: "三重" },
      { name: "滋賀県", short: "滋賀" },
      { name: "京都府", short: "京都" },
      { name: "大阪府", short: "大阪" },
      { name: "兵庫県", short: "兵庫" },
      { name: "奈良県", short: "奈良" },
      { name: "和歌山県", short: "和歌山" },
    ],
  },
  {
    name: "中国・四国",
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
  },
  {
    name: "九州・沖縄",
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
  },
];

export function JapanBlockMap({ prefectureCounts, onPrefecturePress, onRegionPress }: JapanBlockMapProps) {
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
      totals[region.name] = region.prefectures.reduce((sum, pref) => {
        return sum + (prefectureCounts[pref.name] || prefectureCounts[pref.short] || 0);
      }, 0);
    });
    return totals;
  }, [prefectureCounts]);

  const blockWidth = Math.min((screenWidth - 48) / 7, 50);
  const blockHeight = blockWidth * 1.2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗾 地域別参加者マップ</Text>
        <Text style={styles.subtitle}>合計 {stats.totalParticipants}人</Text>
      </View>

      {/* 地域ごとのブロック表示 */}
      <View style={styles.mapContainer}>
        {regions.map((region) => {
          const color = regionColors[region.name as keyof typeof regionColors];
          const total = regionTotals[region.name];
          const prefectureNames = region.prefectures.map(p => p.name);
          
          return (
            <TouchableOpacity
              key={region.name}
              style={[
                styles.regionBlock,
                { 
                  backgroundColor: color.bg,
                  borderColor: total > 0 ? "#FF6B6B" : "transparent",
                  borderWidth: total > 0 ? 3 : 0,
                }
              ]}
              onPress={() => onRegionPress?.(region.name, prefectureNames)}
              activeOpacity={0.7}
            >
              <Text style={[styles.regionName, { color: color.text }]}>{region.name}</Text>
              <Text style={[styles.regionCount, { color: color.text }]}>
                {total > 0 ? `${total}人` : "-"}
              </Text>
              {total > 0 && (
                <View style={styles.fireIcon}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                </View>
              )}
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

      {/* 凡例 */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>地域カラー</Text>
        <View style={styles.legendItems}>
          {Object.entries(regionColors).map(([name, color]) => (
            <View key={name} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color.bg }]} />
              <Text style={styles.legendText}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E2022",
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
    color: "#ECEDEE",
  },
  subtitle: {
    fontSize: 14,
    color: "#9BA1A6",
  },
  mapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  regionBlock: {
    width: "30%",
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  regionName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  regionCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  fireIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2D3139",
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
    color: "#ECEDEE",
  },
  statLabel: {
    fontSize: 12,
    color: "#9BA1A6",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#9CA3AF",
  },
  hotHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    color: "#FF6B6B",
  },
  hotSubtitle: {
    fontSize: 12,
    color: "#9BA1A6",
  },
  legend: {
    marginTop: 8,
  },
  legendTitle: {
    fontSize: 12,
    color: "#9BA1A6",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: "#9BA1A6",
  },
});
