/**
 * テンプレート保存セクション
 * 
 * チャレンジをテンプレートとして保存するオプションUI
 */

import { View, Text, TextInput, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { createUI, createText } from "../theme/tokens";

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
    <View style={{ marginBottom: 16, backgroundColor: createUI.inputBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: createUI.inputBorder }}>
      <TouchableOpacity
        onPress={() => onSaveAsTemplateChange(!saveAsTemplate)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="bookmark" size={20} color={createText.purple} />
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
            テンプレートとして保存
          </Text>
        </View>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: saveAsTemplate ? createUI.purpleAccent : createUI.checkboxBorder,
          backgroundColor: saveAsTemplate ? createUI.purpleAccent : "transparent",
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
            placeholderTextColor={createText.placeholder}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: createUI.inputBorder,
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
              borderColor: templateIsPublic ? createUI.successAccent : createUI.checkboxBorder,
              backgroundColor: templateIsPublic ? createUI.successAccent : "transparent",
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
