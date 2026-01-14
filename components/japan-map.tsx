import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import { useMemo } from "react";

const screenWidth = Dimensions.get("window").width;

// 都道府県コードと名前のマッピング
const prefectureData: { [key: string]: { name: string; x: number; y: number } } = {
  "北海道": { name: "北海道", x: 320, y: 50 },
  "青森県": { name: "青森", x: 310, y: 120 },
  "岩手県": { name: "岩手", x: 330, y: 145 },
  "宮城県": { name: "宮城", x: 320, y: 175 },
  "秋田県": { name: "秋田", x: 290, y: 145 },
  "山形県": { name: "山形", x: 290, y: 175 },
  "福島県": { name: "福島", x: 300, y: 200 },
  "茨城県": { name: "茨城", x: 310, y: 230 },
  "栃木県": { name: "栃木", x: 290, y: 215 },
  "群馬県": { name: "群馬", x: 265, y: 215 },
  "埼玉県": { name: "埼玉", x: 275, y: 240 },
  "千葉県": { name: "千葉", x: 310, y: 255 },
  "東京都": { name: "東京", x: 285, y: 260 },
  "神奈川県": { name: "神奈川", x: 280, y: 280 },
  "新潟県": { name: "新潟", x: 250, y: 180 },
  "富山県": { name: "富山", x: 215, y: 205 },
  "石川県": { name: "石川", x: 195, y: 195 },
  "福井県": { name: "福井", x: 185, y: 225 },
  "山梨県": { name: "山梨", x: 255, y: 255 },
  "長野県": { name: "長野", x: 240, y: 230 },
  "岐阜県": { name: "岐阜", x: 205, y: 245 },
  "静岡県": { name: "静岡", x: 245, y: 280 },
  "愛知県": { name: "愛知", x: 210, y: 275 },
  "三重県": { name: "三重", x: 185, y: 290 },
  "滋賀県": { name: "滋賀", x: 175, y: 260 },
  "京都府": { name: "京都", x: 160, y: 245 },
  "大阪府": { name: "大阪", x: 155, y: 275 },
  "兵庫県": { name: "兵庫", x: 135, y: 260 },
  "奈良県": { name: "奈良", x: 170, y: 290 },
  "和歌山県": { name: "和歌山", x: 155, y: 315 },
  "鳥取県": { name: "鳥取", x: 115, y: 240 },
  "島根県": { name: "島根", x: 90, y: 250 },
  "岡山県": { name: "岡山", x: 115, y: 270 },
  "広島県": { name: "広島", x: 85, y: 275 },
  "山口県": { name: "山口", x: 55, y: 285 },
  "徳島県": { name: "徳島", x: 135, y: 305 },
  "香川県": { name: "香川", x: 130, y: 290 },
  "愛媛県": { name: "愛媛", x: 100, y: 305 },
  "高知県": { name: "高知", x: 110, y: 325 },
  "福岡県": { name: "福岡", x: 40, y: 295 },
  "佐賀県": { name: "佐賀", x: 25, y: 305 },
  "長崎県": { name: "長崎", x: 10, y: 315 },
  "熊本県": { name: "熊本", x: 35, y: 330 },
  "大分県": { name: "大分", x: 60, y: 310 },
  "宮崎県": { name: "宮崎", x: 60, y: 345 },
  "鹿児島県": { name: "鹿児島", x: 35, y: 365 },
  "沖縄県": { name: "沖縄", x: 10, y: 420 },
};

// 地域グループ
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

interface JapanMapProps {
  prefectureCounts: PrefectureCount;
  onPrefecturePress?: (prefecture: string) => void;
  selectedPrefecture?: string | null;
}

