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
  /** プレビュータイプ */
  previewType?: "map" | "participants" | "chart" | "notification" | "crown" | "comment" | "invite" | "none";
  /** 背景色 */
  backgroundColor?: string;
};

// 主催者視点の追体験スライド
export const ORGANIZER_EXPERIENCE_SLIDES: ExperienceSlide[] = [
  {
    id: "org-1",
    character: "kimitolink",
    message: "ライブやるから皆来て欲しいな",
    subMessage: "チャレンジを作成して、ファンに参加を呼びかけよう",
    previewType: "none",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-2",
    character: "rinku",
    message: "いろんな地域から参加表明してくれる！",
    subMessage: "地図上で参加者の分布がリアルタイムで見える",
    previewType: "map",
    backgroundColor: "#16213e",
  },
  {
    id: "org-3",
    character: "konta",
    message: "千葉エリアに人が多いね",
    subMessage: "地域別の参加者数がわかるから、次のライブ会場の参考になる",
    previewType: "map",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-4",
    character: "tanune",
    message: "これだけ参加表明があれば大きな会場も安心",
    subMessage: "事前に参加者数がわかるから、会場選びのリスクが減る",
    previewType: "participants",
    backgroundColor: "#16213e",
  },
  {
    id: "org-5",
    character: "rinku",
    message: "参加表明してくれる人は安心できるかも",
    subMessage: "参加者のプロフィールが見えるから、コミュニティの雰囲気がわかる",
    previewType: "participants",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-6",
    character: "konta",
    message: "ファンの気持ちが見えるのが嬉しい",
    subMessage: "参加者のコメントで、どんな気持ちで来てくれるかわかる",
    previewType: "comment",
    backgroundColor: "#16213e",
  },
  {
    id: "org-7",
    character: "tanune",
    message: "友達を誘う機能で人が集まりやすい！",
    subMessage: "影響力のある人が参加すると、一気に人が増えることも",
    previewType: "invite",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "org-8",
    character: "kimitolink",
    message: "ファンの属性もわかる！",
    subMessage: "男女比や地域分布で、ターゲットを絞ったイベント企画ができる",
    previewType: "chart",
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
    previewType: "notification",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-2",
    character: "konta",
    message: "参加表明っと！",
    subMessage: "ボタンをタップするだけで簡単に参加できる",
    previewType: "none",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-3",
    character: "tanune",
    message: "私のこと、認知してくれるかな？",
    subMessage: "参加者リストにあなたの名前が表示される。アーティストも見てるかも",
    previewType: "participants",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-4",
    character: "rinku",
    message: "どんな気持ちで参加するか伝えたい！",
    subMessage: "コメントで意気込みや期待を伝えられる",
    previewType: "comment",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-5",
    character: "konta",
    message: "九州から東京まで行くんだよ！",
    subMessage: "遠方から参加していることをアピールできる",
    previewType: "map",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-6",
    character: "tanune",
    message: "何回も通ってるファンだって知ってほしい",
    subMessage: "参加回数が表示されて、常連ファンとして認識される",
    previewType: "crown",
    backgroundColor: "#16213e",
  },
  {
    id: "fan-7",
    character: "rinku",
    message: "他にもこんなファンがいるんだ！",
    subMessage: "同じ県のファンや、共通の趣味を持つファンを発見できる",
    previewType: "participants",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "fan-8",
    character: "kimitolink",
    message: "有名なファンの人と仲良くなりたい！",
    subMessage: "フォロワー数の多い参加者をフォローして、ファンコミュニティを広げよう",
    previewType: "participants",
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
