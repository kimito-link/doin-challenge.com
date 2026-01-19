import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// 追体験のスライドタイプ
export type ExperienceSlide = {
  id: string;
  /** キャラクター */
  character: "rinku" | "konta" | "tanune" | "kimitolink";
  /** メインメッセージ */
  message: string;
  /** サブメッセージ（説明） */
  subMessage?: string;
  /** 心理描写（吹き出しで表示） */
  thought?: string;
  /** プレビュータイプ */
  previewType?: 
    | "map" 
    | "participants" 
    | "chart" 
    | "notification" 
    | "crown" 
    | "comment" 
    | "invite" 
    | "form" 
    | "prefecture" 
    | "profile" 
    | "influencer" 
    | "gender" 
    | "none"
    // 新しいプレビュータイプ
    | "challenge-card"
    | "progress-bar"
    | "countdown"
    | "achievement"
    | "share"
    | "ranking"
    | "dm"
    | "reminder"
    | "ticket"
    | "cheer"
    | "badge"
    | "stats"
    | "celebration";
  /** 背景色 */
  backgroundColor?: string;
  /** ステップ番号（チュートリアル用） */
  stepNumber?: number;
  /** ステップタイトル（チュートリアル用） */
  stepTitle?: string;
};

// ============================================
// 主催者視点の追体験スライド（大幅拡充版）
// ============================================
export const ORGANIZER_EXPERIENCE_SLIDES: ExperienceSlide[] = [
  // --- STEP 1: チャレンジを作成する ---
  {
    id: "org-intro",
    character: "kimitolink",
    message: "主催者の追体験へようこそ！",
    subMessage: "チャレンジを作成して、ファンと一緒に目標を達成する流れを体験しよう",
    thought: "これから動員ちゃれんじの使い方を説明するね！",
    previewType: "none",
    backgroundColor: "#1a1a2e",
    stepNumber: 0,
    stepTitle: "はじめに",
  },
  {
    id: "org-1",
    character: "rinku",
    message: "まずはチャレンジを作成！",
    subMessage: "ライブやイベントの目標人数を設定して、ファンに参加を呼びかけよう",
    thought: "来月のライブ、100人集めたいな...\nチャレンジを作って告知しよう！",
    previewType: "form",
    backgroundColor: "#16213e",
    stepNumber: 1,
    stepTitle: "チャレンジ作成",
  },
  {
    id: "org-2",
    character: "konta",
    message: "チケット情報も設定できる",
    subMessage: "前売り・当日券の価格や購入リンクを設定して、ファンが迷わないように",
    thought: "チケット情報も入れておけば\nファンが購入しやすいね",
    previewType: "ticket",
    backgroundColor: "#1a1a2e",
    stepNumber: 1,
    stepTitle: "チャレンジ作成",
  },
  {
    id: "org-3",
    character: "tanune",
    message: "カテゴリを選んで見つけやすく",
    subMessage: "アイドル、バンド、VTuberなど、カテゴリを設定すると検索されやすい",
    thought: "カテゴリを設定しておけば\n新しいファンにも見つけてもらえるかも！",
    previewType: "chart",
    backgroundColor: "#16213e",
    stepNumber: 1,
    stepTitle: "チャレンジ作成",
  },

  // --- STEP 2: 告知・拡散する ---
  {
    id: "org-4",
    character: "rinku",
    message: "SNSでシェアして告知！",
    subMessage: "作成したチャレンジをTwitterでシェアして、ファンに知らせよう",
    thought: "チャレンジ作成完了！\nさっそくTwitterで告知しよう",
    previewType: "share",
    backgroundColor: "#1a1a2e",
    stepNumber: 2,
    stepTitle: "告知・拡散",
  },
  {
    id: "org-5",
    character: "konta",
    message: "OGP画像が自動生成される",
    subMessage: "シェアすると、進捗状況が見えるカードが自動で作られる",
    thought: "シェアしたら自動でカード画像が\n作られるから便利だね",
    previewType: "challenge-card",
    backgroundColor: "#16213e",
    stepNumber: 2,
    stepTitle: "告知・拡散",
  },

  // --- STEP 3: 参加者が増えていく ---
  {
    id: "org-6",
    character: "tanune",
    message: "参加表明が届き始める！",
    subMessage: "ファンからの参加表明と応援メッセージが届く",
    thought: "わ！さっそく参加表明が来た！\n嬉しいな〜",
    previewType: "notification",
    backgroundColor: "#1a1a2e",
    stepNumber: 3,
    stepTitle: "参加者増加",
  },
  {
    id: "org-7",
    character: "rinku",
    message: "進捗バーがどんどん伸びる！",
    subMessage: "目標に向かって進捗バーが伸びていく様子が見える",
    thought: "もう30%達成！\nこのペースなら100人いけそう！",
    previewType: "progress-bar",
    backgroundColor: "#16213e",
    stepNumber: 3,
    stepTitle: "参加者増加",
  },
  {
    id: "org-8",
    character: "konta",
    message: "地図で参加者の分布が見える",
    subMessage: "どの地域からファンが来るかリアルタイムで確認できる",
    thought: "東京だけじゃなくて\n大阪や福岡からも参加してくれてる！",
    previewType: "map",
    backgroundColor: "#1a1a2e",
    stepNumber: 3,
    stepTitle: "参加者増加",
  },

  // --- STEP 4: ファンの声を聞く ---
  {
    id: "org-9",
    character: "tanune",
    message: "応援メッセージを読もう",
    subMessage: "ファンからの熱いメッセージで、モチベーションアップ！",
    thought: "「絶対行きます！」「楽しみにしてます！」\nこういうメッセージ、本当に嬉しい...",
    previewType: "comment",
    backgroundColor: "#16213e",
    stepNumber: 4,
    stepTitle: "ファンの声",
  },
  {
    id: "org-10",
    character: "rinku",
    message: "素敵なコメントをピックアップ",
    subMessage: "特に嬉しいコメントは、応援動画に使うこともできる",
    thought: "このコメント、応援動画に使いたいな\nピックアップしておこう",
    previewType: "comment",
    backgroundColor: "#1a1a2e",
    stepNumber: 4,
    stepTitle: "ファンの声",
  },

  // --- STEP 5: データを分析する ---
  {
    id: "org-11",
    character: "konta",
    message: "統計ダッシュボードで分析",
    subMessage: "参加者の推移、地域分布、時間帯別の参加状況がわかる",
    thought: "夜の20時〜22時に参加表明が多いな\n告知もこの時間帯にしよう",
    previewType: "stats",
    backgroundColor: "#16213e",
    stepNumber: 5,
    stepTitle: "データ分析",
  },
  {
    id: "org-12",
    character: "tanune",
    message: "男女比もチェック",
    subMessage: "ファンの属性がわかると、イベント企画の参考になる",
    thought: "男性60%、女性40%か...\n女性向けの企画も考えてみよう",
    previewType: "gender",
    backgroundColor: "#1a1a2e",
    stepNumber: 5,
    stepTitle: "データ分析",
  },
  {
    id: "org-13",
    character: "rinku",
    message: "地域データで次の会場選び",
    subMessage: "どの地域にファンが多いかわかるから、ツアー計画に活かせる",
    thought: "福岡からの参加者が多いな...\n次は福岡でもライブやってみたい！",
    previewType: "map",
    backgroundColor: "#16213e",
    stepNumber: 5,
    stepTitle: "データ分析",
  },

  // --- STEP 6: 目標達成！ ---
  {
    id: "org-14",
    character: "kimitolink",
    message: "目標達成おめでとう！🎉",
    subMessage: "100人の参加表明が集まった！達成記念ページが自動で作られる",
    thought: "やった！100人達成！\nみんなのおかげだ！",
    previewType: "celebration",
    backgroundColor: "#1a1a2e",
    stepNumber: 6,
    stepTitle: "目標達成",
  },
  {
    id: "org-15",
    character: "rinku",
    message: "達成記念ページをシェア",
    subMessage: "参加者全員の名前が載った記念ページをSNSでシェアしよう",
    thought: "達成記念ページ、みんなにシェアしよう！\n参加してくれた人の名前も載ってる",
    previewType: "share",
    backgroundColor: "#16213e",
    stepNumber: 6,
    stepTitle: "目標達成",
  },

  // --- STEP 7: 次のチャレンジへ ---
  {
    id: "org-16",
    character: "konta",
    message: "次はもっと大きな会場で！",
    subMessage: "参加者数がわかるから、大きな会場も安心して借りられる",
    thought: "100人集まったから、\n次は200人の会場でも大丈夫そう！",
    previewType: "progress-bar",
    backgroundColor: "#1a1a2e",
    stepNumber: 7,
    stepTitle: "次のステップ",
  },
  {
    id: "org-17",
    character: "tanune",
    message: "テンプレートで簡単作成",
    subMessage: "前回のチャレンジをテンプレートにして、次回は簡単に作成できる",
    thought: "テンプレート機能があるから\n次のチャレンジ作成も楽ちん！",
    previewType: "form",
    backgroundColor: "#16213e",
    stepNumber: 7,
    stepTitle: "次のステップ",
  },
  {
    id: "org-end",
    character: "kimitolink",
    message: "主催者の追体験は以上です！",
    subMessage: "さあ、あなたもチャレンジを作成して、ファンと一緒に目標を達成しよう！",
    thought: "動員ちゃれんじで、\nファンとの絆を深めよう！",
    previewType: "none",
    backgroundColor: "#1a1a2e",
    stepNumber: 8,
    stepTitle: "おわりに",
  },
];

