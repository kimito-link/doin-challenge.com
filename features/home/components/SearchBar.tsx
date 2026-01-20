/**
 * 検索バーコンポーネント
 * ホーム画面でチャレンジの検索に使用
 */

import { View, TextInput, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  const colors = useColors();
  
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8 }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: value ? "#DD6500" : "#2D3139",
      }}>
        <MaterialIcons name="search" size={20} color="#D1D5DB" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="チャレンジを検索..."
          placeholderTextColor="#D1D5DB"
          style={{
            flex: 1,
            marginLeft: 8,
            color: colors.foreground,
            fontSize: 14,
            paddingVertical: 8,
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          textContentType="none"
          keyboardType="default"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <MaterialIcons name="close" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
