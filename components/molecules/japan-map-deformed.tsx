/**
 * デフォルメ日本地図コンポーネント
 * 都道府県を四角形で配置し、モバイルで見やすく表示
 */
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";
import { PARTICIPANT_LABELS } from "@/constants/labels";

export interface JapanMapDeformedProps {
  /** 都道府県ごとの参加予定数 */
  prefectureCounts: Record<string, number>;
  /** 点灯させる都道府県（参加完了時） */
  highlightPrefecture?: string | null;
  /** 都道府県がタップされたときのコールバック */
  onPrefecturePress?: (prefecture: string) => void;
}

/** 都道府県の配置情報 */
interface PrefectureLayout {
  name: string;
  row: number;
  col: number;
  color: string;
}

/** デフォルメ日本地図のレイアウト定義 */
const PREFECTURE_LAYOUT: PrefectureLayout[] = [
  // 北海道・東北（緑系）
  { name: "北海道", row: 0, col: 10, color: "#90EE90" },
  { name: "青森", row: 2, col: 10, color: "#87CEEB" },
  { name: "秋田", row: 3, col: 9, color: "#87CEEB" },
  { name: "岩手", row: 3, col: 10, color: "#87CEEB" },
  { name: "山形", row: 4, col: 9, color: "#87CEEB" },
  { name: "宮城", row: 4, col: 10, color: "#87CEEB" },
  { name: "福島", row: 5, col: 10, color: "#87CEEB" },
  
  // 関東（青系）
  { name: "茨城", row: 5, col: 11, color: "#87CEFA" },
  { name: "栃木", row: 5, col: 10, color: "#87CEFA" },
  { name: "群馬", row: 5, col: 9, color: "#87CEFA" },
  { name: "埼玉", row: 6, col: 10, color: "#87CEFA" },
  { name: "千葉", row: 6, col: 11, color: "#87CEFA" },
  { name: "東京", row: 6, col: 10, color: "#4169E1" },
  { name: "神奈川", row: 7, col: 10, color: "#87CEFA" },
  
  // 中部（紫・ピンク系）
  { name: "新潟", row: 4, col: 8, color: "#DDA0DD" },
  { name: "富山", row: 5, col: 7, color: "#DDA0DD" },
  { name: "石川", row: 5, col: 6, color: "#DDA0DD" },
  { name: "福井", row: 6, col: 6, color: "#DDA0DD" },
  { name: "山梨", row: 6, col: 9, color: "#FFB6C1" },
  { name: "長野", row: 5, col: 8, color: "#DDA0DD" },
  { name: "岐阜", row: 6, col: 7, color: "#FFB6C1" },
  { name: "静岡", row: 7, col: 9, color: "#FFB6C1" },
  { name: "愛知", row: 7, col: 8, color: "#FFB6C1" },
  
  // 近畿（ピンク系）
  { name: "三重", row: 7, col: 7, color: "#FFB6C1" },
  { name: "滋賀", row: 6, col: 7, color: "#FFB6C1" },
  { name: "京都", row: 6, col: 6, color: "#FFB6C1" },
  { name: "大阪", row: 7, col: 6, color: "#FF69B4" },
  { name: "兵庫", row: 6, col: 5, color: "#FFB6C1" },
  { name: "奈良", row: 7, col: 6, color: "#FFB6C1" },
  { name: "和歌山", row: 8, col: 6, color: "#FFB6C1" },
  
  // 中国（赤系）
  { name: "鳥取", row: 5, col: 5, color: "#FFA07A" },
  { name: "島根", row: 6, col: 4, color: "#FFA07A" },
  { name: "岡山", row: 6, col: 5, color: "#FFA07A" },
  { name: "広島", row: 7, col: 5, color: "#FFA07A" },
  { name: "山口", row: 7, col: 4, color: "#FFA07A" },
  
  // 四国（オレンジ系）
  { name: "徳島", row: 8, col: 6, color: "#FFA500" },
  { name: "香川", row: 7, col: 6, color: "#FFA500" },
  { name: "愛媛", row: 8, col: 5, color: "#FFA500" },
  { name: "高知", row: 9, col: 6, color: "#FFA500" },
  
  // 九州（黄色系）
  { name: "福岡", row: 7, col: 3, color: "#FFD700" },
  { name: "佐賀", row: 8, col: 3, color: "#FFD700" },
  { name: "長崎", row: 8, col: 2, color: "#FFD700" },
  { name: "熊本", row: 9, col: 3, color: "#FFD700" },
  { name: "大分", row: 8, col: 4, color: "#FFD700" },
  { name: "宮崎", row: 9, col: 4, color: "#FFD700" },
  { name: "鹿児島", row: 10, col: 3, color: "#FFD700" },
  { name: "沖縄", row: 12, col: 2, color: "#FFD700" },
];

