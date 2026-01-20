/**
 * テンプレート保存セクション
 * 
 * チャレンジをテンプレートとして保存するオプションUI
 */

import { View, Text, TextInput, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface TemplateSaveSectionProps {
  saveAsTemplate: boolean;
  templateName: string;
  templateIsPublic: boolean;
  onSaveAsTemplateChange: (value: boolean) => void;
  onTemplateNameChange: (value: string) => void;
  onTemplateIsPublicChange: (value: boolean) => void;
}

export function TemplateSaveSection({
  saveAsTemplate,
  templateName,
  templateIsPublic,
  onSaveAsTemplateChange,
  onTemplateNameChange,
  onTemplateIsPublicChange,
}: TemplateSaveSectionProps) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 16, backgroundColor: "#1A1D21", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#2D3139" }}>
      <TouchableOpacity
        onPress={() => onSaveAsTemplateChange(!saveAsTemplate)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="bookmark" size={20} color="#8B5CF6" />
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
            テンプレートとして保存
          </Text>
        </View>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: saveAsTemplate ? "#8B5CF6" : "#6B7280",
          backgroundColor: saveAsTemplate ? "#8B5CF6" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {saveAsTemplate && <MaterialIcons name="check" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
      
      {saveAsTemplate && (
        <View style={{ marginTop: 12 }}>
          <TextInput
            value={templateName}
            onChangeText={onTemplateNameChange}
            placeholder="テンプレート名"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: "#2D3139",
              marginBottom: 8,
            }}
          />
          <TouchableOpacity
            onPress={() => onTemplateIsPublicChange(!templateIsPublic)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: templateIsPublic ? "#22C55E" : "#6B7280",
              backgroundColor: templateIsPublic ? "#22C55E" : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}>
              {templateIsPublic && <MaterialIcons name="check" size={14} color="#fff" />}
            </View>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              他のユーザーにも公開する
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
