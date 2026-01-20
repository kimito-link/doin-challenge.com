/**
 * おすすめ主催者セクションコンポーネント
 * ホーム画面でおすすめの主催者一覧を表示する（遅延読み込み）
 */

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";

export function RecommendedHostsSection() {
  const colors = useColors();
  const router = useRouter();
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // 500ms後に読み込み開始（初期表示を優先）
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const { data: hosts, isLoading } = trpc.profiles.recommendedHosts.useQuery(
    { limit: 5 },
    { enabled: shouldLoad } // 遅延読み込み
  );

  if (!shouldLoad || isLoading || !hosts || hosts.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <View style={{ 
        backgroundColor: "#1A1D21", 
        borderRadius: 16, 
        padding: 16,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}>
        <Text style={{ color: "#8B5CF6", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          ✨ おすすめの主催者
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {hosts.map((host) => (
              <TouchableOpacity
                key={host.userId}
                onPress={() => router.push({ pathname: "/profile/[userId]", params: { userId: host.userId.toString() } })}
                style={{ alignItems: "center", width: 80 }}
              >
                <OptimizedAvatar
                  source={host.profileImage ? { uri: host.profileImage } : undefined}
                  size={56}
                  fallbackColor="#8B5CF6"
                  fallbackText={(host.name || "?").charAt(0)}
                />
                <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 6, textAlign: "center" }} numberOfLines={1}>
                  {host.name || "主催者"}
                </Text>
                {host.username && (
                  <Text style={{ color: "#D1D5DB", fontSize: 10 }} numberOfLines={1}>
                    @{host.username}
                  </Text>
                )}
                <Text style={{ color: "#8B5CF6", fontSize: 9, marginTop: 2 }}>
                  {host.challengeCount}チャレンジ
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
