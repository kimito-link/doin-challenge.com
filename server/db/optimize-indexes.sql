-- データベース最適化: インデックス追加
-- パフォーマンス向上のため、頻繁にクエリされるカラムにインデックスを追加

-- usersテーブル
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_login_method ON users(loginMethod);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);

-- achievementsテーブル
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(userId);
CREATE INDEX IF NOT EXISTS idx_achievements_created_at ON achievements(createdAt);

-- badgesテーブル
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(userId);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);

-- challengesテーブル
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(createdAt);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- challenge_membersテーブル
CREATE INDEX IF NOT EXISTS idx_challenge_members_challenge_id ON challenge_members(challengeId);
CREATE INDEX IF NOT EXISTS idx_challenge_members_user_id ON challenge_members(userId);
CREATE INDEX IF NOT EXISTS idx_challenge_members_status ON challenge_members(status);

-- challenge_statsテーブル
CREATE INDEX IF NOT EXISTS idx_challenge_stats_challenge_id ON challenge_stats(challengeId);
CREATE INDEX IF NOT EXISTS idx_challenge_stats_user_id ON challenge_stats(userId);

-- cheersテーブル
CREATE INDEX IF NOT EXISTS idx_cheers_from_user_id ON cheers(fromUserId);
CREATE INDEX IF NOT EXISTS idx_cheers_to_user_id ON cheers(toUserId);
CREATE INDEX IF NOT EXISTS idx_cheers_created_at ON cheers(createdAt);

-- direct_messagesテーブル
CREATE INDEX IF NOT EXISTS idx_direct_messages_from_user_id ON direct_messages(fromUserId);
CREATE INDEX IF NOT EXISTS idx_direct_messages_to_user_id ON direct_messages(toUserId);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(createdAt);

-- followsテーブル
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(followerId);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(followingId);

-- invitationsテーブル
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviterId);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(createdAt);

-- invitation_usesテーブル
CREATE INDEX IF NOT EXISTS idx_invitation_uses_invitation_id ON invitation_uses(invitationId);
CREATE INDEX IF NOT EXISTS idx_invitation_uses_user_id ON invitation_uses(userId);

-- notificationsテーブル
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(createdAt);

-- participationsテーブル
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(userId);
CREATE INDEX IF NOT EXISTS idx_participations_event_id ON participations(eventId);
CREATE INDEX IF NOT EXISTS idx_participations_status ON participations(status);

-- twitter_user_cacheテーブル
CREATE INDEX IF NOT EXISTS idx_twitter_user_cache_twitter_id ON twitter_user_cache(twitterId);
CREATE INDEX IF NOT EXISTS idx_twitter_user_cache_updated_at ON twitter_user_cache(updatedAt);

-- 複合インデックス（よく一緒に検索されるカラム）
CREATE INDEX IF NOT EXISTS idx_challenge_members_challenge_user ON challenge_members(challengeId, userId);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, isRead);
CREATE INDEX IF NOT EXISTS idx_participations_user_event ON participations(userId, eventId);
