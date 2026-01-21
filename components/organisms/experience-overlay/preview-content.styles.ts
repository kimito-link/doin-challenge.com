/**
 * preview-content.styles.ts
 * 
 * PreviewContentコンポーネント専用のスタイル定義
 * v6.35: スタイルコロケーション対応
 */
import { StyleSheet } from "react-native";
import { color } from "@/theme/tokens";

export const styles = StyleSheet.create({
  // プレビューコンテナ（共通）
  previewContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  
  // Map preview
  mapPreview: {
    width: "100%",
  },
  mapHeader: {
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mapRegion: {
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
    alignItems: "center",
  },
  mapRegionName: {
    fontSize: 12,
    color: color.textWhite,
    fontWeight: "bold",
  },
  mapRegionCount: {
    fontSize: 16,
    color: color.textWhite,
    fontWeight: "bold",
    marginTop: 4,
  },
  
  // Participant styles
  participantRow: {
    flexDirection: "row",
    gap: 8,
  },
  participantCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
  },
  participantName: {
    fontSize: 12,
    color: color.textWhite,
    fontWeight: "bold",
  },
  participantPref: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  
  // Chart preview
  chartPreview: {
    width: "100%",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 80,
  },
  chartBarItem: {
    alignItems: "center",
  },
  chartBarFill: {
    width: 40,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Notification preview
  notificationPreview: {
    backgroundColor: color.textWhite,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color.accentPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.overlayDark,
  },
  notificationBody: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  
  // Badge/Crown preview
  badgePreview: {
    alignItems: "center",
    width: "100%",
  },
  crownIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.rankGold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  crownEmoji: {
    fontSize: 32,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 12,
  },
  badgeItem: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    minWidth: 70,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 10,
    color: color.textWhite,
  },
  
  // Comment preview
  commentPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
  },
  commentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  commentTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },
  commentText: {
    fontSize: 14,
    color: color.textWhite,
    lineHeight: 22,
  },
  
  // Invite preview
  invitePreview: {
    alignItems: "center",
    width: "100%",
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 16,
  },
  inviteCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  inviteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButtonActive: {
    backgroundColor: color.successLight,
  },
  inviteButtonText: {
    fontSize: 24,
    color: color.textWhite,
    fontWeight: "bold",
  },
  inviteButtonTextActive: {
    color: color.overlayDark,
  },
  inviteCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: color.successLight,
  },
  inviteDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Form preview
  formPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formInputText: {
    fontSize: 14,
    color: color.textWhite,
  },
  formSelect: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formSelectText: {
    fontSize: 14,
    color: color.textWhite,
  },
  formSelectArrow: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  
  // Prefecture preview
  prefectureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
  },
  prefectureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  prefectureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  prefectureButtonSelected: {
    backgroundColor: color.accentPrimary,
    borderColor: color.accentPrimary,
  },
  prefectureText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  prefectureTextSelected: {
    fontSize: 14,
    color: color.textWhite,
    fontWeight: "bold",
  },
  
  // Profile preview
  profilePreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: color.textWhite,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  profileBio: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  profileFollowers: {
    fontSize: 12,
    color: color.rankGold,
    marginTop: 4,
  },
  influencerBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  influencerBadgeText: {
    fontSize: 10,
    color: color.rankGold,
    fontWeight: "bold",
  },
  followButton: {
    backgroundColor: color.twitter,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  
  // Gender preview
  genderPreview: {
    width: "100%",
    maxWidth: 320,
  },
  genderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  genderChart: {
    flexDirection: "row",
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  genderBar: {
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: color.textWhite,
  },
  genderLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  genderLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  genderLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  genderLegendText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Challenge card preview
  challengeCardPreview: {
    backgroundColor: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.5)",
  },
  challengeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeCardCategory: {
    fontSize: 12,
    color: color.accentPrimary,
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeCardDays: {
    fontSize: 12,
    color: color.textWhite,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
  },
  challengeCardHost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  challengeCardAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeCardAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: color.textWhite,
  },
  challengeCardHostName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  challengeCardProgress: {
    gap: 8,
  },
  challengeCardProgressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  challengeCardProgressFill: {
    height: "100%",
    backgroundColor: color.successLight,
    borderRadius: 4,
  },
  challengeCardProgressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    textAlign: "center",
  },
  
  // Progress bar preview
  progressBarPreview: {
    width: "100%",
    maxWidth: 320,
  },
  progressBarTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: color.successLight,
    borderRadius: 8,
  },
  progressBarLabels: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  progressBarCurrent: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.successLight,
  },
  progressBarGoal: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressBarMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBarMilestone: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressBarMilestoneCompleted: {
    backgroundColor: "rgba(74, 222, 128, 0.3)",
  },
  progressBarMilestoneText: {
    fontSize: 10,
    color: color.textWhite,
  },
  
  // Countdown preview
  countdownPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  countdownTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  countdownNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: color.textWhite,
  },
  countdownLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
  },
  countdownDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Achievement preview
  achievementPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.rankGold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementEmoji: {
    fontSize: 40,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  achievementNames: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  achievementName: {
    fontSize: 12,
    color: color.textWhite,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  achievementMore: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  // Share preview
  sharePreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  shareTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  shareCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  shareCardText: {
    fontSize: 12,
    color: color.textWhite,
    textAlign: "center",
  },
  
  // Ranking preview
  rankingPreview: {
    width: "100%",
    maxWidth: 320,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  rankingList: {
    gap: 8,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  rankingItemHighlight: {
    backgroundColor: "rgba(236, 72, 153, 0.3)",
    borderWidth: 1,
    borderColor: color.accentPrimary,
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textWhite,
    width: 24,
    textAlign: "center",
  },
  rankingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankingAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  rankingName: {
    flex: 1,
    fontSize: 14,
    color: color.textWhite,
  },
  rankingScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.successLight,
  },
  
  // DM preview
  dmPreview: {
    width: "100%",
    maxWidth: 320,
  },
  dmTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  dmMessages: {
    gap: 8,
  },
  dmMessageReceived: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  dmMessageSent: {
    backgroundColor: color.accentPrimary,
    borderRadius: 12,
    borderTopRightRadius: 4,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  dmMessageText: {
    fontSize: 14,
    color: color.textWhite,
  },
  
  // Reminder preview
  reminderPreview: {
    width: "100%",
    maxWidth: 320,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  reminderOptions: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  reminderOptionText: {
    fontSize: 14,
    color: color.textWhite,
  },
  reminderToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 2,
  },
  reminderToggleOn: {
    backgroundColor: color.successLight,
  },
  reminderToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.textWhite,
  },
  
  // Ticket preview
  ticketPreview: {
    width: "100%",
    maxWidth: 320,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  ticketList: {
    gap: 8,
    marginBottom: 12,
  },
  ticketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  ticketType: {
    fontSize: 14,
    color: color.textWhite,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.successLight,
  },
  ticketButton: {
    backgroundColor: color.accentPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  ticketButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
  },
  
  // Cheer preview
  cheerPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  cheerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
  },
  cheerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cheerButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
  },
  cheerEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cheerCount: {
    fontSize: 12,
    color: color.textWhite,
    fontWeight: "bold",
  },
  
  // Stats preview
  statsPreview: {
    width: "100%",
    maxWidth: 320,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statsItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.textWhite,
  },
  statsLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  
  // Celebration preview
  celebrationPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.rankGold,
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: color.textWhite,
    marginBottom: 16,
  },
  celebrationConfetti: {
    flexDirection: "row",
    gap: 16,
  },
  confettiItem: {
    fontSize: 32,
  },
});