/** 都道府県セルコンポーネント */
function PrefectureCell({
  prefecture,
  count,
  isHighlighted,
  onPress,
}: {
  prefecture: PrefectureLayout;
  count: number;
  isHighlighted: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // ハイライト演出
  useEffect(() => {
    if (isHighlighted) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 300 })
      );
    }
  }, [isHighlighted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const hasParticipants = count > 0;
  const backgroundColor = hasParticipants
    ? prefecture.color
    : colors.surface;

  // 親コンポーネントからセルサイズを受け取る
  const cellWidth = (prefecture as any).cellWidth || 44;
  const cellHeight = (prefecture as any).cellHeight || 28;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: prefecture.row * cellHeight,
          left: prefecture.col * cellWidth,
          width: cellWidth,
          height: cellHeight,
          borderRadius: 4,
          backgroundColor,
          borderWidth: 1,
          borderColor: hasParticipants ? "#FFF" : colors.border,
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: Math.max(8, cellWidth * 0.18),
            fontWeight: "bold",
            color: hasParticipants ? "#000" : colors.muted,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {prefecture.name}
        </Text>
        {hasParticipants && (
          <Text
            style={{
              fontSize: Math.max(10, cellWidth * 0.23),
              fontWeight: "bold",
              color: "#000",
            }}
          >
            {count}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function JapanMapDeformed({
  prefectureCounts,
  highlightPrefecture,
  onPrefecturePress,
}: JapanMapDeformedProps) {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();

  // 地図の最大row/colを計算
  const maxRow = Math.max(...PREFECTURE_LAYOUT.map((p) => p.row));
  const maxCol = Math.max(...PREFECTURE_LAYOUT.map((p) => p.col));

  // 画面幅に応じてセルサイズを動的に計算（余白を考慮）
  const horizontalPadding = 32; // 左右の余白
  const availableWidth = screenWidth - horizontalPadding;
  const cellWidth = Math.floor(availableWidth / (maxCol + 1));
  const cellHeight = Math.floor(cellWidth * 0.64); // アスペクト比を維持

  // 地図の高さを計算
  const mapHeight = (maxRow + 2) * cellHeight;

  return (
    <View style={{ marginVertical: 16, paddingHorizontal: 16 }}>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 12,
        }}
      >
        都道府県別参加者
      </Text>
      <View
        style={{
          height: mapHeight,
          backgroundColor: colors.surface,
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {PREFECTURE_LAYOUT.map((prefecture) => {
          const count = prefectureCounts[prefecture.name] || 0;
          const isHighlighted = highlightPrefecture === prefecture.name;

          // セルサイズを渡す
          const prefectureWithSize = {
            ...prefecture,
            cellWidth,
            cellHeight,
          } as any;

          return (
            <PrefectureCell
              key={prefecture.name}
              prefecture={prefectureWithSize}
              count={count}
              isHighlighted={isHighlighted}
              onPress={() => onPrefecturePress?.(prefecture.name)}
            />
          );
        })}
      </View>
    </View>
  );
}
