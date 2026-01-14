import { View, Text, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import Svg, { Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { useMemo, useState } from "react";
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

interface PrefectureCount {
  [prefecture: string]: number;
}

interface JapanHeatmapProps {
  prefectureCounts: PrefectureCount;
  onPrefecturePress?: (prefectureName: string) => void;
  onRegionPress?: (regionName: string, prefectures: string[]) => void;
}

// 参加者数に基づいて色を計算（青→黄→赤のグラデーション）
// 最大値が小さい場合は、全体的に青寄りになるよう調整
// 赤になるのは、最大値が十分に大きい場合（100人以上）のみ
function getHeatColor(count: number, maxCount: number, totalCount: number): string {
  if (count === 0) {
    return "#2D3139"; // 参加者なし（ダークグレー）
  }
  
  // 赤になるための閾値を設定
  // - 最大値が10人以下の場合: 青〜シアンの範囲のみ（0〜0.25）
  // - 最大値が10〜50人の場合: 青〜黄の範囲（0〜0.5）
  // - 最大値が50〜100人の場合: 青〜オレンジの範囲（0〜0.75）
  // - 最大値が100人以上の場合: フルレンジ（0〜1）
  let maxIntensity: number;
  if (maxCount <= 10) {
    maxIntensity = 0.25; // 青〜シアンのみ
  } else if (maxCount <= 50) {
    maxIntensity = 0.5; // 青〜黄
  } else if (maxCount <= 100) {
    maxIntensity = 0.75; // 青〜オレンジ
  } else {
    maxIntensity = 1.0; // フルレンジ
  }
  
  // 相対的な強度を計算（0〜maxIntensity）
  const relativeIntensity = (count / maxCount) * maxIntensity;
  const intensity = relativeIntensity;
  
  // 青(0) → シアン(0.25) → 黄(0.5) → オレンジ(0.75) → 赤(1) のグラデーション
  if (intensity <= 0.25) {
    // 青からシアンへ
    const t = intensity * 4;
    const r = Math.round(59 + (34 - 59) * t);
    const g = Math.round(130 + (211 - 130) * t);
    const b = Math.round(246 + (238 - 246) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (intensity <= 0.5) {
    // シアンから黄へ
    const t = (intensity - 0.25) * 4;
    const r = Math.round(34 + (251 - 34) * t);
    const g = Math.round(211 + (191 - 211) * t);
    const b = Math.round(238 + (36 - 238) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (intensity <= 0.75) {
    // 黄からオレンジへ
    const t = (intensity - 0.5) * 4;
    const r = Math.round(251 + (249 - 251) * t);
    const g = Math.round(191 + (115 - 191) * t);
    const b = Math.round(36 + (22 - 36) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // オレンジから赤へ
    const t = (intensity - 0.75) * 4;
    const r = Math.round(249 + (239 - 249) * t);
    const g = Math.round(115 + (68 - 115) * t);
    const b = Math.round(22 + (68 - 22) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// 都道府県名を正規化（「県」「府」「都」「道」を追加）
function normalizePrefectureName(name: string): string {
  if (!name) return "";
  // すでに正式名称の場合はそのまま返す
  if (name.endsWith("県") || name.endsWith("府") || name.endsWith("都") || name.endsWith("道")) {
    return name;
  }
  // 特殊ケース
  if (name === "北海道") return "北海道";
  if (name === "東京") return "東京都";
  if (name === "大阪") return "大阪府";
  if (name === "京都") return "京都府";
  return name + "県";
}

export function JapanHeatmap({ prefectureCounts, onPrefecturePress, onRegionPress }: JapanHeatmapProps) {
  const mapWidth = Math.min(screenWidth - 32, 360);
  const mapHeight = mapWidth * 1.1;
  
  // SVGのviewBoxサイズ（元のSVGに合わせる）
  const viewBoxWidth = 800;
  const viewBoxHeight = 880;
  
  // スケールと位置調整
  const scale = 0.85;
  const offsetX = -40;
  const offsetY = -20;

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
        <Text style={styles.subtitle}>合計 {totalCount}人</Text>
      </View>

      {/* 日本地図（47都道府県） */}
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
          <G transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
            {prefecturesData.map((pref) => {
              const count = prefectureCounts47[pref.code] || 0;
              const color = getHeatColor(count, maxPrefectureCount, totalCount);
              const isHot = pref.code === (prefecturesData.find(p => p.name === hotPrefecture.name)?.code) && count > 0;
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
                      stroke={isHot ? "#fff" : "#4B5563"}
                      strokeWidth={isHot ? 1.5 : 0.5}
                      strokeLinejoin="round"
                      onPress={handlePress}
                    />
                  ))}
                </G>
              );
            })}
          </G>
        </Svg>
      </View>

      {/* 温度スケール（凡例） */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>少</Text>
        <View style={styles.gradientBar}>
          <View style={[styles.gradientSection, { backgroundColor: "#3B82F6" }]} />
          <View style={[styles.gradientSection, { backgroundColor: "#22D3EE" }]} />
          <View style={[styles.gradientSection, { backgroundColor: "#FBBF24" }]} />
          <View style={[styles.gradientSection, { backgroundColor: "#F97316" }]} />
          <View style={[styles.gradientSection, { backgroundColor: "#EF4444" }]} />
        </View>
        <Text style={styles.legendLabel}>多</Text>
      </View>

      {/* 統計サマリー */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activePrefectureCount}</Text>
          <Text style={styles.statLabel}>都道府県</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>総参加者</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{maxPrefectureCount}</Text>
          <Text style={styles.statLabel}>最多</Text>
        </View>
      </View>

      {/* ホットな都道府県のハイライト */}
      {hotPrefecture.count > 0 && (
        <View style={styles.hotRegionCard}>
          <Text style={styles.hotIcon}>🔥</Text>
          <View style={styles.hotInfo}>
            <Text style={styles.hotTitle}>{hotPrefecture.name}が熱い！</Text>
            <Text style={styles.hotSubtitle}>{hotPrefecture.count}人が参加表明中</Text>
          </View>
        </View>
      )}

      {/* 地域別詳細（カード形式） */}
      <View style={styles.regionCards}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name] || 0;
          const intensity = maxRegionCount > 0 ? count / maxRegionCount : 0;
          const isHot = region.name === regionGroups.find(r => regionCounts[r.name] === maxRegionCount)?.name && count > 0;
          const color = count > 0 ? getHeatColor(count, maxRegionCount, totalCount) : "#2D3139";
          
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
                { borderColor: count > 0 ? color : "#2D3139" }
              ]}
            >
              <View style={styles.regionCardHeader}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.regionName}>{region.name}</Text>
                {isHot && <Text style={styles.hotEmoji}>🔥</Text>}
              </View>
              <Text style={[styles.regionCount, { color: count > 0 ? color : "#6B7280" }]}>
                {count}<Text style={styles.regionUnit}>人</Text>
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
    color: "#9CA3AF",
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
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  mapContainer: {
    alignSelf: "center",
    backgroundColor: "#0D1117",
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  legendLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  gradientBar: {
    flexDirection: "row",
    height: 12,
    width: 150,
    borderRadius: 6,
    overflow: "hidden",
  },
  gradientSection: {
    flex: 1,
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
    color: "#9CA3AF",
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
    color: "#9CA3AF",
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
    color: "#9CA3AF",
    fontSize: 11,
    flex: 1,
  },
  hotEmoji: {
    fontSize: 10,
  },
  regionCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  regionUnit: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#2D3139",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
