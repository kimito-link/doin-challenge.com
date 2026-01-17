import { FlatList, Text, View, TouchableOpacity, RefreshControl, ScrollView, TextInput, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { ResponsiveContainer } from "@/components/molecules/responsive-container";
import { OnboardingSteps } from "@/components/organisms/onboarding-steps";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useResponsive, useGridColumns } from "@/hooks/use-responsive";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Countdown } from "@/components/atoms/countdown";
import { PressableCard } from "@/components/molecules/pressable-card";
import { AppHeader } from "@/components/organisms/app-header";
import { CachedDataIndicator } from "@/components/organisms/offline-banner";
import { useNetworkStatus } from "@/hooks/use-offline-cache";
import { setCache, getCache, CACHE_KEYS } from "@/lib/offline-cache";
import { setCachedData, getCachedData, PREFETCH_KEYS } from "@/lib/data-prefetch";
import { useTabPrefetch } from "@/hooks/use-prefetch";
import { ChallengeCardSkeleton, Skeleton } from "@/components/atoms/skeleton-loader";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import { LazyAvatar } from "@/components/molecules/lazy-image";
import { prefetchChallengeImages } from "@/lib/image-prefetch";
import { SimpleRefreshControl } from "@/components/molecules/enhanced-refresh-control";
import { AnimatedCard } from "@/components/molecules/animated-pressable";
import { SyncStatusIndicator } from "@/components/atoms/sync-status-indicator";
import { BlinkingLink } from "@/components/atoms/blinking-character";
import { HostEmptyState } from "@/components/organisms/host-empty-state";
import { TutorialHighlightTarget } from "@/components/atoms/tutorial-highlight-target";
import { useTutorial } from "@/lib/tutorial-context";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  // メインキャラクター（全身）
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  // ゆっくりキャラクター
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-color.jpg");

// 目標タイプの表示名とアイコン
const goalTypeConfig: Record<string, { label: string; icon: string; unit: string }> = {
  attendance: { label: "動員", icon: "people", unit: "人" },
  followers: { label: "フォロワー", icon: "person-add", unit: "人" },
  viewers: { label: "同時視聴", icon: "visibility", unit: "人" },
  points: { label: "ポイント", icon: "star", unit: "pt" },
  custom: { label: "カスタム", icon: "flag", unit: "" },
};

// イベントタイプのバッジ
const eventTypeBadge: Record<string, { label: string; color: string }> = {
  solo: { label: "ソロ", color: "#EC4899" },
  group: { label: "グループ", color: "#8B5CF6" },
};

// 地域グループ
const regionGroups: Record<string, string[]> = {
  "北海道・東北": ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  "関東": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  "関西": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  "中国・四国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
  "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

type Challenge = {
  id: number;
  hostName: string;
  hostUsername: string | null;
  hostProfileImage: string | null;
  hostFollowersCount: number | null;
  title: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  goalUnit: string;
  currentValue: number;
  eventType: string;
  eventDate: Date;
  venue: string | null;
  prefecture: string | null;
  status: string;
};

type FilterType = "all" | "solo" | "group";

// 注目のチャレンジセクション
function FeaturedChallenge({ challenge, onPress }: { challenge: Challenge; onPress: () => void }) {
  const colors = useColors();
  const eventDate = new Date(challenge.eventDate);
  const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const unit = challenge.goalUnit || goalConfig.unit;
  const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);

  return (
    <PressableCard
      onPress={onPress}
      style={{
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#DD6500",
      }}
    >
      <LinearGradient
        colors={["#EC4899", "#8B5CF6", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* 注目バッジ */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ backgroundColor: "#DD6500", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "bold" }}>🔥 注目のチャレンジ</Text>
          </View>
          <View style={{ marginLeft: "auto" }}>
            <Countdown targetDate={challenge.eventDate} compact />
          </View>
        </View>

        {/* タイトル */}
        <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "bold", marginBottom: 4 }}>
          {challenge.title}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 16 }}>
          {challenge.hostName}
        </Text>

        {/* 大きな進捗表示 */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 48, fontWeight: "bold" }}>
            {challenge.currentValue}
            <Text style={{ fontSize: 20, color: "rgba(255,255,255,0.7)" }}> / {challenge.goalValue}{unit}</Text>
          </Text>
          <Text style={{ color: "#FFD700", fontSize: 16, fontWeight: "bold", marginTop: 4 }}>
            あと{remaining}{unit}で目標達成！
          </Text>
        </View>

        {/* 進捗バー */}
        <View style={{ height: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, overflow: "hidden" }}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: "100%", width: `${progress}%`, borderRadius: 6 }}
          />
        </View>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "right", marginTop: 4 }}>
          {progress.toFixed(1)}% 達成
        </Text>
      </LinearGradient>
    </PressableCard>
  );
}

