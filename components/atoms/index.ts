/**
 * Atoms - 基本UI要素
 * 
 * 最小単位のUIコンポーネント。他のコンポーネントに依存しない。
 * v6.22: components/ui/からの再エクスポートに統一
 */

// ===== 新UIコンポーネント（components/ui/から再エクスポート） =====
// Button系
export { 
  Button, 
  IconButton, 
  FAB,
  type ButtonProps, 
  type IconButtonProps,
  type FABProps,
  type ButtonVariant, 
  type ButtonSize 
} from "@/components/ui/button";

// Input系
export { 
  Input, 
  SearchInput, 
  type InputProps, 
  type SearchInputProps 
} from "@/components/ui/input";

// Card系
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardSection,
  type CardProps,
  type CardHeaderProps,
  type CardFooterProps,
  type CardSectionProps,
} from "@/components/ui/card";

// Modal系
export { 
  Modal, 
  ConfirmModal, 
  AlertModal,
  type ModalProps,
  type ConfirmModalProps,
  type AlertModalProps,
} from "@/components/ui/modal";

// List系
export { 
  ListItem, 
  Avatar, 
  Badge as ListBadge,
  type ListItemProps,
  type AvatarProps,
  type BadgeProps as ListBadgeProps,
} from "@/components/ui/list";

// Section系
export { 
  SectionHeader, 
  EmptyState, 
  Divider, 
  Spacer,
  type SectionHeaderProps,
  type EmptyStateProps,
  type DividerProps,
  type SpacerProps,
} from "@/components/ui/section";

// ===== レガシーコンポーネント（段階的に移行） =====
// Text/Label系
export { Text } from "./text";

// Icon系
export { IconSymbol } from "./icon-symbol";

// Feedback系
export { Toast, ToastProvider, useToast } from "./toast";
export { SyncStatusIndicator } from "./sync-status-indicator";

// Animation系
export { BlinkingCharacter, BlinkingLink } from "./blinking-character";
// HelloWave removed (unused)

// Navigation系
// ExternalLink removed (unused)
export { HapticTab } from "./haptic-tab";

// Utility系
export { Countdown } from "./countdown";

// View系
export { ThemedView } from "./themed-view";


