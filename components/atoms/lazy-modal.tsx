import { ReactNode, useState, useEffect } from "react";
import { Modal, type ModalProps } from "react-native";

interface LazyModalProps extends ModalProps {
  children: ReactNode;
  visible: boolean;
}

/**
 * LazyModal - モーダルが表示されるまでコンテンツをレンダリングしないラッパーコンポーネント
 *
 * 使用方法:
 * ```tsx
 * <LazyModal visible={isVisible} onRequestClose={handleClose}>
 *   <HeavyModalContent />
 * </LazyModal>
 * ```
 *
 * メリット:
 * - モーダルが表示されるまでコンテンツがレンダリングされない
 * - 初回レンダリング時のパフォーマンスが向上
 * - メモリ使用量が削減される
 */
export function LazyModal({ children, visible, ...props }: LazyModalProps) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (visible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [visible, hasBeenVisible]);

  return (
    <Modal visible={visible} {...props}>
      {hasBeenVisible ? children : null}
    </Modal>
  );
}
