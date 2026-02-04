/**
 * テンプレート保存セクション
 * 
 * チャレンジをテンプレートとして保存するオプションUI
 */

import { View, Text, TextInput } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { createUI, createText, createFont } from "../theme/tokens";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui";

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
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: saveAsTemplate ? 12 : 0 }}>
        <MaterialIcons name="bookmark" size={20} color={createText.purple} style={{ marginRight: 8 }} />
        <Checkbox
          checked={saveAsTemplate}
          onChange={onSaveAsTemplateChange}
          label="テンプレートとして保存"
          containerStyle={{ flex: 1 }}
        />
      </View>
      
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
          <Checkbox
            checked={templateIsPublic}
            onChange={onTemplateIsPublicChange}
            label="他のユーザーにも公開する"
            size="sm"
          />
        </View>
      )}
    </View>
  );
}
