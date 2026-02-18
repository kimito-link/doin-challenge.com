# date-picker.tsx のaccessibilityRole追加箇所

## 対象Pressable（8箇所）

1. **146行目**: 入力フィールド（日付選択ボタン）
   - accessibilityRole: "button"
   - accessibilityLabel: value ? `選択された日付: ${formatDisplayDate(value)}` : placeholder

2. **159行目**: モーダル背景（閉じるボタン）
   - accessibilityRole: "button"
   - accessibilityLabel: "カレンダーを閉じる"

3. **191行目**: 日付セル（カレンダー内の各日付）
   - accessibilityRole: "button"
   - accessibilityLabel: `${viewYear}年${viewMonth + 1}月${day}日`
   - accessibilityState: { selected: isSelected, disabled: isDisabled }

4. **217行目**: 前月ボタン
   - accessibilityRole: "button"
   - accessibilityLabel: "前月"

5. **233行目**: 次月ボタン
   - accessibilityRole: "button"
   - accessibilityLabel: "次月"

6. **251行目**: 今日ボタン
   - accessibilityRole: "button"
   - accessibilityLabel: "今日"

7. **276行目**: キャンセルボタン
   - accessibilityRole: "button"
   - accessibilityLabel: "キャンセル"

8. **280行目**: モーダルコンテンツ（イベント伝播防止用）
   - accessibilityRole: なし（イベント伝播防止のみ）

## 注意事項
- 8番目のPressableはイベント伝播防止のためのもので、accessibilityRoleは不要
- 実質的には7箇所のPressableにaccessibilityRoleを追加する必要がある
