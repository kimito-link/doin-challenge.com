import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useMemo } from "react";

const screenWidth = Dimensions.get("window").width;

interface JapanDeformedMapProps {
  prefectureCounts: { [key: string]: number };
  onPrefecturePress?: (prefecture: string) => void;
  onRegionPress?: (regionName: string, prefectures: string[]) => void;
}

// 地域ごとの色設定（より鮮やかな色）
const regionColors: { [key: string]: { bg: string; text: string; border: string } } = {
  "北海道": { bg: "#4FC3F7", text: "#000", border: "#0288D1" },
  "東北": { bg: "#B39DDB", text: "#000", border: "#7B1FA2" },
  "関東": { bg: "#81C784", text: "#000", border: "#388E3C" },
  "中部": { bg: "#FFF176", text: "#000", border: "#FBC02D" },
  "関西": { bg: "#FFB74D", text: "#000", border: "#F57C00" },
  "中国": { bg: "#F48FB1", text: "#000", border: "#C2185B" },
  "四国": { bg: "#CE93D8", text: "#000", border: "#8E24AA" },
  "九州": { bg: "#EF5350", text: "#fff", border: "#C62828" },
  "沖縄": { bg: "#FF8A65", text: "#000", border: "#E64A19" },
};

// 47都道府県のデータ（参考画像に近いグリッド配置）
// 横に広がる日本地図の形を再現
const prefectureData: { name: string; short: string; region: string; row: number; col: number }[] = [
  // 北海道（右上）
  { name: "北海道", short: "北海道", region: "北海道", row: 0, col: 10 },
  
  // 東北（右側）
  { name: "青森県", short: "青森", region: "東北", row: 1, col: 10 },
  { name: "秋田県", short: "秋田", region: "東北", row: 2, col: 9 },
  { name: "岩手県", short: "岩手", region: "東北", row: 2, col: 10 },
  { name: "山形県", short: "山形", region: "東北", row: 3, col: 9 },
  { name: "宮城県", short: "宮城", region: "東北", row: 3, col: 10 },
  { name: "福島県", short: "福島", region: "東北", row: 4, col: 9 },
  
  // 関東（右側中央）
  { name: "新潟県", short: "新潟", region: "中部", row: 4, col: 8 },
  { name: "群馬県", short: "群馬", region: "関東", row: 5, col: 8 },
  { name: "栃木県", short: "栃木", region: "関東", row: 5, col: 9 },
  { name: "茨城県", short: "茨城", region: "関東", row: 5, col: 10 },
  { name: "埼玉県", short: "埼玉", region: "関東", row: 6, col: 8 },
  { name: "東京都", short: "東京", region: "関東", row: 6, col: 9 },
  { name: "千葉県", short: "千葉", region: "関東", row: 6, col: 10 },
  { name: "神奈川県", short: "神奈川", region: "関東", row: 7, col: 9 },
  
  // 中部（中央）
  { name: "山梨県", short: "山梨", region: "中部", row: 7, col: 8 },
  { name: "長野県", short: "長野", region: "中部", row: 6, col: 7 },
  { name: "富山県", short: "富山", region: "中部", row: 5, col: 6 },
  { name: "石川県", short: "石川", region: "中部", row: 4, col: 6 },
  { name: "福井県", short: "福井", region: "中部", row: 5, col: 5 },
  { name: "岐阜県", short: "岐阜", region: "中部", row: 6, col: 6 },
  { name: "静岡県", short: "静岡", region: "中部", row: 7, col: 7 },
  { name: "愛知県", short: "愛知", region: "中部", row: 7, col: 6 },
  
  // 関西（中央左）
  { name: "三重県", short: "三重", region: "関西", row: 7, col: 5 },
  { name: "滋賀県", short: "滋賀", region: "関西", row: 6, col: 5 },
  { name: "京都府", short: "京都", region: "関西", row: 6, col: 4 },
  { name: "大阪府", short: "大阪", region: "関西", row: 7, col: 4 },
  { name: "兵庫県", short: "兵庫", region: "関西", row: 7, col: 3 },
  { name: "奈良県", short: "奈良", region: "関西", row: 8, col: 4 },
  { name: "和歌山県", short: "和歌山", region: "関西", row: 8, col: 5 },
  
  // 中国（左側）
  { name: "鳥取県", short: "鳥取", region: "中国", row: 6, col: 3 },
  { name: "島根県", short: "島根", region: "中国", row: 6, col: 2 },
  { name: "岡山県", short: "岡山", region: "中国", row: 7, col: 2 },
  { name: "広島県", short: "広島", region: "中国", row: 8, col: 2 },
  { name: "山口県", short: "山口", region: "中国", row: 8, col: 1 },
  
  // 四国（左下）
  { name: "徳島県", short: "徳島", region: "四国", row: 8, col: 3 },
  { name: "香川県", short: "香川", region: "四国", row: 9, col: 3 },
  { name: "愛媛県", short: "愛媛", region: "四国", row: 9, col: 2 },
  { name: "高知県", short: "高知", region: "四国", row: 10, col: 2 },
  
  // 九州（左下）
  { name: "福岡県", short: "福岡", region: "九州", row: 9, col: 1 },
  { name: "佐賀県", short: "佐賀", region: "九州", row: 10, col: 1 },
  { name: "長崎県", short: "長崎", region: "九州", row: 10, col: 0 },
  { name: "熊本県", short: "熊本", region: "九州", row: 11, col: 1 },
  { name: "大分県", short: "大分", region: "九州", row: 9, col: 0 },
  { name: "宮崎県", short: "宮崎", region: "九州", row: 11, col: 0 },
  { name: "鹿児島県", short: "鹿児島", region: "九州", row: 12, col: 1 },
  
  // 沖縄（最下部）
  { name: "沖縄県", short: "沖縄", region: "沖縄", row: 12, col: 0 },
];

