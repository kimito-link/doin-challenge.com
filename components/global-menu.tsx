import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/hooks/use-auth";
import { ConfirmModal } from "@/components/confirm-modal";
import * as Haptics from "expo-haptics";

// キャラクター画像
const characterImages = {
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
};

interface GlobalMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export function GlobalMenu({ isVisible, onClose }: GlobalMenuProps) {
  const router = useRouter();
  const { user, login, isAuthenticated } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLogin = async () => {
    handleHaptic();
    setIsLoggingIn(true);
    onClose();
    try {
      await login();
    } finally {
      setTimeout(() => setIsLoggingIn(false), 3000);
    }
  };

  const handleLogout = () => {
    handleHaptic();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onClose();
    router.push("/logout");
  };

  const handleNavigate = (path: string) => {
    handleHaptic();
    onClose();
    router.push(path as any);
  };

  const menuItems = [
    { icon: "home", label: "ホーム", path: "/(tabs)" },
    { icon: "add-circle", label: "チャレンジ作成", path: "/(tabs)/create" },
    { icon: "person", label: "マイページ", path: "/(tabs)/mypage" },
    { icon: "leaderboard", label: "ランキング", path: "/ranking" },
    { icon: "notifications", label: "通知", path: "/notifications" },
    { icon: "settings", label: "設定", path: "/theme-settings" },
  ];

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
          onPress={onClose}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 280,
              height: "100%",
              backgroundColor: "#1A1D21",
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView style={{ flex: 1 }}>
              {/* ヘッダー */}
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: "#374151",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                    メニュー
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#374151",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ユーザー情報 */}
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: "#374151",
                }}
              >
                {isAuthenticated && user ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {user.profileImage ? (
                      <Image
                        source={{ uri: user.profileImage }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          marginRight: 12,
                        }}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: "#374151",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <MaterialIcons name="person" size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                        numberOfLines={1}
                      >
                        {user.name || user.username || "ゲスト"}
                      </Text>
                      {user.username && (
                        <Text
                          style={{
                            color: "#9CA3AF",
                            fontSize: 14,
                          }}
                          numberOfLines={1}
                        >
                          @{user.username}
                        </Text>
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#10B981",
                            marginRight: 6,
                          }}
                        />
                        <Text style={{ color: "#10B981", fontSize: 12 }}>
                          ログイン中
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={characterImages.linkYukkuri}
                      style={{ width: 60, height: 60, marginBottom: 12 }}
                      contentFit="contain"
                    />
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 14,
                        textAlign: "center",
                        marginBottom: 12,
                      }}
                    >
                      ログインして参加しよう！
                    </Text>
                    <TouchableOpacity
                      onPress={handleLogin}
                      disabled={isLoggingIn}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#1DA1F2",
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 24,
                        opacity: isLoggingIn ? 0.7 : 1,
                        width: "100%",
                      }}
                    >
                      <MaterialIcons
                        name="login"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        {isLoggingIn ? "ログイン中..." : "Xでログイン"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* メニュー項目 */}
              <View style={{ padding: 12 }}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigate(item.path)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      marginBottom: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={24}
                      color="#9CA3AF"
                      style={{ marginRight: 16 }}
                    />
                    <Text style={{ color: "#fff", fontSize: 16 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ログアウトボタン */}
              {isAuthenticated && (
                <View
                  style={{
                    padding: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#374151",
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="logout"
                      size={20}
                      color="#EF4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      ログアウト
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ログアウト確認モーダル */}
      <ConfirmModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="ログアウト"
        message="ログアウトしますか？"
        confirmText="ログアウト"
        cancelText="キャンセル"
        confirmStyle="destructive"
        icon="logout"
        iconColor="#EF4444"
      />
    </>
  );
}

// ハンバーガーメニューボタン
interface HamburgerButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

export function HamburgerButton({
  onPress,
  size = 24,
  color = "#fff",
}: HamburgerButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
      }}
      activeOpacity={0.7}
    >
      <MaterialIcons name="menu" size={size} color={color} />
    </TouchableOpacity>
  );
}
