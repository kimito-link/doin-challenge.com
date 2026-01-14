import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";

interface HamburgerMenuProps {
  isDesktop?: boolean;
}

export function HamburgerMenu({ isDesktop = false }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, login, logout, loading: isLoading } = useAuth();

  const handleOpen = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogin = async () => {
    handleClose();
    await login();
  };

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    handleClose();
    await logout();
  };

  const handleNavigateHome = () => {
    handleClose();
    router.push("/(tabs)");
  };

  const handleNavigateProfile = () => {
    handleClose();
    router.push("/(tabs)" as any);
  };

  return (
    <>
      {/* ハンバーガーアイコン */}
      <TouchableOpacity
        onPress={handleOpen}
        style={{
          padding: 8,
          borderRadius: 8,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
        activeOpacity={0.7}
      >
        <View style={{ width: isDesktop ? 24 : 20, height: isDesktop ? 18 : 14, justifyContent: "space-between" }}>
          <View style={{ height: 2, backgroundColor: "#fff", borderRadius: 1 }} />
          <View style={{ height: 2, backgroundColor: "#fff", borderRadius: 1 }} />
          <View style={{ height: 2, backgroundColor: "#fff", borderRadius: 1 }} />
        </View>
      </TouchableOpacity>

      {/* メニューモーダル */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "flex-start",
            alignItems: "flex-end",
          }}
          onPress={handleClose}
        >
          <Pressable
            style={{
              backgroundColor: "#1A1D21",
              width: 280,
              marginTop: Platform.OS === "web" ? 60 : 100,
              marginRight: 16,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#2D3139",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <View style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2D3139",
              backgroundColor: "#0D1117",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>メニュー</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={{ color: "#9CA3AF", fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ユーザー情報 */}
            {user ? (
              <View style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#2D3139",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {user.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#EC4899",
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                        {(user.name || user.username || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                      {user.name || user.username || "ゲスト"}
                    </Text>
                    {user.username && (
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                        @{user.username}
                      </Text>
                    )}
                    {user.followersCount !== undefined && (
                      <Text style={{ color: "#60A5FA", fontSize: 11, marginTop: 2 }}>
                        {user.followersCount.toLocaleString()} フォロワー
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                }}>
                  <Text style={{ color: "#10B981", fontSize: 11 }}>✓ ログイン中</Text>
                </View>
              </View>
            ) : (
              <View style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#2D3139",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#2D3139",
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ color: "#6B7280", fontSize: 20 }}>👤</Text>
                  </View>
                  <View>
                    <Text style={{ color: "#9CA3AF", fontSize: 14 }}>ゲスト</Text>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>ログインしていません</Text>
                  </View>
                </View>
              </View>
            )}

            {/* メニュー項目 */}
            <View style={{ padding: 8 }}>
              {/* ホーム */}
              <TouchableOpacity
                onPress={handleNavigateHome}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 8,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18, marginRight: 12 }}>🏠</Text>
                <Text style={{ color: "#fff", fontSize: 14 }}>ホーム</Text>
              </TouchableOpacity>

              {/* マイページ */}
              {user && (
                <TouchableOpacity
                  onPress={handleNavigateProfile}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 8,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>👤</Text>
                  <Text style={{ color: "#fff", fontSize: 14 }}>マイページ</Text>
                </TouchableOpacity>
              )}

              {/* 区切り線 */}
              <View style={{ height: 1, backgroundColor: "#2D3139", marginVertical: 8 }} />

              {/* ログイン/ログアウト */}
              {user ? (
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                  }}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🚪</Text>
                  <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600" }}>
                    {isLoading ? "ログアウト中..." : "ログアウト"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "rgba(29, 161, 242, 0.1)",
                  }}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🐦</Text>
                  <Text style={{ color: "#1DA1F2", fontSize: 14, fontWeight: "600" }}>
                    {isLoading ? "ログイン中..." : "Xでログイン"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* フッター */}
            <View style={{
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: "#2D3139",
              backgroundColor: "#0D1117",
            }}>
              <Text style={{ color: "#6B7280", fontSize: 10, textAlign: "center" }}>
                動員ちゃれんじ v1.0
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