// 盛り上がりセクション
function EngagementSection({ challenges }: { challenges: Challenge[] }) {
  const colors = useColors();
  // 統計を計算
  const stats = useMemo(() => {
    const totalParticipants = challenges.reduce((sum, c) => sum + c.currentValue, 0);
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.status === "active").length;
    
    // 地域別集計（仮のデータ - 実際はparticipantsから集計）
    const regionStats: Record<string, number> = {};
    Object.keys(regionGroups).forEach(region => {
      regionStats[region] = Math.floor(Math.random() * totalParticipants / 6);
    });
    
    // 最も盛り上がっている地域
    const hotRegion = Object.entries(regionStats).sort((a, b) => b[1] - a[1])[0];
    
    return { totalParticipants, totalChallenges, activeChallenges, regionStats, hotRegion };
  }, [challenges]);

  if (challenges.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      {/* 統計カード */}
      <View style={{ 
        backgroundColor: "#1A1D21", 
        borderRadius: 16, 
        padding: 20,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}>
        <Text style={{ color: "#DD6500", fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>
          📊 みんなの盛り上がり
        </Text>
        
        {/* 統計数値 */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: "bold" }}>{stats.totalParticipants}</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>総参加表明</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: "bold" }}>{stats.activeChallenges}</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>開催中</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: "bold" }}>{stats.totalChallenges}</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>総チャレンジ</Text>
          </View>
        </View>

        {/* 地域ハイライト */}
        {stats.hotRegion && stats.hotRegion[1] > 0 && (
          <View style={{ 
            backgroundColor: "#2D3139", 
            borderRadius: 12, 
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🗾</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFD700", fontSize: 14, fontWeight: "bold" }}>
                {stats.hotRegion[0]}が熱い！
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                {stats.hotRegion[1]}人が参加表明中
              </Text>
            </View>
            <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
          </View>
        )}
      </View>
    </View>
  );
}

