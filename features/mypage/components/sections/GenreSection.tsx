import { View, Text } from "react-native";
import { GenreSelector, type Genre } from "@/components/ui/genre-selector";

interface GenreSectionProps {
  genre: Genre | null;
  onGenreChange: (genre: Genre | null) => void;
  disabled?: boolean;
}

export function GenreSection({ genre, onGenreChange, disabled }: GenreSectionProps) {
  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <Text className="text-lg font-semibold text-foreground mb-3">活動ジャンル</Text>
      <GenreSelector
        value={genre}
        onChange={onGenreChange}
        disabled={disabled}
      />
    </View>
  );
}