// ============================================
// ファン視点の追体験スライド（大幅拡充版）
// ============================================
export const FAN_EXPERIENCE_SLIDES: ExperienceSlide[] = [
  // --- イントロ ---
  {
    id: "fan-intro",
    character: "rinku",
    message: "ファンの追体験へようこそ！",
    subMessage: "推しのチャレンジに参加して、ファン同士で繋がる流れを体験しよう",
    thought: "これからファンとしての使い方を説明するね！",
    previewType: "none",
    backgroundColor: "#1a1a2e",
    stepNumber: 0,
    stepTitle: "はじめに",
  },

  // --- STEP 1: チャレンジを発見する ---
  {
    id: "fan-1",
    character: "konta",
    message: "推しのチャレンジを発見！",
    subMessage: "ホーム画面で注目のチャレンジや、カテゴリ別のチャレンジを探せる",
    thought: "お、推しの新しいチャレンジがある！\nさっそくチェックしよう",
    previewType: "challenge-card",
    backgroundColor: "#16213e",
    stepNumber: 1,
    stepTitle: "チャレンジ発見",
  },
  {
    id: "fan-2",
    character: "tanune",
    message: "通知で見逃さない！",
    subMessage: "お気に入りアーティストを登録しておくと、新しいチャレンジが通知される",
    thought: "通知が来た！\n推しの新しいチャレンジだ！",
    previewType: "notification",
    backgroundColor: "#1a1a2e",
    stepNumber: 1,
    stepTitle: "チャレンジ発見",
  },
  {
    id: "fan-3",
    character: "rinku",
    message: "チャレンジの詳細をチェック",
    subMessage: "目標人数、開催日、チケット情報などを確認しよう",
    thought: "100人動員チャレンジか！\n今30人だから、私も参加しよう！",
    previewType: "progress-bar",
    backgroundColor: "#16213e",
    stepNumber: 1,
    stepTitle: "チャレンジ発見",
  },

  // --- STEP 2: 参加表明する ---
  {
    id: "fan-4",
    character: "konta",
    message: "参加表明ボタンをタップ！",
    subMessage: "「参加する」ボタンを押して、参加表明フォームを開こう",
    thought: "よし、参加表明しよう！\n推しに気持ちを伝えたい！",
    previewType: "form",
    backgroundColor: "#1a1a2e",
    stepNumber: 2,
    stepTitle: "参加表明",
  },
  {
    id: "fan-5",
    character: "tanune",
    message: "応援メッセージを書こう",
    subMessage: "推しへの気持ちを込めたメッセージを送れる",
    thought: "「いつも応援してます！」\n「今回のライブ、絶対行きます！」",
    previewType: "comment",
    backgroundColor: "#16213e",
    stepNumber: 2,
    stepTitle: "参加表明",
  },
  {
    id: "fan-6",
    character: "rinku",
    message: "参加する都道府県を選択",
    subMessage: "どこから参加するか伝えて、遠方参加をアピール！",
    thought: "福岡から東京のライブに参加するんだ！\n遠方から来てること、知ってほしいな",
    previewType: "prefecture",
    backgroundColor: "#1a1a2e",
    stepNumber: 2,
    stepTitle: "参加表明",
  },
  {
    id: "fan-7",
    character: "konta",
    message: "友達も一緒に誘える！",
    subMessage: "「+○人連れて行く」で、友達の分も参加表明できる",
    thought: "友達も誘ったから、\n+2人で参加表明しよう！",
    previewType: "invite",
    backgroundColor: "#16213e",
    stepNumber: 2,
    stepTitle: "参加表明",
  },

  // --- STEP 3: 参加完了！ ---
  {
    id: "fan-8",
    character: "tanune",
    message: "参加表明完了！🎉",
    subMessage: "参加表明が完了すると、進捗バーに反映される",
    thought: "やった！参加表明できた！\n進捗バーが少し伸びた！",
    previewType: "progress-bar",
    backgroundColor: "#1a1a2e",
    stepNumber: 3,
    stepTitle: "参加完了",
  },
  {
    id: "fan-9",
    character: "rinku",
    message: "SNSでシェアして盛り上げよう",
    subMessage: "参加表明をTwitterでシェアして、他のファンにも広めよう",
    thought: "参加表明したこと、シェアしよう！\n他のファンも誘いたい！",
    previewType: "share",
    backgroundColor: "#16213e",
    stepNumber: 3,
    stepTitle: "参加完了",
  },

  // --- STEP 4: 他のファンを発見 ---
  {
    id: "fan-10",
    character: "konta",
    message: "参加者一覧をチェック！",
    subMessage: "同じチャレンジに参加している他のファンを発見できる",
    thought: "他にどんなファンがいるんだろう？\n参加者一覧を見てみよう",
    previewType: "participants",
    backgroundColor: "#1a1a2e",
    stepNumber: 4,
    stepTitle: "ファン発見",
  },
  {
    id: "fan-11",
    character: "tanune",
    message: "同じ県のファンを発見！",
    subMessage: "地域別で絞り込むと、近くのファンが見つかる",
    thought: "あ、同じ福岡県のファンがいる！\n一緒に遠征できるかも！",
    previewType: "participants",
    backgroundColor: "#16213e",
    stepNumber: 4,
    stepTitle: "ファン発見",
  },
  {
    id: "fan-12",
    character: "rinku",
    message: "気になるファンのプロフィール",
    subMessage: "Twitterアカウントやプロフィールを見て、共通点を探そう",
    thought: "この人、他のアーティストも好きなんだ！\n趣味が合いそう！",
    previewType: "profile",
    backgroundColor: "#1a1a2e",
    stepNumber: 4,
    stepTitle: "ファン発見",
  },

  // --- STEP 5: ファンと繋がる ---
  {
    id: "fan-13",
    character: "konta",
    message: "フォローして繋がろう！",
    subMessage: "気になるファンをフォローして、ファンコミュニティを広げよう",
    thought: "この人、フォローしよう！\nライブの話とかしたいな",
    previewType: "profile",
    backgroundColor: "#16213e",
    stepNumber: 5,
    stepTitle: "ファン交流",
  },
  {
    id: "fan-14",
    character: "tanune",
    message: "影響力のあるファンと繋がる",
    subMessage: "フォロワー数の多いファンをフォローすると、情報が入りやすい",
    thought: "この人、フォロワー1万人もいる！\n有名なファンの人だ！",
    previewType: "influencer",
    backgroundColor: "#1a1a2e",
    stepNumber: 5,
    stepTitle: "ファン交流",
  },
  {
    id: "fan-15",
    character: "rinku",
    message: "DMで直接やり取り",
    subMessage: "気になるファンにDMを送って、仲良くなろう",
    thought: "同じ県だし、一緒に遠征しませんか？\nってDM送ってみよう！",
    previewType: "dm",
    backgroundColor: "#16213e",
    stepNumber: 5,
    stepTitle: "ファン交流",
  },

  // --- STEP 6: イベント当日に向けて ---
  {
    id: "fan-16",
    character: "konta",
    message: "カウントダウンでワクワク！",
    subMessage: "イベント当日までの残り日数がカウントダウンされる",
    thought: "あと7日！\n楽しみすぎる〜！",
    previewType: "countdown",
    backgroundColor: "#1a1a2e",
    stepNumber: 6,
    stepTitle: "当日に向けて",
  },
  {
    id: "fan-17",
    character: "tanune",
    message: "リマインダーを設定",
    subMessage: "イベント前日や当日に通知が届くように設定できる",
    thought: "前日にリマインダー設定しておこう\n準備を忘れないように！",
    previewType: "reminder",
    backgroundColor: "#16213e",
    stepNumber: 6,
    stepTitle: "当日に向けて",
  },
  {
    id: "fan-18",
    character: "rinku",
    message: "チケット情報を確認",
    subMessage: "チケットの購入リンクや価格を再確認しよう",
    thought: "チケット、ちゃんと買ったかな？\n確認しておこう",
    previewType: "ticket",
    backgroundColor: "#1a1a2e",
    stepNumber: 6,
    stepTitle: "当日に向けて",
  },

  // --- STEP 7: 目標達成を見届ける ---
  {
    id: "fan-19",
    character: "konta",
    message: "目標達成！みんなで喜ぼう！",
    subMessage: "100人の参加表明が集まった！達成通知が届く",
    thought: "やった！100人達成！\n私も貢献できた！",
    previewType: "celebration",
    backgroundColor: "#16213e",
    stepNumber: 7,
    stepTitle: "目標達成",
  },
  {
    id: "fan-20",
    character: "tanune",
    message: "達成記念ページに名前が載る！",
    subMessage: "参加者全員の名前が記念ページに掲載される",
    thought: "私の名前も載ってる！\n記念に残るな〜",
    previewType: "achievement",
    backgroundColor: "#1a1a2e",
    stepNumber: 7,
    stepTitle: "目標達成",
  },
  {
    id: "fan-21",
    character: "rinku",
    message: "バッジをゲット！",
    subMessage: "参加するとバッジがもらえる。たくさん集めよう！",
    thought: "参加バッジゲット！\nマイページに飾られるんだ！",
    previewType: "badge",
    backgroundColor: "#16213e",
    stepNumber: 7,
    stepTitle: "目標達成",
  },

  // --- STEP 8: 貢献度ランキング ---
  {
    id: "fan-22",
    character: "konta",
    message: "貢献度ランキングをチェック",
    subMessage: "友達を誘った数や参加回数でランキングが決まる",
    thought: "私、貢献度ランキング5位だ！\nもっと上を目指したい！",
    previewType: "ranking",
    backgroundColor: "#1a1a2e",
    stepNumber: 8,
    stepTitle: "ランキング",
  },
  {
    id: "fan-23",
    character: "tanune",
    message: "常連ファンバッジをゲット！",
    subMessage: "何度も参加すると、常連ファンバッジがもらえる",
    thought: "常連ファンバッジ、嬉しい！\n推しに認知されてる気分！",
    previewType: "crown",
    backgroundColor: "#16213e",
    stepNumber: 8,
    stepTitle: "ランキング",
  },

  // --- エンディング ---
  {
    id: "fan-end",
    character: "kimitolink",
    message: "ファンの追体験は以上です！",
    subMessage: "さあ、推しのチャレンジに参加して、ファン同士で繋がろう！",
    thought: "動員ちゃれんじで、\n推し活をもっと楽しもう！",
    previewType: "none",
    backgroundColor: "#1a1a2e",
    stepNumber: 9,
    stepTitle: "おわりに",
  },
];

