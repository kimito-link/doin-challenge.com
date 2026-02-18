/**
 * Profiler Wrapper Component
 * React DevTools Profilerでのパフォーマンス計測を簡単にするラッパーコンポーネント
 */

import { Profiler, ProfilerOnRenderCallback, ReactNode } from "react";

interface ProfilerWrapperProps {
  id: string;
  children: ReactNode;
  enabled?: boolean;
}

/**
 * Profilerラッパーコンポーネント
 * 開発環境でのみプロファイリングを有効化
 */
export function ProfilerWrapper({ id, children, enabled = __DEV__ }: ProfilerWrapperProps) {
  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // 100ms以上かかった場合は警告
    if (actualDuration > 100) {
      console.warn(
        `[Profiler] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms (base: ${baseDuration.toFixed(2)}ms)`
      );
    } else if (actualDuration > 50) {
      console.log(
        `[Profiler] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms (base: ${baseDuration.toFixed(2)}ms)`
      );
    }

    // 詳細なプロファイリング情報
    if (__DEV__ && actualDuration > 10) {
      console.debug(`[Profiler] ${id}`, {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime: `${startTime.toFixed(2)}ms`,
        commitTime: `${commitTime.toFixed(2)}ms`,
      });
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

/**
 * 高階コンポーネント（HOC）版
 * コンポーネントをProfilerでラップする
 */
export function withProfiler<P extends object>(
  Component: React.ComponentType<P>,
  id: string
): React.ComponentType<P> {
  return function ProfiledComponent(props: P) {
    return (
      <ProfilerWrapper id={id}>
        <Component {...props} />
      </ProfilerWrapper>
    );
  };
}