// おすすめホストセクション（遅延読み込み）
function RecommendedHostsSection() {
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
          ✨ おすすめのホスト
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
                  {host.name || "ホスト"}
                </Text>
                {host.username && (
                  <Text style={{ color: "#9CA3AF", fontSize: 10 }} numberOfLines={1}>
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

// りんくちゃんの語りかけセクション（LP風メッセージ）
function CatchCopySection() {
  const colors = useColors();
  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <LinearGradient
        colors={["#1A1D21", "#0D1117"]}
        style={{
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: "#2D3139",
        }}
      >
        {/* キャラクターと吹き出し */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 20 }}>
          <Image 
            source={characterImages.linkIdol} 
            style={{ width: 80, height: 110, marginRight: 16 }} 
            contentFit="contain" 
          />
          <View style={{ 
            flex: 1, 
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(236, 72, 153, 0.3)",
          }}>
            <Text style={{ 
              color: colors.foreground, 
              fontSize: 15, 
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              みんな、ちょっと聞いて！😊✨
            </Text>
            <Text style={{ 
              color: "#E5E7EB", 
              fontSize: 13, 
              lineHeight: 20,
            }}>
              あなたの「推し」が、大きなステージに立つ瞬間を想像してみて。
            </Text>
          </View>
        </View>

        {/* メインメッセージ */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: "#9CA3AF", 
            fontSize: 14, 
            lineHeight: 24,
            marginBottom: 16,
          }}>
            客席を埋め尽くすファンの声援、{"\n"}
            リアルタイムで流れる応援コメント、{"\n"}
            ステージを照らすスポットライト…
          </Text>
          
          <Text style={{ 
            color: "#EC4899", 
            fontSize: 18, 
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}>
            その景色を、一緒に作りたいんだ。
          </Text>

          <Text style={{ 
            color: "#9CA3AF", 
            fontSize: 14, 
            lineHeight: 24,
          }}>
            「動員ちゃれんじ」は、みんなの想いを集めて、{"\n"}
            推しの夢を叶えるためのプラットフォーム。
          </Text>
        </View>

        {/* ハイライトメッセージ */}
        <View style={{
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 3,
          borderLeftColor: "#8B5CF6",
        }}>
          <Text style={{ 
            color: "#E5E7EB", 
            fontSize: 14, 
            lineHeight: 22,
          }}>
            一人の参加表明が、二人、三人と広がって、{"\n"}
            気づいたら会場が満員になってる。
          </Text>
        </View>

        {/* キーメッセージ */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ 
            color: colors.foreground, 
            fontSize: 16, 
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 26,
          }}>
            あなたの声援が、{"\n"}
            誰かの心を動かす。
          </Text>
        </View>

        {/* CTA */}
        <View style={{
          backgroundColor: "rgba(236, 72, 153, 0.15)",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}>
          <Text style={{ 
            color: "#EC4899", 
            fontSize: 15, 
            fontWeight: "bold",
            marginBottom: 4,
          }}>
            さあ、一緒に推しの未来を作ろう！🙌
          </Text>
          <Text style={{ 
            color: "#9CA3AF", 
            fontSize: 12,
          }}>
            下のチャレンジから参加表明してみてね
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// 特徴リストセクション（別コンポーネントとして分離）
function FeatureListSection() {
  const colors = useColors();
  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <View style={{
        backgroundColor: "#1A1D21",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}>
        <Text style={{ 
          color: colors.foreground, 
          fontSize: 16, 
          fontWeight: "bold",
          marginBottom: 16,
          textAlign: "center",
        }}>
          動員ちゃれんじの特徴
        </Text>
        
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 16, 
              backgroundColor: "#EC4899", 
              alignItems: "center", justifyContent: "center",
              marginRight: 12,
            }}>
              <MaterialIcons name="favorite" size={18} color={colors.foreground} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, flex: 1 }}>
              参加表明で応援メッセージを送れる
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 16, 
              backgroundColor: "#8B5CF6", 
              alignItems: "center", justifyContent: "center",
              marginRight: 12,
            }}>
              <MaterialIcons name="people" size={18} color={colors.foreground} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, flex: 1 }}>
              友達と一緒に参加して盛り上げよう
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 16, 
              backgroundColor: "#DD6500", 
              alignItems: "center", justifyContent: "center",
              marginRight: 12,
            }}>
              <MaterialIcons name="emoji-events" size={18} color={colors.foreground} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, flex: 1 }}>
              目標達成でみんなでお祝い！
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ChallengeCard({ challenge, onPress, numColumns = 2 }: { challenge: Challenge; onPress: () => void; numColumns?: number }) {
  const colors = useColors();
  const { isDesktop } = useResponsive();
  const eventDate = new Date(challenge.eventDate);
  const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
  
  const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const typeBadge = eventTypeBadge[challenge.eventType] || eventTypeBadge.solo;
  const unit = challenge.goalUnit || goalConfig.unit;
  const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);

  // カラム数に応じた幅を計算
  const cardWidth = numColumns === 3 ? "31%" : numColumns === 2 ? "47%" : "100%";

  return (
    <AnimatedCard
      onPress={onPress}
      scaleAmount={0.98}
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        marginHorizontal: isDesktop ? 4 : 4,
        marginVertical: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2D3139",
        width: cardWidth as any,
        // UXガイドライン: 軽いドロップシャドウ
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* タイプバッジ */}
      <View style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
        <View
          style={{
            backgroundColor: typeBadge.color,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>
            {typeBadge.label}
          </Text>
        </View>
      </View>

      {/* ヘッダー画像エリア */}
      <LinearGradient
        colors={["#EC4899", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 60, justifyContent: "flex-end", paddingHorizontal: 12, paddingBottom: 8 }}
      >
        {/* 目標タイプアイコン */}
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <MaterialIcons name={goalConfig.icon as any} size={16} color="rgba(255,255,255,0.7)" />
        </View>
        {/* イベント名（会場名） */}
        {challenge.venue && (
          <View style={{ position: "absolute", top: 8, left: 8, right: 32 }}>
            <Text 
              style={{ 
                color: "rgba(255,255,255,0.9)", 
                fontSize: 11, 
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {challenge.venue}
            </Text>
          </View>
        )}
        {/* ホストプロフィール画像（遅延読み込み） */}
        <View style={{ position: "absolute", bottom: -16, left: 12 }}>
          <LazyAvatar
            source={challenge.hostProfileImage ? { uri: challenge.hostProfileImage } : undefined}
            size={32}
            fallbackColor="#EC4899"
            fallbackText={challenge.hostName?.charAt(0) || challenge.hostUsername?.charAt(0) || "?"}
            lazy={true}
          />
        </View>
      </LinearGradient>

      <View style={{ padding: 16, paddingTop: 20 }}>
        {/* タイトル */}
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginBottom: 4 }}
          numberOfLines={2}
        >
          {challenge.title}
        </Text>

        {/* ホスト名 */}
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>
          {challenge.hostName}
        </Text>

        {/* 進捗表示 */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
              {challenge.currentValue}
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}> / {challenge.goalValue}{unit}</Text>
            </Text>
          </View>
          
          {/* 進捗バー */}
          <View
            style={{
              height: 6,
              backgroundColor: "#2D3139",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 3,
              }}
            />
          </View>
          
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 4 }}>
            あと{remaining}{unit}で目標達成！
          </Text>
        </View>

        {/* カウントダウン・日付 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Countdown targetDate={challenge.eventDate} compact />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="event" size={12} color="#DD6500" />
            <Text style={{ color: "#DD6500", fontSize: 11, marginLeft: 2 }}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}

function FilterButton({ 
  label, 
  active, 
  onPress 
}: { 
  label: string; 
  active: boolean; 
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        // UXガイドライン: 最小44pxのタップエリア
        minHeight: 44,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: active ? "#DD6500" : "#2D3139",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// 空の状態表示コンポーネント（改善版）
function EmptyState({ onGenerateSamples: _onGenerateSamples }: { onGenerateSamples: () => void }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
      {/* LP風キャッチコピー（チャレンジがない時も表示） */}
      <CatchCopySection />
      
      {/* 主催者向け空状態画面 */}
      <HostEmptyState />
    </ScrollView>
  );
}

