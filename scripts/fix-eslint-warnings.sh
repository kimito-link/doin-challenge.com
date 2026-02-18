#!/bin/bash
# ESLint警告を自動修正するスクリプト

# 未使用Platformインポートを削除
sed -i 's/, Platform//g' app/(tabs)/index.tsx
sed -i 's/, Platform//g' app/(tabs)/mypage.tsx
sed -i 's/, Platform//g' app/edit-challenge/[id].tsx
sed -i 's/, Platform//g' app/edit-participation/[id].tsx
sed -i 's/, Platform//g' app/event/[id].tsx

# 未使用routerを削除
sed -i '/const router = useRouter();/d' app/logout.tsx
sed -i '/const router = useRouter();/d' app/navigation-dashboard.tsx
sed -i '/const router = useRouter();/d' app/oauth/index.tsx
sed -i '/const router = useRouter();/d' app/organisms/account-switcher.tsx

# 未使用Viewインポートを削除
sed -i 's/View, //g' app/_layout.tsx
sed -i 's/View, //g' components/atoms/fade-view.tsx

# 未使用ActivityIndicator, colorを削除
sed -i 's/, ActivityIndicator//g' app/_layout.tsx
sed -i '/const color = useColors();/d' app/_layout.tsx

# 未使用型定義を削除
sed -i 's/, NoChallengesState, NoParticipationsState//g' app/(tabs)/mypage.tsx

echo "ESLint警告の自動修正が完了しました"
