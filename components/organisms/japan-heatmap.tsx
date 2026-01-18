import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import { useMemo } from "react";
import * as Haptics from "expo-haptics";
import { prefecturesData, prefectureNameToCode } from "@/lib/prefecture-paths";

const screenWidth = Dimensions.get("window").width;

// 地域グループ定義
const regionGroups = [
  { name: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { name: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { name: "関西", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国・四国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

// 都道府県のラベル位置（中心座標）
const prefectureLabelPositions: { [code: number]: { x: number; y: number } } = {
  1: { x: 720, y: 140 },   // 北海道
  2: { x: 680, y: 330 },   // 青森
  3: { x: 710, y: 400 },   // 岩手
  4: { x: 695, y: 480 },   // 宮城
  5: { x: 660, y: 400 },   // 秋田
  6: { x: 665, y: 470 },   // 山形
  7: { x: 670, y: 530 },   // 福島
  8: { x: 680, y: 590 },   // 茨城
  9: { x: 650, y: 560 },   // 栃木
  10: { x: 620, y: 570 },  // 群馬
  11: { x: 650, y: 610 },  // 埼玉
  12: { x: 700, y: 630 },  // 千葉
  13: { x: 670, y: 640 },  // 東京
  14: { x: 670, y: 670 },  // 神奈川
  15: { x: 570, y: 500 },  // 新潟
  16: { x: 510, y: 530 },  // 富山
  17: { x: 480, y: 560 },  // 石川
  18: { x: 460, y: 600 },  // 福井
  19: { x: 590, y: 620 },  // 山梨
  20: { x: 560, y: 580 },  // 長野
  21: { x: 520, y: 610 },  // 岐阜
  22: { x: 580, y: 670 },  // 静岡
  23: { x: 520, y: 660 },  // 愛知
  24: { x: 480, y: 660 },  // 三重
  25: { x: 460, y: 620 },  // 滋賀
  26: { x: 430, y: 610 },  // 京都
  27: { x: 420, y: 660 },  // 大阪
  28: { x: 380, y: 640 },  // 兵庫
  29: { x: 450, y: 680 },  // 奈良
  30: { x: 420, y: 720 },  // 和歌山
  31: { x: 340, y: 590 },  // 鳥取
  32: { x: 290, y: 610 },  // 島根
  33: { x: 360, y: 640 },  // 岡山
  34: { x: 310, y: 660 },  // 広島
  35: { x: 250, y: 680 },  // 山口
  36: { x: 400, y: 730 },  // 徳島
  37: { x: 370, y: 700 },  // 香川
  38: { x: 330, y: 740 },  // 愛媛
  39: { x: 360, y: 770 },  // 高知
  40: { x: 220, y: 700 },  // 福岡
  41: { x: 190, y: 720 },  // 佐賀
  42: { x: 160, y: 740 },  // 長崎
  43: { x: 200, y: 770 },  // 熊本
  44: { x: 240, y: 740 },  // 大分
  45: { x: 220, y: 800 },  // 宮崎
  46: { x: 180, y: 830 },  // 鹿児島
  47: { x: 100, y: 900 },  // 沖縄
};

interface PrefectureCount {
  [prefecture: string]: number;
}

interface JapanHeatmapProps {
  prefectureCounts: PrefectureCount;
  onPrefecturePress?: (prefectureName: string) => void;
  onRegionPress?: (regionName: string, prefectures: string[]) => void;
}

// 参考画像に基づいた色分け（黄色→オレンジ→赤→濃い赤のグラデーション）
// 参加者がいない場合はピンク系の薄い色
function getHeatColor(count: number, maxCount: number): string {
  if (count === 0) {
    return "#E8D4D4"; // 参加者なし（薄いピンク/ベージュ）
  }
  
  // 最大値に対する割合で色を決定
  const ratio = maxCount > 0 ? count / maxCount : 0;
  
  // 参考画像の色分け基準に近づける
  // 黄色(少) → オレンジ → 赤 → 濃い赤/茶色(多)
  if (ratio <= 0.15) {
    // 薄い黄色
    return "#FFF9C4";
  } else if (ratio <= 0.25) {
    // 黄色
    return "#FFEB3B";
  } else if (ratio <= 0.35) {
    // 薄いオレンジ
    return "#FFCC80";
  } else if (ratio <= 0.50) {
    // オレンジ
    return "#FF9800";
  } else if (ratio <= 0.65) {
    // 濃いオレンジ
    return "#F57C00";
  } else if (ratio <= 0.80) {
    // 赤
    return "#E53935";
  } else {
    // 濃い赤/茶色
    return "#B71C1C";
  }
}

// 都道府県名を正規化（「県」「府」「都」「道」を追加）
function normalizePrefectureName(name: string): string {
  if (!name) return "";
  if (name.endsWith("県") || name.endsWith("府") || name.endsWith("都") || name.endsWith("道")) {
    return name;
  }
  if (name === "北海道") return "北海道";
  if (name === "東京") return "東京都";
  if (name === "大阪") return "大阪府";
  if (name === "京都") return "京都府";
  return name + "県";
}

// 都道府県名を短縮形に変換（地図上表示用）
function getShortPrefectureName(name: string): string {
  if (name === "北海道") return "北海道";
  if (name.endsWith("県")) return name.slice(0, -1);
  if (name.endsWith("府")) return name.slice(0, -1);
  if (name.endsWith("都")) return name.slice(0, -1);
  return name;
}

// 参加者数に応じた動的アイコンを取得
function getDynamicIcon(count: number): string {
  if (count === 0) return "😢"; // 寂しそうな顔
  if (count <= 5) return "😊"; // 笑顔
  if (count <= 20) return "🔥"; // 炎
  return "🎉"; // パーティー
}

export function JapanHeatmap({ prefectureCounts, onPrefecturePress, onRegionPress }: JapanHeatmapProps) {
  const mapWidth = Math.min(screenWidth - 32, 380);
  const mapHeight = mapWidth * 1.2;
  
  // SVGのviewBoxサイズ
  const viewBoxWidth = 800;
  const viewBoxHeight = 960;
  
  // スケールと位置調整
  const scale = 0.85;
  const offsetX = -20;
  const offsetY = 0;

  // 都道府県ごとの参加者数を集計
  const prefectureCounts47 = useMemo(() => {
    const counts: { [code: number]: number } = {};
    Object.entries(prefectureCounts).forEach(([name, count]) => {
      const normalizedName = normalizePrefectureName(name);
      const code = prefectureNameToCode[normalizedName] || prefectureNameToCode[name];
      if (code) {
        counts[code] = (counts[code] || 0) + count;
      }
    });
    return counts;
  }, [prefectureCounts]);

  const maxPrefectureCount = Math.max(...Object.values(prefectureCounts47), 0);
  const totalCount = Object.values(prefectureCounts).reduce((sum, count) => sum + count, 0);

  // 地域ごとの参加者数を集計
  const regionCounts = useMemo(() => {
    const counts: { [region: string]: number } = {};
    regionGroups.forEach(region => {
      counts[region.name] = region.prefectures.reduce((sum, pref) => sum + (prefectureCounts[pref] || 0), 0);
    });
    return counts;
  }, [prefectureCounts]);

  const maxRegionCount = Math.max(...Object.values(regionCounts), 1);

  // 最も参加者が多い都道府県を特定
  const hotPrefecture = useMemo(() => {
    let maxCount = 0;
    let hotCode = 0;
    Object.entries(prefectureCounts47).forEach(([code, count]) => {
      if (count > maxCount) {
        maxCount = count;
        hotCode = parseInt(code);
      }
    });
    const prefData = prefecturesData.find(p => p.code === hotCode);
    return { name: prefData?.name || "", count: maxCount };
  }, [prefectureCounts47]);

  // 参加者がいる都道府県の数
  const activePrefectureCount = Object.values(prefectureCounts47).filter(c => c > 0).length;

  if (totalCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🗾 地域別参加者マップ</Text>
          <Text style={styles.subtitle}>合計 0人</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗾</Text>
          <Text style={styles.emptyText}>まだ参加者がいません{"\n"}最初の参加者になろう！</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗾 地域別参加者マップ</Text>
        <Text style={styles.subtitle}>合計 {totalCount.toLocaleString()}人</Text>
      </View>

      {/* 日本地図（47都道府県） - 水色の背景 */}
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
          {/* 海の背景 */}
          <G>
            <Path d={`M0,0 H${viewBoxWidth} V${viewBoxHeight} H0 Z`} fill="#A8D5E5" />
          </G>
          
          <G transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
            {/* 都道府県のパス */}
            {prefecturesData.map((pref) => {
              const count = prefectureCounts47[pref.code] || 0;
              const color = getHeatColor(count, maxPrefectureCount);
              const prefName = normalizePrefectureName(pref.name);
              
              const handlePress = () => {
                if (onPrefecturePress) {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onPrefecturePress(prefName);
                }
              };
              
              return (
                <G 
                  key={pref.code} 
                  transform={`translate(${pref.tx}, ${pref.ty})`}
                >
                  {pref.paths.map((pathData, idx) => (
                    <Path
                      key={`${pref.code}-${idx}`}
                      d={pathData}
                      fill={color}
                      stroke="#666666"
                      strokeWidth={0.8}
                      strokeLinejoin="round"
                      onPress={handlePress}
                    />
                  ))}
                </G>
              );
            })}
            
            {/* 都道府県名と人数のラベル + 白い丸マーカー */}
            {prefecturesData.map((pref) => {
              const count = prefectureCounts47[pref.code] || 0;
              const labelPos = prefectureLabelPositions[pref.code];
              if (!labelPos) return null;
              
              const shortName = getShortPrefectureName(pref.name);
              
              return (
                <G key={`label-${pref.code}`}>
                  {/* 動的アイコン */}
                  <SvgText
                    x={labelPos.x}
                    y={labelPos.y - 20}
                    fontSize={16}
                    textAnchor="middle"
                  >
                    {getDynamicIcon(count)}
                  </SvgText>
                  {/* 都道府県名 */}
                  <SvgText
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#333333"
                    fontSize={count > 0 ? 11 : 9}
                    fontWeight={count > 0 ? "bold" : "normal"}
                    textAnchor="middle"
                  >
                    {shortName}
                  </SvgText>
                  {/* 人数 */}
                  {count > 0 && (
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y + 12}
                      fill="#333333"
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {count.toLocaleString()}名
                    </SvgText>
                  )}
                </G>
              );
            })}
          </G>
        </Svg>
      </View>

      {/* 温度スケール（凡例） - 参考画像に合わせた色 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FFF9C4" }]} />
          <Text style={styles.legendText}>少</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FFEB3B" }]} />
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF9800" }]} />
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#E53935" }]} />
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#B71C1C" }]} />
          <Text style={styles.legendText}>多</Text>
        </View>
      </View>

      {/* 統計サマリー */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activePrefectureCount}</Text>
          <Text style={styles.statLabel}>都道府県</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>総参加者</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{maxPrefectureCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>最多</Text>
        </View>
      </View>

      {/* ホットな都道府県のハイライト */}
      {hotPrefecture.count > 0 && (
        <View style={styles.hotRegionCard}>
          <Text style={styles.hotIcon}>🔥</Text>
          <View style={styles.hotInfo}>
            <Text style={styles.hotTitle}>{hotPrefecture.name}が熱い！</Text>
            <Text style={styles.hotSubtitle}>{hotPrefecture.count.toLocaleString()}人が参加表明中</Text>
          </View>
        </View>
      )}

      {/* 地域別詳細（カード形式） */}
      <View style={styles.regionCards}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name] || 0;
          const intensity = maxRegionCount > 0 ? count / maxRegionCount : 0;
          const isHot = region.name === regionGroups.find(r => regionCounts[r.name] === maxRegionCount)?.name && count > 0;
          const color = count > 0 ? getHeatColor(count, maxRegionCount) : "#E8D4D4";
          
          const handleRegionCardPress = () => {
            if (onRegionPress) {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onRegionPress(region.name, region.prefectures);
            }
          };
          
          return (
            <TouchableOpacity
              key={region.name}
              onPress={handleRegionCardPress}
              activeOpacity={0.7}
              style={[
                styles.regionCard,
                isHot && styles.regionCardHot,
                { borderColor: count > 0 ? color : "#E8D4D4" }
              ]}
            >
              <View style={styles.regionCardHeader}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.regionName}>{region.name}</Text>
                {isHot && <Text style={styles.hotEmoji}>🔥</Text>}
              </View>
              <Text style={[styles.regionCount, { color: count > 0 ? "#333" : "#9CA3AF" }]}>
                {count.toLocaleString()}<Text style={styles.regionUnit}>人</Text>
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${intensity * 100}%`, backgroundColor: color }]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 12,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  mapContainer: {
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#666",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 24,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#666",
  },
  legendText: {
    color: "#D1D5DB",
    fontSize: 11,
    marginHorizontal: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1D21",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#D1D5DB",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#2D3139",
  },
  hotRegionCard: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hotIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  hotInfo: {
    flex: 1,
  },
  hotTitle: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  hotSubtitle: {
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 2,
  },
  regionCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  regionCard: {
    width: "48%",
    backgroundColor: "#1A1D21",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  regionCardHot: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 2,
  },
  regionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  regionName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  hotEmoji: {
    fontSize: 12,
  },
  regionCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  regionUnit: {
    fontSize: 12,
    fontWeight: "normal",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#2D3139",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
