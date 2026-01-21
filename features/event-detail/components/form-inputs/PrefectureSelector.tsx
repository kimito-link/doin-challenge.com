/**
 * PrefectureSelector Component
 * 都道府県選択ドロップダウン
 */

import { View, Text, Pressable, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { prefectures } from "@/constants/prefectures";

interface PrefectureSelectorProps {
  prefecture: string;
  setPrefecture: (value: string) => void;
  showPrefectureList: boolean;
  setShowPrefectureList: (value: boolean) => void;
}

export function PrefectureSelector({
  prefecture,
  setPrefecture,
  showPrefectureList,
  setShowPrefectureList,
}: PrefectureSelectorProps) {
  const colors = useColors();
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ラベル */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>
          都道府県
        </Text>
        <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
          必須
        </Text>
      </View>

      {/* 選択ボタン */}
      <Pressable
        onPress={() => setShowPrefectureList(!showPrefectureList)}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: prefecture ? color.success : color.accentPrimary,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: prefecture ? color.textWhite : color.textHint }}>
          {prefecture || "選択してください"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={color.textHint} />
      </Pressable>

      {/* ドロップダウンリスト */}
      {showPrefectureList && (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {prefectures.map((pref) => (
              <Pressable
                key={pref}
                onPress={() => {
                  setPrefecture(pref);
                  setShowPrefectureList(false);
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                }}
              >
                <Text style={{ color: colors.foreground }}>{pref}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