// セクションヘッダー
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const colors = useColors();
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 8,
    }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#DD6500", fontSize: 14 }}>すべて見る</Text>
          <MaterialIcons name="chevron-right" size={20} color="#DD6500" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isDesktop, isTablet, width } = useResponsive();
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 2;
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  
  const { isOffline } = useNetworkStatus();
  
  // v5.34: タブ切り替え前に他のタブのデータをプリフェッチ
  useTabPrefetch("home");
  
  const [cachedChallenges, setCachedChallenges] = useState<Challenge[] | null>(null);
  const [isStaleData, setIsStaleData] = useState(false);
  const [hasInitialCache, setHasInitialCache] = useState(false);

  // 初回ロード時にキャッシュから即座に表示（ローディングなし）
  useEffect(() => {
    const loadInitialCache = async () => {
      const cached = await getCachedData<Challenge[]>(PREFETCH_KEYS.CHALLENGES);
      if (cached && cached.data.length > 0) {
        setCachedChallenges(cached.data);
        setIsStaleData(cached.isStale);
        setHasInitialCache(true);
      }
    };
    loadInitialCache();
  }, []);

  // 無限スクロール対応のページネーションクエリ
  const {
    data: paginatedData,
    isLoading: isApiLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = trpc.events.listPaginated.useInfiniteQuery(
    { limit: 20, filter: filter as "all" | "solo" | "group" },
    {
      enabled: !isOffline,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      // キャッシュがある場合は即座に表示（バックグラウンドで更新）
      staleTime: 2 * 60 * 1000, // 2分間はキャッシュを新鮮とみなす
    }
  );

  // ページネーションデータをフラットな配列に変換
  const apiChallenges = paginatedData?.pages.flatMap((page) => page.items) ?? [];
  
  // キャッシュ優先表示: APIデータがあればそれを使用、なければキャッシュを使用
  const challenges = apiChallenges.length > 0 ? apiChallenges : (cachedChallenges ?? []);
  
  // ローディング状態: データがあればローディングを表示しない（スケルトンを最小化）
  // キャッシュがあるか、APIデータがあれば即座に表示
  // v5.33: 初回表示を高速化 - スケルトンは最小限にし、UIを先に表示
  const isLoading = false; // スケルトンを表示しない（UIを即座に表示）
  const isDataLoading = challenges.length === 0 && isApiLoading && !hasInitialCache;
  // 検索結果の無限スクロール対応
  const {
    data: searchPaginatedData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    refetch: refetchSearch,
  } = trpc.search.challengesPaginated.useInfiniteQuery(
    { query: searchQuery, limit: 20 },
    {
      enabled: searchQuery.length > 0 && !isOffline,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );

  // 検索結果をフラットな配列に変換
  const searchResults = searchPaginatedData?.pages.flatMap((page) => page.items) ?? [];
  const { data: categoriesData } = trpc.categories.list.useQuery(undefined, {
    enabled: !isOffline,
  });

  // チャレンジデータをキャッシュに保存（両方のキャッシュシステムに保存）
  useEffect(() => {
    if (apiChallenges && apiChallenges.length > 0) {
      // 既存のオフラインキャッシュ
      setCache(CACHE_KEYS.challenges, apiChallenges);
      // 新しいプリフェッチキャッシュ（即座表示用）
      setCachedData(PREFETCH_KEYS.CHALLENGES, apiChallenges);
      setIsStaleData(false);
    }
  }, [apiChallenges]);

  // チャレンジの画像をプリフェッチ（事前読み込み）
  useEffect(() => {
    if (challenges && challenges.length > 0) {
      // 最初の10件の画像をプリフェッチ
      prefetchChallengeImages(challenges.slice(0, 10));
    }
  }, [challenges]);

  // オフライン時はキャッシュから読み込み
  useEffect(() => {
    if (isOffline) {
      getCache<Challenge[]>(CACHE_KEYS.challenges).then((cached) => {
        if (cached) {
          setCachedChallenges(cached.data);
          setIsStaleData(cached.isStale);
        }
      });
    } else {
      setCachedChallenges(null);
    }
  }, [isOffline]);

  // オンライン時はAPIデータ、オフライン時はキャッシュデータを使用
  const effectiveChallenges = isOffline ? cachedChallenges : challenges;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  // フィルター適用
  const displayChallenges = isSearching && searchResults 
    ? searchResults.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter !== "all" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      })
    : (effectiveChallenges?.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter !== "all" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      }) || []);

  // 注目のチャレンジ（最も進捗が高いもの、または最も参加者が多いもの）
  const featuredChallenge = useMemo(() => {
    if (!effectiveChallenges || effectiveChallenges.length === 0) return null;
    return effectiveChallenges.reduce((best, current) => {
      const bestProgress = best.currentValue / best.goalValue;
      const currentProgress = current.currentValue / current.goalValue;
      // 進捗率が高い、または参加者が多いものを選択
      if (currentProgress > bestProgress || (currentProgress === bestProgress && current.currentValue > best.currentValue)) {
        return current;
      }
      return best;
    });
  }, [challenges]);

  // チャレンジ一覧（注目のチャレンジを除く）
  const otherChallenges = useMemo(() => {
    if (!displayChallenges || displayChallenges.length === 0) return [];
    if (!featuredChallenge) return displayChallenges;
    return displayChallenges.filter(c => c.id !== featuredChallenge.id);
  }, [displayChallenges, featuredChallenge]);

  // ヘッダーコンポーネント（FlatListのListHeaderComponent用）
  // v5.33: 初期表示を高速化 - 検索バーとフィルターを最初に表示
  const ListHeader = () => (
    <>
      {/* チャレンジ一覧ヘッダー（最初に表示） */}
      <SectionHeader title="📋 チャレンジ一覧" />

      {/* 検索バー */}
      <View style={{ marginHorizontal: 16, marginTop: 8 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1A1D21",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: searchQuery ? "#DD6500" : "#2D3139",
        }}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setIsSearching(text.length > 0);
            }}
            placeholder="チャレンジを検索..."
            placeholderTextColor="#6B7280"
            style={{
              flex: 1,
              marginLeft: 8,
              color: colors.foreground,
              fontSize: 14,
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setIsSearching(false); }}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* タイプフィルター */}
      <View style={{ flexDirection: "row", marginTop: 16, marginHorizontal: 16 }}>
        <FilterButton label="すべて" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterButton label="グループ" active={filter === "group"} onPress={() => setFilter("group")} />
        <FilterButton label="ソロ" active={filter === "solo"} onPress={() => setFilter("solo")} />
      </View>

      {/* カテゴリフィルター */}
      {categoriesData && categoriesData.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8, marginHorizontal: 16 }}
        >
          <TouchableOpacity
            onPress={() => setCategoryFilter(null)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: categoryFilter === null ? "#8B5CF6" : "#1E293B",
              marginRight: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 12 }}>全カテゴリ</Text>
          </TouchableOpacity>
          {categoriesData.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryFilter(cat.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: categoryFilter === cat.id ? "#8B5CF6" : "#1E293B",
                marginRight: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ marginRight: 4 }}>{cat.icon}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12 }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 3ステップ説明（初回訪問時のみ表示） */}
      {!isLoading && displayChallenges.length === 0 && (
        <OnboardingSteps />
      )}
      
      {/* データ読み込み中のインジケーター */}
      {isDataLoading && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      )}
    </>
  );
  
  // フッターコンポーネント（チャレンジ一覧の後に表示）
  // v5.33: 重いセクションをフッターに移動して初期表示を高速化
  const ListFooterSections = () => (
    <>
      {/* 注目のチャレンジ */}
      {featuredChallenge && !isSearching && (
        <FeaturedChallenge 
          challenge={featuredChallenge as Challenge} 
          onPress={() => handleChallengePress(featuredChallenge.id)} 
        />
      )}

      {/* オフラインキャッシュインジケーター */}
      {isOffline && isStaleData && (
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <CachedDataIndicator isStale={isStaleData} />
        </View>
      )}

      {/* オフライン同期インジケーター */}
      <SyncStatusIndicator />

      {/* 盛り上がりセクション */}
      {effectiveChallenges && effectiveChallenges.length > 0 && !isSearching && (
        <EngagementSection challenges={effectiveChallenges as Challenge[]} />
      )}

      {/* おすすめホストセクション */}
      {!isSearching && <RecommendedHostsSection />}

      {/* LP風キャッチコピー */}
      {!isSearching && <CatchCopySection />}
    </>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <AppHeader 
        title="君斗りんくの動員ちゃれんじ" 
        showCharacters={true}
        isDesktop={isDesktop}
        showMenu={true}
      />

      {/* v5.34: スケルトンを完全に削除し、常にFlatListを表示 */}
      {displayChallenges.length > 0 || isDataLoading ? (
        <FlatList
          key={`grid-${numColumns}`}
          data={isSearching ? displayChallenges : otherChallenges}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          ListHeaderComponent={ListHeader}
          renderItem={({ item, index }) => {
            // 最初のアイテムのみチュートリアルハイライト対象
            if (index === 0) {
              return (
                <TutorialHighlightTarget tutorialStep={1} userType="fan">
                  <ChallengeCard challenge={item as Challenge} onPress={() => handleChallengePress(item.id)} numColumns={numColumns} />
                </TutorialHighlightTarget>
              );
            }
            return (
              <ChallengeCard challenge={item as Challenge} onPress={() => handleChallengePress(item.id)} numColumns={numColumns} />
            );
          }}
          refreshControl={
            <SimpleRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // 無限スクロール設定
          onEndReached={() => {
            if (isSearching) {
              if (hasNextSearchPage && !isFetchingNextSearchPage) {
                fetchNextSearchPage();
              }
            } else {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <>
              {/* ページネーションインジケーター */}
              {(isSearching ? isFetchingNextSearchPage : isFetchingNextPage) ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
                </View>
              ) : (isSearching ? hasNextSearchPage : hasNextPage) ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#6B7280" }}>スクロールしてもっと見る</Text>
                </View>
              ) : null}
              {/* 追加セクション（チャレンジ一覧の後に表示） */}
              <ListFooterSections />
            </>
          }
          contentContainerStyle={{ 
            paddingHorizontal: isDesktop ? 24 : 8, 
            paddingBottom: 100,
            backgroundColor: "#0D1117",
            maxWidth: isDesktop ? 1200 : undefined,
            alignSelf: isDesktop ? "center" : undefined,
            width: isDesktop ? "100%" : undefined,
          }}
          style={{ backgroundColor: "#0D1117" }}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: isDesktop ? 16 : 8 }}
          // パフォーマンス最適化
          windowSize={5}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          removeClippedSubviews={Platform.OS !== "web"}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <EmptyState onGenerateSamples={refetch} />
      )}
    </ScreenContainer>
  );
}