// 参加者数に応じた色の濃さを計算
function getHeatColor(count: number, maxCount: number, baseColor: { bg: string; text: string; border: string }) {
  if (count === 0) {
    return { bg: baseColor.bg, text: baseColor.text, border: baseColor.border, hasParticipants: false };
  }
  
  // 参加者がいる場合は赤系の色に
  const intensity = Math.min(count / Math.max(maxCount, 10), 1);
  
  if (intensity > 0.7) {
    return { bg: "#D32F2F", text: "#fff", border: "#B71C1C", hasParticipants: true };
  } else if (intensity > 0.4) {
    return { bg: "#F44336", text: "#fff", border: "#D32F2F", hasParticipants: true };
  } else if (intensity > 0.1) {
    return { bg: "#FF5722", text: "#fff", border: "#E64A19", hasParticipants: true };
  }
  
  return { bg: "#FF7043", text: "#fff", border: "#F4511E", hasParticipants: true };
}

export function JapanDeformedMap({ prefectureCounts, onPrefecturePress, onRegionPress }: JapanDeformedMapProps) {
  // 統計情報を計算
  const stats = useMemo(() => {
    const totalPrefectures = Object.keys(prefectureCounts).filter(k => prefectureCounts[k] > 0).length;
    const totalParticipants = Object.values(prefectureCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(prefectureCounts), 0);
    const hotPrefecture = Object.entries(prefectureCounts).find(([_, count]) => count === maxCount)?.[0] || "";
    
    return { totalPrefectures, totalParticipants, maxCount, hotPrefecture };
  }, [prefectureCounts]);

  // グリッドの範囲を計算
  const gridBounds = useMemo(() => {
    const rows = prefectureData.map(p => p.row);
    const cols = prefectureData.map(p => p.col);
    return {
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols),
    };
  }, []);

  // セルサイズを画面幅に合わせて計算（より大きく）
  const numCols = gridBounds.maxCol - gridBounds.minCol + 1;
  const cellSize = Math.floor((screenWidth - 48) / numCols);
  const mapHeight = (gridBounds.maxRow - gridBounds.minRow + 1) * (cellSize + 2) + 20;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗾 地域別参加者マップ</Text>
        <Text style={styles.subtitle}>合計 {stats.totalParticipants}人</Text>
      </View>

      {/* デフォルメ日本地図 */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {prefectureData.map((pref) => {
          const count = prefectureCounts[pref.name] || prefectureCounts[pref.short] || 0;
          const baseColor = regionColors[pref.region] || regionColors["関東"];
          const color = getHeatColor(count, stats.maxCount, baseColor);
          
          const top = (pref.row - gridBounds.minRow) * (cellSize + 2);
          const left = (pref.col - gridBounds.minCol) * (cellSize + 2);
          
          // 都道府県名を短縮（2文字以内）
          let displayName = pref.short.replace("県", "").replace("府", "").replace("都", "");
          if (displayName === "北海道") displayName = "北海";
          if (displayName === "神奈川") displayName = "神奈";
          if (displayName === "和歌山") displayName = "和歌";
          if (displayName === "鹿児島") displayName = "鹿児";
          
          return (
            <TouchableOpacity
              key={pref.name}
              style={[
                styles.prefectureCell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: color.bg,
                  borderColor: color.hasParticipants ? "#FFFFFF" : color.border,
                  borderWidth: color.hasParticipants ? 2 : 1,
                  position: "absolute",
                  top,
                  left,
                  shadowColor: color.hasParticipants ? "#FF0000" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: color.hasParticipants ? 0.8 : 0,
                  shadowRadius: 4,
                  elevation: color.hasParticipants ? 5 : 0,
                }
              ]}
              onPress={() => onPrefecturePress?.(pref.name)}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.prefectureName, 
                  { 
                    color: color.text, 
                    fontSize: cellSize < 30 ? 8 : cellSize < 35 ? 9 : 10,
                    fontWeight: color.hasParticipants ? "bold" : "600",
                  }
                ]} 
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {count > 0 && (
                <Text 
                  style={[
                    styles.prefectureCount, 
                    { 
                      color: color.text, 
                      fontSize: cellSize < 30 ? 9 : cellSize < 35 ? 10 : 12,
                      fontWeight: "bold",
                    }
                  ]}
                >
                  {count}
                </Text>
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
    position: "relative",
    marginBottom: 16,
  },
  prefectureCell: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
  },
  prefectureName: {
    textAlign: "center",
  },
  prefectureCount: {
    marginTop: -2,
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
    backgroundColor: "#4B5563",
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