// 参加者数に応じた色を計算（青→黄→赤のグラデーション）
function getHeatColor(count: number, maxCount: number): string {
  if (count === 0) return "#2D3139"; // 参加者なし
  
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  
  // 青(0) → 黄(0.5) → 赤(1) のグラデーション
  if (intensity <= 0.5) {
    // 青 → 黄
    const t = intensity * 2;
    const r = Math.round(59 + (251 - 59) * t);
    const g = Math.round(130 + (191 - 130) * t);
    const b = Math.round(246 + (36 - 246) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 黄 → 赤
    const t = (intensity - 0.5) * 2;
    const r = Math.round(251 + (239 - 251) * t);
    const g = Math.round(191 + (68 - 191) * t);
    const b = Math.round(36 + (68 - 36) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// 参加者数に応じたボーダー色を計算
function getHeatBorderColor(count: number, maxCount: number): string {
  if (count === 0) return "#3D4149";
  
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  
  if (intensity <= 0.5) {
    const t = intensity * 2;
    const r = Math.round(96 + (253 - 96) * t);
    const g = Math.round(165 + (224 - 165) * t);
    const b = Math.round(250 + (71 - 250) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (intensity - 0.5) * 2;
    const r = Math.round(253 + (248 - 253) * t);
    const g = Math.round(224 + (113 - 224) * t);
    const b = Math.round(71 + (113 - 71) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function JapanMap({ prefectureCounts, onPrefecturePress, selectedPrefecture }: JapanMapProps) {
  const mapWidth = Math.min(screenWidth - 32, 400);
  const mapHeight = mapWidth * 1.2;
  const scale = mapWidth / 400;

  // 地域ごとの参加者数を集計
  const regionCounts = useMemo(() => {
    const counts: { [region: string]: number } = {};
    regionGroups.forEach(region => {
      counts[region.name] = region.prefectures.reduce((sum, pref) => sum + (prefectureCounts[pref] || 0), 0);
    });
    return counts;
  }, [prefectureCounts]);

  const maxRegionCount = Math.max(...Object.values(regionCounts), 1);
  const totalCount = Object.values(prefectureCounts).reduce((sum, count) => sum + count, 0);

  // 最も参加者が多い地域を特定
  const hotRegion = useMemo(() => {
    let maxCount = 0;
    let hotRegionName = "";
    Object.entries(regionCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        hotRegionName = name;
      }
    });
    return { name: hotRegionName, count: maxCount };
  }, [regionCounts]);

  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          🗾 地域別参加者マップ
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 8 }}>
          合計 {totalCount}人
        </Text>
      </View>

      {/* 地域カード */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 }}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name] || 0;
          const isHot = region.name === hotRegion.name && count > 0;
          const bgColor = getHeatColor(count, maxRegionCount);
          const borderColor = getHeatBorderColor(count, maxRegionCount);
          
          return (
            <TouchableOpacity
              key={region.name}
              onPress={() => {
                if (onPrefecturePress) {
                  onPrefecturePress(region.name);
                }
              }}
              style={{
                width: "48%",
                backgroundColor: count > 0 ? `${bgColor}22` : "#1A1D21",
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: isHot ? 2 : 1,
                borderColor: isHot ? "#EF4444" : borderColor,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: bgColor,
                    marginRight: 8,
                  }} />
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{region.name}</Text>
                </View>
                {isHot && (
                  <Text style={{ fontSize: 12 }}>🔥</Text>
                )}
              </View>
              <Text style={{ 
                color: count > 0 ? bgColor : "#6B7280", 
                fontSize: 24, 
                fontWeight: "bold",
                marginTop: 4,
              }}>
                {count}<Text style={{ fontSize: 14, color: "#9CA3AF" }}>人</Text>
              </Text>
              
              {/* 参加者バー */}
              <View style={{
                height: 4,
                backgroundColor: "#2D3139",
                borderRadius: 2,
                marginTop: 8,
                overflow: "hidden",
              }}>
                <View style={{
                  height: "100%",
                  width: `${(count / maxRegionCount) * 100}%`,
                  backgroundColor: bgColor,
                  borderRadius: 2,
                }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ホットな地域のハイライト */}
      {hotRegion.count > 0 && (
        <View style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.3)",
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "bold" }}>
              {hotRegion.name}が熱い！
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
              {hotRegion.count}人が参加表明中
            </Text>
          </View>
        </View>
      )}

      {/* 温度スケール凡例 */}
      <View style={{ marginTop: 12, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginRight: 8 }}>少</Text>
          <View style={{ 
            flexDirection: "row", 
            height: 8, 
            width: 120, 
            borderRadius: 4, 
            overflow: "hidden",
          }}>
            <View style={{ flex: 1, backgroundColor: "#3B82F6" }} />
            <View style={{ flex: 1, backgroundColor: "#60A5FA" }} />
            <View style={{ flex: 1, backgroundColor: "#FBBF24" }} />
            <View style={{ flex: 1, backgroundColor: "#F59E0B" }} />
            <View style={{ flex: 1, backgroundColor: "#EF4444" }} />
          </View>
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginLeft: 8 }}>多</Text>
        </View>
      </View>
    </View>
  );
}

