import { Text, View, ScrollView, TouchableOpacity, Share, Platform } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
// Clipboardはネイティブ機能を使用
import * as Haptics from "expo-haptics";
import { AppHeader } from "@/components/app-header";

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const { data: challenge, isLoading } = (trpc as any).challenges.get.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const createInviteMutation = trpc.invitations.create.useMutation({
    onSuccess: (data) => {
      setInviteCode(data.code);
    },
  });

  useEffect(() => {
    if (id && user) {
      createInviteMutation.mutate({
        challengeId: parseInt(id),
      });
    }
  }, [id, user]);

  const inviteUrl = inviteCode 
    ? `https://douin-challenge.app/join/${inviteCode}`
    : null;

  const handleCopyLink = async () => {
    if (inviteUrl) {
      // クリップボードにコピー（Webの場合）
      if (Platform.OS === "web" && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      setCopied(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (inviteUrl && challenge) {
      try {
        await Share.share({
          message: `🎉 「${challenge.title}」に一緒に参加しよう！\n\n目標: ${challenge.targetCount}人\n\n招待リンク: ${inviteUrl}\n\n#動員ちゃれんじ #君斗りんく`,
          url: inviteUrl,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    }
  };

  const handleShareTwitter = () => {
    if (inviteUrl && challenge) {
      const text = encodeURIComponent(
        `🎉 「${challenge.title}」に一緒に参加しよう！\n\n目標: ${challenge.targetCount}人\n\n招待リンク: ${inviteUrl}\n\n#動員ちゃれんじ #君斗りんく`
      );
      const url = `https://twitter.com/intent/tweet?text=${text}`;
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      }
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!challenge) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>チャレンジが見つかりません</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, padding: 12 }}
          >
            <Text style={{ color: "#DD6500" }}>戻る</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView>
        {/* ヘッダー */}
        <AppHeader 
          title="動員ちゃれんじ" 
          showCharacters={false}
          rightElement={
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
            </TouchableOpacity>
          }
        />
        <LinearGradient
          colors={["#DD6500", "#EC4899", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20, paddingTop: 16 }}
        >
          <View style={{ alignItems: "center" }}>
            <MaterialIcons name="share" size={48} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 12 }}>
              友達を招待
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4, textAlign: "center" }}>
              一緒にチャレンジを盛り上げよう！
            </Text>
          </View>
        </LinearGradient>

        {/* チャレンジ情報 */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: "#161B22",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2D3139",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              {challenge.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="people" size={16} color="#9CA3AF" />
              <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>
                目標: {challenge.targetCount}人
              </Text>
            </View>
            {challenge.venue && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>
                  {challenge.venue}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 招待リンク */}
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
            招待リンク
          </Text>
          
          {inviteUrl ? (
            <>
              <View
                style={{
                  backgroundColor: "#161B22",
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 12 }} numberOfLines={1}>
                  {inviteUrl}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCopyLink}
                style={{
                  backgroundColor: copied ? "#22C55E" : "#DD6500",
                  borderRadius: 8,
                  padding: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialIcons 
                  name={copied ? "check" : "content-copy"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>
                  {copied ? "コピーしました！" : "リンクをコピー"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "#2D3139",
                  borderRadius: 8,
                  padding: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialIcons name="share" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>
                  シェアする
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareTwitter}
                style={{
                  backgroundColor: "#1DA1F2",
                  borderRadius: 8,
                  padding: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>𝕏</Text>
                <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>
                  Xでシェア
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: "#9CA3AF" }}>招待リンクを生成中...</Text>
            </View>
          )}
        </View>

        {/* QRコード風のプレースホルダー */}
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
            QRコード
          </Text>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <View
              style={{
                width: 150,
                height: 150,
                backgroundColor: "#f0f0f0",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="qr-code-2" size={100} color="#333" />
            </View>
            <Text style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
              スキャンして参加
            </Text>
          </View>
        </View>

        {/* 招待特典 */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: "#161B22",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#DD6500",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons name="card-giftcard" size={24} color="#DD6500" />
              <Text style={{ color: "#DD6500", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                招待特典
              </Text>
            </View>
            <Text style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 20 }}>
              友達を招待すると、あなたの貢献度が+1されます！{"\n"}
              たくさん招待して、チャレンジを盛り上げよう！
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
