/**
 * アカウント切り替えUIコンポーネント
 * 別のTwitterアカウントでログインする機能を提供
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useAccounts } from "@/hooks/use-accounts";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { SavedAccount } from "@/lib/account-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface AccountSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

export function AccountSwitcher({ visible, onClose }: AccountSwitcherProps) {
  const colors = useColors();
  const { accounts, currentAccountId, deleteAccount } = useAccounts();
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 別のアカウントでログイン
  const handleSwitchAccount = async () => {
    setIsLoading(true);
    try {
      // 1. 現在のセッションをログアウト
      await logout();
      
      // 2. ローカルストレージのセッション情報をクリア
      await AsyncStorage.removeItem("twitter_session");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("access_token");
      
      // 3. ブラウザのクッキーをクリア（Web環境の場合）
      if (Platform.OS === "web") {
        try {
          await fetch("/api/auth/clear-session", {
            method: "POST",
            credentials: "include",
          });
        } catch (e) {
          console.log("Session clear request failed:", e);
        }
      }
      
      // 4. モーダルを閉じる
      onClose();
      
      // 5. forceSwitch=trueで別のアカウントでログイン
      // 少し遅延を入れてUIの更新を待つ
      setTimeout(async () => {
        try {
          await login(undefined, true);
        } catch (e) {
          console.log("Login failed:", e);
        }
      }, 300);
    } catch (error) {
      console.error("[AccountSwitcher] Failed to switch account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // アカウントを削除
  const handleRemoveAccount = async (accountId: string) => {
    await deleteAccount(accountId);
  };

  // ユーザーのプロフィール画像を取得（Auth.User型に対応）
  const getUserProfileImage = () => {
    if (!user) return undefined;
    // Auth.User型にはprofileImageがないため、localStorageから取得
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("twitter_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.profileImage;
        }
      } catch (e) {
        console.log("Failed to get profile image from localStorage:", e);
      }
    }
    return undefined;
  };

  // ユーザー名を取得
  const getUsername = () => {
    if (!user) return "";
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("twitter_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.username || user.name;
        }
      } catch (e) {
        console.log("Failed to get username from localStorage:", e);
      }
    }
    return user.name || "";
  };

  const profileImage = getUserProfileImage();
  const username = getUsername();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              アカウント切り替え
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.accountList}>
            {/* 現在のアカウント */}
            {user && (
              <View
                style={[
                  styles.accountItem,
                  styles.currentAccount,
                  { borderColor: colors.primary },
                ]}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
                    <MaterialIcons name="person" size={24} color={colors.foreground} />
                  </View>
                )}
                <View style={styles.accountInfo}>
                  <Text style={[styles.displayName, { color: colors.foreground }]}>
                    {user.name}
                  </Text>
                  {username && (
                    <Text style={[styles.username, { color: colors.muted }]}>
                      @{username}
                    </Text>
                  )}
                </View>
                <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.currentBadgeText}>現在</Text>
                </View>
              </View>
            )}

            {/* 保存済みの他のアカウント */}
            {accounts
              .filter((a) => a.id !== currentAccountId)
              .map((account) => (
                <AccountItem
                  key={account.id}
                  account={account}
                  colors={colors}
                  onRemove={() => handleRemoveAccount(account.id)}
                />
              ))}
          </ScrollView>

          {/* 注意事項 */}
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.muted }]}>
              Twitterの認証画面で別のアカウントを選択できます
            </Text>
          </View>

          {/* 別のアカウントでログインボタン */}
          <TouchableOpacity
            style={[styles.switchButton, { backgroundColor: "#1D9BF0" }]}
            onPress={handleSwitchAccount}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialIcons name="swap-horiz" size={20} color="#FFFFFF" />
                <Text style={styles.switchButtonText}>
                  別のアカウントでログイン
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// 個別のアカウントアイテム
function AccountItem({
  account,
  colors,
  onRemove,
}: {
  account: SavedAccount;
  colors: ReturnType<typeof useColors>;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.accountItem, { borderColor: colors.border }]}>
      {account.profileImageUrl ? (
        <Image
          source={{ uri: account.profileImageUrl }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
          <MaterialIcons name="person" size={24} color={colors.foreground} />
        </View>
      )}
      <View style={styles.accountInfo}>
        <Text style={[styles.displayName, { color: colors.foreground }]}>
          {account.displayName}
        </Text>
        <Text style={[styles.username, { color: colors.muted }]}>
          @{account.username}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Text style={[styles.removeButtonText, { color: colors.error }]}>削除</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 20,
    padding: 4,
  },
  accountList: {
    maxHeight: 250,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  currentAccount: {
    borderWidth: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
  },
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  switchButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