// シンプルな地域別表示（グリッドの代わり）- ヒートマップ対応
export function SimpleRegionMap({ prefectureCounts }: { prefectureCounts: PrefectureCount }) {
  // 地域ごとの参加者数を集計
  const regionCounts = useMemo(() => {
    const counts: { [region: string]: number } = {};
    regionGroups.forEach(region => {
      counts[region.name] = region.prefectures.reduce((sum, pref) => sum + (prefectureCounts[pref] || 0), 0);
    });
    return counts;
  }, [prefectureCounts]);

  const maxRegionCount = Math.max(...Object.values(regionCounts), 1);
  const totalCount = Object.values(prefectureCounts).reduce((sum, count) => sum + count, 0);

  // 最も参加者が多い地域を特定
  const hotRegion = useMemo(() => {
    let maxCount = 0;
    let hotRegionName = "";
    Object.entries(regionCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        hotRegionName = name;
      }
    });
    return { name: hotRegionName, count: maxCount };
  }, [regionCounts]);

  if (totalCount === 0) {
    return (
      <View style={{ marginVertical: 16, alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 48 }}>🗾</Text>
        <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 8, textAlign: "center" }}>
          まだ参加者がいません{"\n"}最初の参加者になろう！
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          🗾 地域別参加者
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 8 }}>
          合計 {totalCount}人
        </Text>
      </View>

      {/* 地域カード - ヒートマップ表示 */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name] || 0;
          const isHot = region.name === hotRegion.name && count > 0;
          const bgColor = getHeatColor(count, maxRegionCount);
          const borderColor = getHeatBorderColor(count, maxRegionCount);
          
          return (
            <View
              key={region.name}
              style={{
                width: "48%",
                backgroundColor: count > 0 ? `${bgColor}22` : "#1A1D21",
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: isHot ? 2 : 1,
                borderColor: isHot ? "#EF4444" : borderColor,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: bgColor,
                    marginRight: 6,
                  }} />
                  <Text style={{ color: "#9CA3AF", fontSize: 11 }}>{region.name}</Text>
                </View>
                {isHot && (
                  <Text style={{ fontSize: 10 }}>🔥</Text>
                )}
              </View>
              <Text style={{ 
                color: count > 0 ? bgColor : "#6B7280", 
                fontSize: 20, 
                fontWeight: "bold",
                marginTop: 4,
              }}>
                {count}<Text style={{ fontSize: 12, color: "#9CA3AF" }}>人</Text>
              </Text>
              
              {/* 参加者バー - ヒートマップ色 */}
              <View style={{
                height: 3,
                backgroundColor: "#2D3139",
                borderRadius: 2,
                marginTop: 6,
                overflow: "hidden",
              }}>
                <View style={{
                  height: "100%",
                  width: `${(count / maxRegionCount) * 100}%`,
                  backgroundColor: bgColor,
                  borderRadius: 2,
                }} />
              </View>
            </View>
          );
        })}
      </View>

      {/* ホットな地域のハイライト */}
      {hotRegion.count > 0 && (
        <View style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderRadius: 12,
          padding: 14,
          marginTop: 8,
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.3)",
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "bold" }}>
              {hotRegion.name}が熱い！
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
              {hotRegion.count}人が参加表明中
            </Text>
          </View>
        </View>
      )}

      {/* 温度スケール凡例 */}
      <View style={{ marginTop: 12, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginRight: 8 }}>少</Text>
          <View style={{ 
            flexDirection: "row", 
            height: 6, 
            width: 100, 
            borderRadius: 3, 
            overflow: "hidden",
          }}>
            <View style={{ flex: 1, backgroundColor: "#3B82F6" }} />
            <View style={{ flex: 1, backgroundColor: "#60A5FA" }} />
            <View style={{ flex: 1, backgroundColor: "#FBBF24" }} />
            <View style={{ flex: 1, backgroundColor: "#F59E0B" }} />
            <View style={{ flex: 1, backgroundColor: "#EF4444" }} />
          </View>
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginLeft: 8 }}>多</Text>
        </View>
      </View>
    </View>
  );
}