type ExperienceType = "organizer" | "fan";

type ExperienceContextType = {
  /** 現在の追体験タイプ */
  experienceType: ExperienceType | null;
  /** 現在のスライドインデックス */
  currentSlideIndex: number;
  /** 追体験を開始 */
  startExperience: (type: ExperienceType) => void;
  /** 次のスライドへ */
  nextSlide: () => void;
  /** 前のスライドへ */
  prevSlide: () => void;
  /** 追体験を終了 */
  endExperience: () => void;
  /** 現在のスライド */
  currentSlide: ExperienceSlide | null;
  /** 総スライド数 */
  totalSlides: number;
  /** 追体験中かどうか */
  isActive: boolean;
};

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = experienceType === "organizer" 
    ? ORGANIZER_EXPERIENCE_SLIDES 
    : experienceType === "fan" 
    ? FAN_EXPERIENCE_SLIDES 
    : [];

  const startExperience = useCallback((type: ExperienceType) => {
    setExperienceType(type);
    setCurrentSlideIndex(0);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // 最後のスライドなら終了
      setExperienceType(null);
      setCurrentSlideIndex(0);
    }
  }, [currentSlideIndex, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const endExperience = useCallback(() => {
    setExperienceType(null);
    setCurrentSlideIndex(0);
  }, []);

  const currentSlide = slides[currentSlideIndex] || null;

  return (
    <ExperienceContext.Provider
      value={{
        experienceType,
        currentSlideIndex,
        startExperience,
        nextSlide,
        prevSlide,
        endExperience,
        currentSlide,
        totalSlides: slides.length,
        isActive: experienceType !== null,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return context;
}
