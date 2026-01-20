import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, Alert } from "react-native";
import { color, palette } from "@/theme/tokens";
import { useState, useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  generateCSV,
  generateTextReport,
  shareCSV,
  shareTextReport,
  copyToClipboard,
  type ExportData,
} from "@/lib/export-stats";

interface ExportButtonProps {
  data: ExportData;
  disabled?: boolean;
}

type ExportFormat = "csv" | "text" | "clipboard";

/**
 * 統計データエクスポートボタンコンポーネント
 * CSV、テキストレポート、クリップボードコピーに対応
 */
export function ExportButton({ data, disabled = false }: ExportButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setModalVisible(true);
  }, [disabled]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExporting(true);
    
    try {
      let success = false;
      
      switch (format) {
        case "csv":
          success = await shareCSV(data);
          break;
        case "text":
          success = await shareTextReport(data);
          break;
        case "clipboard":
          const csv = generateCSV(data);
          success = await copyToClipboard(csv);
          if (success) {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("コピー完了", "統計データをクリップボードにコピーしました");
          }
          break;
      }

      if (success) {
        setModalVisible(false);
      }
    } catch (error) {
      console.error("[ExportButton] Export failed:", error);
      Alert.alert("エラー", "エクスポートに失敗しました");
    } finally {
      setExporting(false);
    }
  }, [data]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="統計データをエクスポート"
      >
        <MaterialIcons name="file-download" size={20} color={disabled ? color.textSubtle : color.textWhite} />
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          エクスポート
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>エクスポート形式を選択</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={color.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionList}>
              {/* CSVエクスポート */}
              <TouchableOpacity
                onPress={() => handleExport("csv")}
                disabled={exporting}
                style={styles.optionItem}
              >
                <View style={[styles.optionIcon, { backgroundColor: color.successDark }]}>
                  <MaterialIcons name="table-chart" size={24} color={color.textWhite} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>CSV形式</Text>
                  <Text style={styles.optionDescription}>
                    表計算ソフトで開ける形式
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
              </TouchableOpacity>

              {/* テキストレポート */}
              <TouchableOpacity
                onPress={() => handleExport("text")}
                disabled={exporting}
                style={styles.optionItem}
              >
                <View style={[styles.optionIcon, { backgroundColor: color.accentPrimary }]}>
                  <MaterialIcons name="description" size={24} color={color.textWhite} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>テキストレポート</Text>
                  <Text style={styles.optionDescription}>
                    SNSでシェアしやすい形式
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
              </TouchableOpacity>

              {/* クリップボードコピー（Web専用） */}
              {Platform.OS === "web" && (
                <TouchableOpacity
                  onPress={() => handleExport("clipboard")}
                  disabled={exporting}
                  style={styles.optionItem}
                >
                  <View style={[styles.optionIcon, { backgroundColor: color.accentAlt }]}>
                    <MaterialIcons name="content-copy" size={24} color={color.textWhite} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>クリップボードにコピー</Text>
                    <Text style={styles.optionDescription}>
                      CSVデータをコピー
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
                </TouchableOpacity>
              )}
            </View>

            {exporting && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>エクスポート中...</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.border,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonTextDisabled: {
    color: color.textSubtle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: color.surface,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  modalTitle: {
    color: color.textWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  optionList: {
    padding: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: color.textWhite,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    color: color.textMuted,
    fontSize: 13,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: color.textWhite,
    fontSize: 16,
  },
});
