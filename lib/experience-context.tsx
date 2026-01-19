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
  previewType?: "map" | "participants" | "chart" | "notification" | "crown" | "comment" | "invite" | "form" | "prefecture" | "profile" | "influencer" | "gender" | "none";
  /** 背景色 */
  backgroundColor?: string;
};

// 主催者視点の追体験スライド
export const ORGANIZER_EXPERIENCE_SLIDES: ExperienceSlide[] = [
  {
    id: "org-1",
    character: "kimitolink",
    message: "チャレンジを作成しよう",
    subMessage: "ライブの目標人数を設定して、ファンに参加を呼びかけよう",
    thought: "ライブやるから皆来て欲しいな",
    previewType: "form",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-2",
    character: "rinku",
    message: "参加者がどんどん増えていく！",
    subMessage: "地図上で参加者の分布がリアルタイムで見える",
    thought: "いろんな地域から参加表明してくれる！",
    previewType: "map",
    backgroundColor: "#16213e",
  },
  {
    id: "org-3",
    character: "konta",
    message: "地域データで次の会場選びに",
    subMessage: "地域別の参加者数がわかるから、次のライブ会場の参考になる",
    thought: "なんか千葉エリアとか人多いな...\n千葉でライブもやってみたいかも",
    previewType: "map",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-4",
    character: "tanune",
    message: "大きな会場も安心！",
    subMessage: "事前に参加者数がわかるから、会場選びのリスクが減る",
    thought: "これだけ参加表明してくれれば、\n今度は大きな会場借りても大丈夫かも！",
    previewType: "participants",
    backgroundColor: "#16213e",
  },
];

// ファン視点の追体験スライド
export const FAN_EXPERIENCE_SLIDES: ExperienceSlide[] = [
  {
    id: "fan-1",
    character: "rinku",
    message: "推しのチャレンジが始まった！",
    subMessage: "お気に入りアーティストの通知が届くから見逃さない",
    thought: "自分がいつも応援してるアイドルの\n動員チャレンジが始まったみたい！\n事前に登録してあると通知があるので助かる",
    previewType: "notification",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-2",
    character: "konta",
    message: "参加表明しよう！",
    subMessage: "応援メッセージで気持ちを伝えられる",
    thought: "参加表明っと！\n私のこと、認知してくれればいいな\n今度のライブ、どんな気持ちで参加するか知ってほしいな",
    previewType: "form",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-3",
    character: "tanune",
    message: "どこから参加するか伝えよう",
    subMessage: "遠方から参加していることをアピールできる",
    thought: "実は東京のライブには、\n九州から参加してるってことも知ってほしいな\n通ってる回数も教えたい...\nどれだけファンかってことも",
    previewType: "prefecture",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-4",
    character: "rinku",
    message: "他のファンを発見！",
    subMessage: "同じ県のファンや、共通の趣味を持つファンを発見できる",
    thought: "ほかにはこんなファンがいるんだね\nあ、私がいつもTwitterで見かける人...\n同じ県だ！",
    previewType: "participants",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-5",
    character: "konta",
    message: "気になるファンをフォロー",
    subMessage: "別のアーティストも応援してるファンと繋がれる",
    thought: "あのファンのアカウント、\n別のアーティストもファンだから気になる\nフォローしよ",
    previewType: "profile",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-6",
    character: "tanune",
    message: "有名なファンと繋がりたい！",
    subMessage: "フォロワー数の多い参加者をフォローして、ファンコミュニティを広げよう",
    thought: "あの人、結構有名なファンの人じゃない？\nフォロワー数もたくさんいるし、\n仲良くなりたいな",
    previewType: "influencer",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-7",
    character: "rinku",
    message: "参加者は安心できる人たち",
    subMessage: "参加表明してくれる人は、ポジティブなファンが多い",
    thought: "Twitterってたまに誹謗中傷してしまう人もいるけど...\n参加表明してくれる人は安心できるかも",
    previewType: "participants",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-8",
    character: "konta",
    message: "ファン同士で話題を共有",
    subMessage: "おしゃれやチェキ会の話題で盛り上がろう",
    thought: "ライブには、おしゃれしてきてくれるファンの方がいる\nその話題に合わせてチェキ会の話題も話そう",
    previewType: "comment",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-9",
    character: "tanune",
    message: "友達を誘って盛り上げよう！",
    subMessage: "影響力のある人が参加すると、一気に人が増えることも",
    thought: "友達を誘う機能があるから人が集まりやすくていいし\nたまに、影響力がある人が参加するってわかると\n一気に人が増えることもあるので助かる〜",
    previewType: "invite",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-10",
    character: "kimitolink",
    message: "ファンの属性もわかる！",
    subMessage: "男女比で、ターゲットを絞ったイベント企画ができる",
    thought: "ライブ配信いつも来てくれるみんなは、\n男性・女性どっちかな？\n男性限定とかもいいかも",
    previewType: "gender",
    backgroundColor: "#16213e",
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
