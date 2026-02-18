-- データベースインデックス追加スクリプト
-- パフォーマンス向上のため、頻繁に使用されるクエリにインデックスを追加

-- ユーザーテーブル
-- email検索の高速化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- twitter_id検索の高速化（OAuth認証時）
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);

-- created_at順のソート高速化
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- イベントテーブル
-- user_id検索の高速化（ユーザーの作成イベント一覧）
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- status検索の高速化（公開イベント一覧）
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- event_date順のソート高速化
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC);

-- 複合インデックス: user_id + status（ユーザーの公開イベント一覧）
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status);

-- チャレンジテーブル
-- event_id検索の高速化（イベントのチャレンジ一覧）
CREATE INDEX IF NOT EXISTS idx_challenges_event_id ON challenges(event_id);

-- status検索の高速化（公開チャレンジ一覧）
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- 複合インデックス: event_id + status（イベントの公開チャレンジ一覧）
CREATE INDEX IF NOT EXISTS idx_challenges_event_status ON challenges(event_id, status);

-- 参加履歴テーブル
-- user_id検索の高速化（ユーザーの参加履歴）
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(user_id);

-- challenge_id検索の高速化（チャレンジの参加者一覧）
CREATE INDEX IF NOT EXISTS idx_participations_challenge_id ON participations(challenge_id);

-- completed_at順のソート高速化
CREATE INDEX IF NOT EXISTS idx_participations_completed_at ON participations(completed_at DESC);

-- 複合インデックス: user_id + challenge_id（重複参加チェック）
CREATE INDEX IF NOT EXISTS idx_participations_user_challenge ON participations(user_id, challenge_id);

-- 複合インデックス: challenge_id + completed_at（チャレンジの完了者一覧）
CREATE INDEX IF NOT EXISTS idx_participations_challenge_completed ON participations(challenge_id, completed_at DESC);

-- 通知テーブル
-- user_id検索の高速化（ユーザーの通知一覧）
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- is_read検索の高速化（未読通知一覧）
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- created_at順のソート高速化
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 複合インデックス: user_id + is_read + created_at（ユーザーの未読通知一覧）
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

-- メッセージテーブル
-- sender_id検索の高速化（送信メッセージ一覧）
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- receiver_id検索の高速化（受信メッセージ一覧）
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- created_at順のソート高速化
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 複合インデックス: sender_id + receiver_id + created_at（会話履歴）
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);

-- インデックス追加完了
SELECT 'データベースインデックスの追加が完了しました' AS status;
