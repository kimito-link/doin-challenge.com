import { View, Text, Dimensions } from "react-native";
import { useMemo } from "react";
import { color } from "@/theme/tokens";

/**
 * パフォーマンスチャートコンポーネント
 * シンプルな棒グラフとラインチャートを実装
 */

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title: string;
  type?: "bar" | "line";
  height?: number;
  showValues?: boolean;
  unit?: string;
}

const CHART_COLORS: Record<string, string> = {
  good: color.successDark,
  needsImprovement: color.warning,
  poor: color.dangerDark,
  primary: color.accentIndigo,
};

export function PerformanceChart({
  data,
  title,
  type = "bar",
  height = 200,
  showValues = true,
  unit = "ms",
}: PerformanceChartProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48; // padding考慮
  const chartHeight = height;

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  const barWidth = useMemo(() => {
    return (chartWidth - 40) / data.length - 8;
  }, [chartWidth, data.length]);

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-semibold text-foreground mb-4">{title}</Text>

      {type === "bar" ? (
        <View style={{ height: chartHeight }}>
          <View className="flex-row items-end justify-around" style={{ height: chartHeight - 30 }}>
            {data.map((point, index) => {
              const barHeight = (point.value / maxValue) * (chartHeight - 50);
              const color = point.color || CHART_COLORS.primary;

              return (
                <View key={index} className="items-center" style={{ width: barWidth }}>
                  <View
                    style={{
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: color,
                      borderRadius: 4,
                    }}
                  />
                  {showValues && (
                    <Text className="text-xs text-foreground font-semibold mt-2">
                      {point.value.toFixed(0)}
                      {unit}
                    </Text>
                  )}
                  <Text className="text-xs text-muted mt-1" numberOfLines={1}>
                    {point.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={{ height: chartHeight }}>
          <View className="relative" style={{ height: chartHeight - 30 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View
                key={index}
                style={{
                  position: "absolute",
                  top: (chartHeight - 50) * (1 - ratio),
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: color.border,
                }}
              />
            ))}

            {/* Line chart */}
            <View className="flex-row items-end justify-around" style={{ height: chartHeight - 50 }}>
              {data.map((point, index) => {
                const pointHeight = (point.value / maxValue) * (chartHeight - 50);
                const color = point.color || CHART_COLORS.primary;

                return (
                  <View key={index} className="items-center" style={{ width: barWidth }}>
                    {/* Point */}
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: color,
                        position: "absolute",
                        bottom: pointHeight - 4,
                      }}
                    />
                    {/* Line to next point */}
                    {index < data.length - 1 && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: pointHeight,
                          left: barWidth / 2,
                          width: barWidth + 8,
                          height: 2,
                          backgroundColor: color,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                ((data[index + 1].value / maxValue) * (chartHeight - 50) - pointHeight),
                                barWidth + 8
                              )}rad`,
                            },
                          ],
                        }}
                      />
                    )}
                    {showValues && (
                      <Text
                        className="text-xs text-foreground font-semibold"
                        style={{ position: "absolute", bottom: pointHeight + 12 }}
                      >
                        {point.value.toFixed(0)}
                        {unit}
                      </Text>
                    )}
                    <Text className="text-xs text-muted mt-1" numberOfLines={1}>
                      {point.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * パフォーマンストレンドチャート
 * 時系列データを表示
 */
interface TrendDataPoint {
  timestamp: number;
  value: number;
}

interface PerformanceTrendChartProps {
  data: TrendDataPoint[];
  title: string;
  height?: number;
  unit?: string;
  goodThreshold?: number;
  poorThreshold?: number;
}

export function PerformanceTrendChart({
  data,
  title,
  height = 200,
  unit = "ms",
  goodThreshold,
  poorThreshold,
}: PerformanceTrendChartProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const chartHeight = height;

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  const minValue = useMemo(() => {
    return Math.min(...data.map((d) => d.value), 0);
  }, [data]);

  const pointWidth = useMemo(() => {
    return data.length > 1 ? (chartWidth - 40) / (data.length - 1) : 0;
  }, [chartWidth, data.length]);

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-semibold text-foreground mb-4">{title}</Text>

      <View style={{ height: chartHeight }}>
        <View className="relative" style={{ height: chartHeight - 30 }}>
          {/* Threshold lines */}
          {goodThreshold && (
            <View
              style={{
                position: "absolute",
                top: ((maxValue - goodThreshold) / (maxValue - minValue)) * (chartHeight - 50),
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: CHART_COLORS.good,
              }}
            />
          )}
          {poorThreshold && (
            <View
              style={{
                position: "absolute",
                top: ((maxValue - poorThreshold) / (maxValue - minValue)) * (chartHeight - 50),
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: CHART_COLORS.poor,
              }}
            />
          )}

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                top: (chartHeight - 50) * ratio,
                left: 0,
                right: 0,
                height: 1,
                  backgroundColor: color.border,
              }}
            />
          ))}

          {/* Line chart */}
          <View className="relative" style={{ height: chartHeight - 50 }}>
            {data.map((point, index) => {
              const pointHeight =
                ((maxValue - point.value) / (maxValue - minValue)) * (chartHeight - 50);
              const pointX = index * pointWidth + 20;

              // Determine color based on thresholds
              let pointColor = CHART_COLORS.primary;
              if (goodThreshold && poorThreshold) {
                if (point.value <= goodThreshold) {
                  pointColor = CHART_COLORS.good;
                } else if (point.value >= poorThreshold) {
                  pointColor = CHART_COLORS.poor;
                } else {
                  pointColor = CHART_COLORS.needsImprovement;
                }
              }

              return (
                <View key={index}>
                  {/* Point */}
                  <View
                    style={{
                      position: "absolute",
                      left: pointX - 4,
                      top: pointHeight - 4,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: pointColor,
                    }}
                  />
                  {/* Line to next point */}
                  {index < data.length - 1 && (
                    <View
                      style={{
                        position: "absolute",
                        left: pointX,
                        top: pointHeight,
                        width: Math.sqrt(
                          Math.pow(pointWidth, 2) +
                            Math.pow(
                              ((maxValue - data[index + 1].value) / (maxValue - minValue)) *
                                (chartHeight - 50) -
                                pointHeight,
                              2
                            )
                        ),
                        height: 2,
                        backgroundColor: pointColor,
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              ((maxValue - data[index + 1].value) / (maxValue - minValue)) *
                                (chartHeight - 50) -
                                pointHeight,
                              pointWidth
                            )}rad`,
                          },
                        ],
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Y-axis labels */}
          <View style={{ position: "absolute", left: -30, top: 0, bottom: 0, justifyContent: "space-between" }}>
            <Text className="text-xs text-muted">
              {maxValue.toFixed(0)}
              {unit}
            </Text>
            <Text className="text-xs text-muted">
              {((maxValue + minValue) / 2).toFixed(0)}
              {unit}
            </Text>
            <Text className="text-xs text-muted">
              {minValue.toFixed(0)}
              {unit}
            </Text>
          </View>
        </View>

        {/* X-axis labels */}
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-muted">
            {new Date(data[0]?.timestamp || Date.now()).toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          {data.length > 1 && (
            <Text className="text-xs text-muted">
              {new Date(data[data.length - 1].timestamp).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
