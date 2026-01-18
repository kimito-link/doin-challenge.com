import { View, Text, TouchableOpacity, Linking, Modal } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// キャラクター画像
const characterImages = {
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
};

interface FollowGateProps {
  isFollowing: boolean;
  targetUsername: string;
  targetDisplayName: string;
  onRefreshStatus?: () => void;
  onRelogin?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
}

/**
 * フォロー確認ゲートコンポーネント
 * 特定のTwitterアカウントをフォローしていない場合、
 * プレミアム機能へのアクセスをブロックし、フォローを促す
 */
export function FollowGate({
  isFollowing,
  targetUsername,
  targetDisplayName,
  onRefreshStatus,
  onRelogin,
  refreshing,
  children,
}: FollowGateProps) {
  const [showModal, setShowModal] = useState(false);

  // フォローしている場合は子コンポーネントをそのまま表示
  if (isFollowing) {
    return <>{children}</>;
  }

  // フォローしていない場合はモーダルを表示
  const handleFollowPress = async () => {
    const twitterUrl = `https://twitter.com/intent/follow?screen_name=${targetUsername}`;
    await Linking.openURL(twitterUrl);
  };

  const handleRefresh = () => {
    onRefreshStatus?.();
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{ flex: 1 }}
        activeOpacity={0.9}
      >
        <View style={{ flex: 1, opacity: 0.5 }}>
          {children}
        </View>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <MaterialIcons name="lock" size={48} color="#EC4899" />
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            プレミアム機能
          </Text>
          <Text
            style={{
              color: "#D1D5DB",
              fontSize: 14,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            @{targetUsername}をフォローすると{"\n"}この機能が使えるようになります
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#1A1D21",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 340,
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />

            <Image
              source={characterImages.linkYukkuri}
              style={{ width: 80, height: 80, marginBottom: 16 }}
              contentFit="contain"
            />

            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              フォローをお願いします！
            </Text>

            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 14,
                textAlign: "center",
                marginTop: 12,
                lineHeight: 22,
              }}
            >
              この機能を使うには{"\n"}
              <Text style={{ color: "#EC4899", fontWeight: "bold" }}>
                @{targetUsername}
              </Text>
              {"\n"}をフォローしてください
            </Text>

            <TouchableOpacity
              onPress={handleFollowPress}
              style={{
                backgroundColor: "#1DA1F2",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                marginTop: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="person-add" size={20} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginLeft: 8,
                }}
              >
                {targetDisplayName}をフォロー
              </Text>
            </TouchableOpacity>

            {/* 再ログインボタン */}
            {onRelogin && (
              <TouchableOpacity
                onPress={onRelogin}
                disabled={refreshing}
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                <MaterialIcons name="refresh" size={18} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    marginLeft: 8,
                  }}
                >
                  {refreshing ? "確認中..." : "フォロー状態を再確認"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
            >
              <Text style={{ color: "#D1D5DB", fontSize: 14 }}>
                フォロー済みの方はタップして更新
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: 8,
              }}
            >
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/**
 * フォロー促進バナーコンポーネント
 * フォローしていない場合に表示するバナー
 */
export function FollowPromptBanner({
  isFollowing,
  targetUsername,
  targetDisplayName,
  onFollowPress,
  onRelogin,
  refreshing,
}: {
  isFollowing: boolean;
  targetUsername: string;
  targetDisplayName: string;
  onFollowPress?: () => void;
  onRelogin?: () => void;
  refreshing?: boolean;
}) {
  if (isFollowing) {
    return null;
  }

  const handlePress = async () => {
    if (onFollowPress) {
      onFollowPress();
    } else {
      const twitterUrl = `https://twitter.com/intent/follow?screen_name=${targetUsername}`;
      await Linking.openURL(twitterUrl);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#EC4899",
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#EC4899",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="star" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
              フォローで特典をゲット！
            </Text>
            <Text style={{ color: "#D1D5DB", fontSize: 12, marginTop: 2 }}>
              @{targetUsername}をフォローすると特別な特典がもらえるかも？
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#EC4899" />
        </View>
      </TouchableOpacity>
      
      {/* フォロー済みの場合の再確認ボタン */}
      {onRelogin && (
        <TouchableOpacity
          onPress={onRelogin}
          disabled={refreshing}
          activeOpacity={0.7}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: "#374151",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <MaterialIcons name="refresh" size={16} color="#fff" />
          <Text style={{ color: "#E5E7EB", fontSize: 13, marginLeft: 6 }}>
            {refreshing ? "確認中..." : "フォロー済みの方はタップして再確認"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * フォロー状態バッジコンポーネント
 */
export function FollowStatusBadge({ isFollowing }: { isFollowing: boolean }) {
  if (isFollowing) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#22C55E20",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}
      >
        <MaterialIcons name="verified" size={14} color="#22C55E" />
        <Text
          style={{
            color: "#22C55E",
            fontSize: 12,
            fontWeight: "bold",
            marginLeft: 4,
          }}
        >
          プレミアム
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EC489920",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
      }}
    >
      <MaterialIcons name="star-outline" size={14} color="#EC4899" />
      <Text
        style={{
          color: "#EC4899",
          fontSize: 12,
          marginLeft: 4,
        }}
      >
        フォローで特典
      </Text>
    </View>
  );
}
