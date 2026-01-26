/**
 * GenreSelector Component
 * 汎用ジャンル選択ラジオボタン
 */

import { View, Text, Pressable, ScrollView } from "react-native";
import { color } from "@/theme/tokens";
import { palette } from "@/theme/tokens/palette";
import { useColors } from "@/hooks/use-colors";

export type Genre = "idol" | "artist" | "vtuber" | "streamer" | "band" | "dancer" | "voice_actor" | "other";

export interface GenreSelectorProps {
  /** 選択されたジャンル */
  value: Genre | null;
  /** 値変更時のコールバック */
  onChange: (value: Genre | null) => void;
  /** ラベルテキスト */
  label?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** 無効状態 */
  disabled?: boolean;
}

const GENRE_OPTIONS: { value: Genre; label: string; emoji: string }[] = [
  { value: "idol", label: "アイドル", emoji: "🎤" },
  { value: "artist", label: "アーティスト", emoji: "🎸" },
  { value: "vtuber", label: "Vtuber", emoji: "🎮" },
  { value: "streamer", label: "配信者", emoji: "📹" },
  { value: "band", label: "バンド", emoji: "🎵" },
  { value: "dancer", label: "ダンサー", emoji: "💃" },
  { value: "voice_actor", label: "声優", emoji: "🎙️" },
  { value: "other", label: "その他", emoji: "✨" },
];

export function GenreSelector({
  value,
  onChange,
  label = "活動ジャンル",
  required = false,
  errorMessage = "ジャンルを選択してください",
  disabled = false,
}: GenreSelectorProps) {
  const colors = useColors();
  const showError = required && value === null;
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ラベル */}
      {label && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: color.textSecondary, fontSize: 14 }}>
            {label}
          </Text>
          {required && (
            <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
              必須
            </Text>
          )}
        </View>
      )}

      {/* 選択ボタン（2列グリッド） */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {GENRE_OPTIONS.slice(0, 2).map((option) => (
            <GenreOption
              key={option.value}
              selected={value === option.value}
              onPress={() => !disabled && onChange(option.value)}
              emoji={option.emoji}
              label={option.label}
              showRequiredBorder={required && value === null}
              disabled={disabled}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {GENRE_OPTIONS.slice(2, 4).map((option) => (
            <GenreOption
              key={option.value}
              selected={value === option.value}
              onPress={() => !disabled && onChange(option.value)}
              emoji={option.emoji}
              label={option.label}
              showRequiredBorder={required && value === null}
              disabled={disabled}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {GENRE_OPTIONS.slice(4, 6).map((option) => (
            <GenreOption
              key={option.value}
              selected={value === option.value}
              onPress={() => !disabled && onChange(option.value)}
              emoji={option.emoji}
              label={option.label}
              showRequiredBorder={required && value === null}
              disabled={disabled}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {GENRE_OPTIONS.slice(6, 8).map((option) => (
            <GenreOption
              key={option.value}
              selected={value === option.value}
              onPress={() => !disabled && onChange(option.value)}
              emoji={option.emoji}
              label={option.label}
              showRequiredBorder={required && value === null}
              disabled={disabled}
            />
          ))}
        </View>
      </View>

      {/* エラーメッセージ */}
      {showError && (
        <Text style={{ color: color.danger, fontSize: 12, marginTop: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

// ジャンルオプションボタン
function GenreOption({
  selected,
  onPress,
  emoji,
  label,
  showRequiredBorder,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  emoji: string;
  label: string;
  showRequiredBorder: boolean;
  disabled: boolean;
}) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        backgroundColor: palette.gray800, // 黒ベースで統一（GenderSelector、MessageCardと同じ）
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: selected ? palette.primary500 : showRequiredBorder ? color.accentPrimary : palette.gray700,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ 
        color: selected ? palette.primary500 : color.textSecondary, 
        fontSize: 12, 
        fontWeight: "600",
        textAlign: "center",
      }}>
        {label}
      </Text>
    </Pressable>
  );
}
