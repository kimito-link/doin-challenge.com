import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, G } from "react-native-svg";
import { useMemo } from "react";

const screenWidth = Dimensions.get("window").width;

interface DataPoint {
  date: Date;
  count: number;
  milestone?: string;
}

interface GrowthTrajectoryChartProps {
  data: DataPoint[];
  targetCount: number;
  title?: string;
}

// 日付をフォーマット
function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

// 数値を短縮形式でフォーマット
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}千`;
  }
  return num.toString();
}

export function GrowthTrajectoryChart({ data, targetCount, title = "動員までの軌跡" }: GrowthTrajectoryChartProps) {
  const chartWidth = Math.min(screenWidth - 32, 380);
  const chartHeight = 280;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 40;
  const paddingBottom = 50;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const { pathData, milestones, yAxisLabels, xAxisLabels, currentCount, progressPercent } = useMemo(() => {
    if (data.length === 0) {
      return {
        pathData: "",
        milestones: [],
        yAxisLabels: [],
        xAxisLabels: [],
        currentCount: 0,
        progressPercent: 0,
      };
    }

    // Y軸の最大値を計算（目標値または最大データ値の大きい方）
    const maxDataCount = Math.max(...data.map(d => d.count));
    const yMax = Math.max(targetCount, maxDataCount) * 1.1;
    
    // X軸の範囲を計算
    const startDate = data[0].date;
    const endDate = data[data.length - 1].date;
    const dateRange = endDate.getTime() - startDate.getTime();
    
    // パスデータを生成
    const points = data.map((d, i) => {
      const x = paddingLeft + (dateRange > 0 
        ? ((d.date.getTime() - startDate.getTime()) / dateRange) * graphWidth 
        : graphWidth / 2);
      const y = paddingTop + graphHeight - (d.count / yMax) * graphHeight;
      return { x, y, ...d };
    });
    
    // スムーズな曲線を生成
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + (curr.x - prev.x) * 2 / 3;
      pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    // マイルストーンを抽出
    const milestonesData = points.filter(p => p.milestone);
    
    // Y軸ラベルを生成
    const yLabels = [];
    const yStep = yMax / 5;
    for (let i = 0; i <= 5; i++) {
      const value = Math.round(yStep * i);
      const y = paddingTop + graphHeight - (value / yMax) * graphHeight;
      yLabels.push({ value, y });
    }
    
    // X軸ラベルを生成（最大5つ）
    const xLabels = [];
    const labelCount = Math.min(5, data.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((data.length - 1) * i / (labelCount - 1 || 1));
      const d = data[index];
      const x = paddingLeft + (dateRange > 0 
        ? ((d.date.getTime() - startDate.getTime()) / dateRange) * graphWidth 
        : graphWidth / 2);
      xLabels.push({ date: d.date, x });
    }
    
    const current = data[data.length - 1].count;
    const progress = (current / targetCount) * 100;
    
    return {
      pathData: pathD,
      milestones: milestonesData,
      yAxisLabels: yLabels,
      xAxisLabels: xLabels,
      currentCount: current,
      progressPercent: Math.min(progress, 100),
    };
  }, [data, targetCount, graphWidth, graphHeight]);

  // 目標ラインのY座標
  const targetY = useMemo(() => {
    if (data.length === 0) return paddingTop;
    const maxDataCount = Math.max(...data.map(d => d.count));
    const yMax = Math.max(targetCount, maxDataCount) * 1.1;
    return paddingTop + graphHeight - (targetCount / yMax) * graphHeight;
  }, [data, targetCount, graphHeight]);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📈 {title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>まだデータがありません{"\n"}参加者が増えると軌跡が表示されます</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 {title}</Text>
        <Text style={styles.subtitle}>
          現在 {formatNumber(currentCount)}人 / 目標 {formatNumber(targetCount)}人 ({progressPercent.toFixed(1)}%)
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FF6B6B" stopOpacity="1" />
              <Stop offset="1" stopColor="#FF8E53" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* グリッド線 */}
          {yAxisLabels.map((label, i) => (
            <Line
              key={`grid-${i}`}
              x1={paddingLeft}
              y1={label.y}
              x2={chartWidth - paddingRight}
              y2={label.y}
              stroke="#E5E7EB"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* 目標ライン */}
          <Line
            x1={paddingLeft}
            y1={targetY}
            x2={chartWidth - paddingRight}
            y2={targetY}
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="8,4"
          />
          <SvgText
            x={chartWidth - paddingRight - 5}
            y={targetY - 8}
            fill="#10B981"
            fontSize={10}
            fontWeight="bold"
            textAnchor="end"
          >
            目標 {formatNumber(targetCount)}人
          </SvgText>

          {/* 成長曲線（塗りつぶしエリア） */}
          {pathData && (
            <Path
              d={`${pathData} L ${paddingLeft + graphWidth} ${paddingTop + graphHeight} L ${paddingLeft} ${paddingTop + graphHeight} Z`}
              fill="url(#areaGradient)"
            />
          )}

          {/* 成長曲線（ライン） */}
          {pathData && (
            <Path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* マイルストーンマーカー */}
          {milestones.map((m, i) => (
            <G key={`milestone-${i}`}>
              <Circle
                cx={m.x}
                cy={m.y}
                r={8}
                fill="#FFFFFF"
                stroke="#FF6B6B"
                strokeWidth={2}
              />
              <Circle
                cx={m.x}
                cy={m.y}
                r={4}
                fill="#FF6B6B"
              />
              {/* マイルストーンラベル */}
              <SvgText
                x={m.x}
                y={m.y - 15}
                fill="#333333"
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
              >
                {m.milestone}
              </SvgText>
            </G>
          ))}

          {/* 現在地点のマーカー */}
          {data.length > 0 && (
            <G>
              <Circle
                cx={paddingLeft + graphWidth}
                cy={paddingTop + graphHeight - (currentCount / (Math.max(targetCount, currentCount) * 1.1)) * graphHeight}
                r={10}
                fill="#FFFFFF"
                stroke="#FF6B6B"
                strokeWidth={3}
              />
              <SvgText
                x={paddingLeft + graphWidth}
                y={paddingTop + graphHeight - (currentCount / (Math.max(targetCount, currentCount) * 1.1)) * graphHeight + 4}
                fill="#FF6B6B"
                fontSize={8}
                fontWeight="bold"
                textAnchor="middle"
              >
                今
              </SvgText>
            </G>
          )}

          {/* Y軸ラベル */}
          {yAxisLabels.map((label, i) => (
            <SvgText
              key={`y-label-${i}`}
              x={paddingLeft - 8}
              y={label.y + 4}
              fill="#687076"
              fontSize={10}
              textAnchor="end"
            >
              {formatNumber(label.value)}
            </SvgText>
          ))}

          {/* X軸ラベル */}
          {xAxisLabels.map((label, i) => (
            <SvgText
              key={`x-label-${i}`}
              x={label.x}
              y={chartHeight - paddingBottom + 20}
              fill="#687076"
              fontSize={10}
              textAnchor="middle"
            >
              {formatDate(label.date)}
            </SvgText>
          ))}

          {/* 軸線 */}
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + graphHeight}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
          <Line
            x1={paddingLeft}
            y1={paddingTop + graphHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + graphHeight}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        </Svg>
      </View>

      {/* 凡例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#FF6B6B" }]} />
          <Text style={styles.legendText}>参加者数の推移</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#10B981", borderStyle: "dashed" }]} />
          <Text style={styles.legendText}>目標ライン</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ECEDEE",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9BA1A6",
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#9BA1A6",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 22,
  },
});
