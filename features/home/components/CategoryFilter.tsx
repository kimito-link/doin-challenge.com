/**
 * カテゴリフィルターコンポーネント
 * ホーム画面でカテゴリによるフィルタリングに使用
 */

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { homeUI } from "@/features/home/ui/theme/tokens";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[] | undefined;
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const colors = useColors();
  
  if (!categories || categories.length === 0) return null;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      style={{ marginTop: 8, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingRight: 16 }}
    >
      <TouchableOpacity
        onPress={() => onSelectCategory(null)}
        activeOpacity={0.7}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: selectedCategory === null ? homeUI.activeFilter : homeUI.inactiveFilter,
          marginRight: 8,
          flexDirection: "row",
          alignItems: "center",
          minHeight: 36,
        }}
      >
        <Text style={{ color: colors.foreground, fontSize: 12 }}>全カテゴリ</Text>
      </TouchableOpacity>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          onPress={() => onSelectCategory(cat.id)}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: selectedCategory === cat.id ? homeUI.activeFilter : homeUI.inactiveFilter,
            marginRight: 8,
            flexDirection: "row",
            alignItems: "center",
            minHeight: 36,
          }}
        >
          <Text style={{ marginRight: 4 }}>{cat.icon}</Text>
          <Text style={{ color: colors.foreground, fontSize: 12 }}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
