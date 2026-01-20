/**
 * 検索バーコンポーネント
 * ホーム画面でチャレンジの検索に使用
 * - デバウンス処理: 入力が止まってから検索を実行
 * - サジェスト機能: 入力中に候補を表示
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, ScrollView, Keyboard, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeUI, homeText } from "@/features/home/ui/theme/tokens";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  /** サジェスト候補のリスト */
  suggestions?: string[];
  /** サジェスト候補をクリックしたとき */
  onSuggestionPress?: (suggestion: string) => void;
  /** デバウンス時間（ミリ秒）デフォルト: 500ms */
  debounceMs?: number;
}

/**
 * デバウンスフック
 * 指定時間入力がなければコールバックを実行
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// よく使われる検索キーワードのサジェスト候補
const DEFAULT_SUGGESTIONS = [
  "ライブ",
  "生誕祭",
  "配信",
  "フェス",
  "ファンミ",
  "リリイベ",
  "ワンマン",
  "グループ",
  "ソロ",
];

export function SearchBar({ 
  value, 
  onChangeText, 
  onClear,
  suggestions,
  onSuggestionPress,
  debounceMs = 500,
}: SearchBarProps) {
  const colors = useColors();
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // デバウンスされた値
  const debouncedValue = useDebounce(localValue, debounceMs);
  
  // デバウンス後に親コンポーネントに通知
  useEffect(() => {
    if (debouncedValue !== value) {
      onChangeText(debouncedValue);
    }
  }, [debouncedValue, onChangeText, value]);
  
  // 外部からvalueが変更された場合（クリア時など）
  useEffect(() => {
    if (value !== localValue && value === "") {
      setLocalValue("");
    }
  }, [value]);
  
  // サジェスト候補のフィルタリング
  const filteredSuggestions = (suggestions || DEFAULT_SUGGESTIONS).filter(
    (s) => localValue.length > 0 && s.toLowerCase().includes(localValue.toLowerCase()) && s !== localValue
  );
  
  // サジェストを表示するかどうか
  const shouldShowSuggestions = isFocused && localValue.length > 0 && filteredSuggestions.length > 0;
  
  const handleLocalChange = useCallback((text: string) => {
    setLocalValue(text);
    setShowSuggestions(true);
  }, []);
  
  const handleClear = useCallback(() => {
    setLocalValue("");
    onClear();
    setShowSuggestions(false);
  }, [onClear]);
  
  const handleSuggestionPress = useCallback((suggestion: string) => {
    setLocalValue(suggestion);
    onChangeText(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
    if (onSuggestionPress) {
      onSuggestionPress(suggestion);
    }
  }, [onChangeText, onSuggestionPress]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    // 少し遅延させてサジェストのタップを受け付ける
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  }, []);
  
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, zIndex: 100 }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: homeUI.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: isFocused ? homeUI.borderActive : (localValue ? homeUI.borderActive : homeUI.border),
      }}>
        <MaterialIcons name="search" size={20} color={homeText.muted} />
        <TextInput
          ref={inputRef}
          value={localValue}
          onChangeText={handleLocalChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="チャレンジを検索..."
          placeholderTextColor={homeText.muted}
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
          onSubmitEditing={() => {
            // Enterキーで即座に検索
            onChangeText(localValue);
            Keyboard.dismiss();
          }}
        />
        {localValue.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={20} color={homeText.muted} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* サジェスト候補 */}
      {shouldShowSuggestions && (
        <View style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: homeUI.surface,
          borderRadius: 12,
          marginTop: 4,
          borderWidth: 1,
          borderColor: homeUI.border,
          maxHeight: 200,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
            web: {
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          }),
        }}>
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => handleSuggestionPress(suggestion)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0,
                  borderBottomColor: homeUI.border,
                }}
              >
                <MaterialIcons name="search" size={16} color={homeText.muted} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.foreground, fontSize: 14 }}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
