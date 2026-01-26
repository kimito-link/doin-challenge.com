/**
 * チケット情報セクション
 * 
 * 前売り券・当日券・購入URLの入力UI
 */

import { View, Text, TextInput, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { createUI, createText } from "../theme/tokens";

interface TicketInfoSectionProps {
  ticketPresale: string;
  ticketDoor: string;
  ticketUrl: string;
  onTicketPresaleChange: (value: string) => void;
  onTicketDoorChange: (value: string) => void;
  onTicketUrlChange: (value: string) => void;
}

export function TicketInfoSection({
  ticketPresale,
  ticketDoor,
  ticketUrl,
  onTicketPresaleChange,
  onTicketDoorChange,
  onTicketUrlChange,
}: TicketInfoSectionProps) {
  const colors = useColors();
  const isUndecided = ticketPresale === "-1" && ticketDoor === "-1";

  const handleToggleUndecided = () => {
    if (isUndecided) {
      onTicketPresaleChange("");
      onTicketDoorChange("");
    } else {
      onTicketPresaleChange("-1");
      onTicketDoorChange("-1");
      onTicketUrlChange("");
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: createUI.inputBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <MaterialIcons name="confirmation-number" size={20} color={createText.accent} />
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
          チケット情報（任意）
        </Text>
      </View>
      
      {/* まだ決まっていないオプション */}
      <Pressable
        onPress={handleToggleUndecided}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isUndecided ? createUI.activeAccent : createUI.checkboxActiveBorder,
            backgroundColor: isUndecided ? createUI.activeAccent : "transparent",
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isUndecided && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          まだ決まっていない
        </Text>
      </Pressable>
      
      {isUndecided ? (
        <Text style={{ color: createText.muted, fontSize: 12 }}>
          ※ 決まり次第、後から編集できます
        </Text>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                前売り券
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={ticketPresale}
                  onChangeText={onTicketPresaleChange}
                  placeholder="3000"
                  placeholderTextColor={createText.placeholder}
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{
                    backgroundColor: createUI.inputBg,
                    borderRadius: 8,
                    padding: 10,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: createUI.inputBorder,
                    flex: 1,
                  }}
                />
                <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 8 }}>円</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                当日券
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={ticketDoor}
                  onChangeText={onTicketDoorChange}
                  placeholder="3500"
                  placeholderTextColor={createText.placeholder}
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{
                    backgroundColor: createUI.inputBg,
                    borderRadius: 8,
                    padding: 10,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: createUI.inputBorder,
                    flex: 1,
                  }}
                />
                <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 8 }}>円</Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
              チケット購入URL
            </Text>
            <TextInput
              value={ticketUrl}
              onChangeText={onTicketUrlChange}
              placeholder="https://tiget.net/events/..."
              placeholderTextColor={createText.placeholder}
              style={{
                backgroundColor: createUI.inputBg,
                borderRadius: 8,
                padding: 10,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: createUI.inputBorder,
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
