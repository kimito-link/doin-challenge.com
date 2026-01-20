/**
 * カテゴリセレクター
 * 
 * チャレンジのカテゴリを選択するドロップダウンUI
 */

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps {
  categoryId: number | null;
  categories: Category[] | undefined;
  showList: boolean;
  onToggleList: () => void;
  onSelect: (categoryId: number) => void;
}

export function CategorySelector({
  categoryId,
  categories,
  showList,
  onToggleList,
  onSelect,
}: CategorySelectorProps) {
  const colors = useColors();

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
        カテゴリ
      </Text>
      <TouchableOpacity
        onPress={onToggleList}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: "#2D3139",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: categoryId ? colors.foreground : "#9CA3AF", fontSize: 14 }}>
          {selectedCategory?.name || "カテゴリを選択"}
        </Text>
        <MaterialIcons
          name={showList ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.muted}
        />
      </TouchableOpacity>
      {showList && categories && (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: "#2D3139",
            maxHeight: 200,
          }}
        >
          <ScrollView nestedScrollEnabled={true}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => onSelect(category.id)}
                activeOpacity={0.7}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#2D3139",
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: categoryId === category.id ? "#EC4899" : colors.foreground,
                    fontSize: 14,
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
