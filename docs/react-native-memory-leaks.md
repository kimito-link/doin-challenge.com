# React Nativeメモリリーク検出と修正ガイド

## 概要

このドキュメントでは、React Nativeアプリケーションでよく発生するメモリリークのパターンと、その検出・修正方法を説明します。

## よくあるメモリリークのパターン

### 1. useEffectのクリーンアップ忘れ

**❌ 悪い例: クリーンアップなし**
```typescript
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData().then(setData);
    }, 1000);
    
    // クリーンアップ関数がない！
  }, []);

  return <View>{data}</View>;
}
```

**✅ 良い例: 適切なクリーンアップ**
```typescript
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData().then(setData);
    }, 1000);
    
    // クリーンアップ関数でタイマーをクリア
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <View>{data}</View>;
}
```

### 2. イベントリスナーの削除忘れ

**❌ 悪い例: リスナー削除なし**
```typescript
function MyComponent() {
  useEffect(() => {
    const handleKeyboard = (e) => {
      console.log('Keyboard event', e);
    };

    Keyboard.addListener('keyboardDidShow', handleKeyboard);
    
    // リスナーを削除していない！
  }, []);

  return <View />;
}
```

**✅ 良い例: リスナーを削除**
```typescript
function MyComponent() {
  useEffect(() => {
    const handleKeyboard = (e) => {
      console.log('Keyboard event', e);
    };

    const subscription = Keyboard.addListener('keyboardDidShow', handleKeyboard);
    
    // クリーンアップでリスナーを削除
    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
}
```

### 3. 非同期処理後のstate更新

**❌ 悪い例: アンマウント後のstate更新**
```typescript
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      // コンポーネントがアンマウントされた後にsetDataが呼ばれる可能性がある！
      setData(result);
    });
  }, []);

  return <View>{data}</View>;
}
```

**✅ 良い例: マウント状態を確認**
```typescript
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchData().then(result => {
      if (isMounted) {
        setData(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return <View>{data}</View>;
}
```

**✅ より良い例: AbortControllerを使用**
```typescript
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch('https://api.example.com/data', {
      signal: abortController.signal,
    })
      .then(response => response.json())
      .then(result => setData(result))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      });

    return () => {
      abortController.abort();
    };
  }, []);

  return <View>{data}</View>;
}
```

### 4. 循環参照

**❌ 悪い例: 循環参照**
```typescript
function MyComponent() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const newItems = items.map(item => ({
      ...item,
      parent: items, // 循環参照！
    }));
    setItems(newItems);
  }, [items]); // 無限ループ！

  return <FlatList data={items} />;
}
```

**✅ 良い例: 循環参照を避ける**
```typescript
function MyComponent() {
  const [items, setItems] = useState([]);

  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      // 必要な情報のみを保持
      parentId: item.parentId,
    }));
  }, [items]);

  return <FlatList data={processedItems} />;
}
```

### 5. 大きなオブジェクトのキャッシュ

**❌ 悪い例: 無制限のキャッシュ**
```typescript
const imageCache = new Map();

function CachedImage({ uri }) {
  useEffect(() => {
    if (!imageCache.has(uri)) {
      fetch(uri)
        .then(response => response.blob())
        .then(blob => {
          imageCache.set(uri, blob); // キャッシュが無制限に増える！
        });
    }
  }, [uri]);

  return <Image source={{ uri }} />;
}
```

**✅ 良い例: LRUキャッシュを使用**
```typescript
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // アクセスされたアイテムを最新にする
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 最も古いアイテムを削除
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

const imageCache = new LRUCache<string, Blob>(50);

function CachedImage({ uri }) {
  useEffect(() => {
    if (!imageCache.get(uri)) {
      fetch(uri)
        .then(response => response.blob())
        .then(blob => {
          imageCache.set(uri, blob);
        });
    }
  }, [uri]);

  return <Image source={{ uri }} />;
}
```

### 6. FlatListのkeyExtractor

**❌ 悪い例: インデックスをkeyに使用**
```typescript
<FlatList
  data={items}
  keyExtractor={(item, index) => index.toString()} // インデックスは変わる可能性がある
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

**✅ 良い例: 一意のIDをkeyに使用**
```typescript
<FlatList
  data={items}
  keyExtractor={(item) => item.id.toString()} // 一意のIDを使用
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### 7. useRefの誤用

**❌ 悪い例: refに大きなオブジェクトを保存**
```typescript
function MyComponent() {
  const dataRef = useRef([]);

  useEffect(() => {
    fetchData().then(result => {
      dataRef.current = [...dataRef.current, ...result]; // 無限に増える！
    });
  }, []);

  return <View />;
}
```

**✅ 良い例: stateを使用**
```typescript
function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then(result => {
      setData(prevData => [...prevData, ...result]);
    });
  }, []);

  return <View />;
}
```

## メモリリークの検出方法

### 1. React DevTools Profiler

```typescript
import { Profiler } from 'react';

function MyComponent() {
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      <View>
        {/* コンポーネントの内容 */}
      </View>
    </Profiler>
  );
}
```

### 2. カスタムメモリ監視フック

```typescript
import { useEffect, useRef } from 'react';

export function useMemoryMonitor(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      console.log(`[${componentName}] Render #${renderCount.current}`);
      
      // メモリ使用量を記録（開発環境のみ）
      if (global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        console.log(`[${componentName}] Memory:`, {
          used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        });
      }
    }
  });

  useEffect(() => {
    return () => {
      if (__DEV__) {
        console.log(`[${componentName}] Unmounted after ${renderCount.current} renders`);
      }
    };
  }, [componentName]);
}

// 使用例
function MyComponent() {
  useMemoryMonitor('MyComponent');
  
  return <View />;
}
```

### 3. マウント/アンマウント追跡

```typescript
import { useEffect } from 'react';

const mountedComponents = new Set<string>();

export function useComponentLifecycle(componentName: string) {
  useEffect(() => {
    mountedComponents.add(componentName);
    console.log(`[MOUNT] ${componentName}`, {
      totalMounted: mountedComponents.size,
      components: Array.from(mountedComponents),
    });

    return () => {
      mountedComponents.delete(componentName);
      console.log(`[UNMOUNT] ${componentName}`, {
        totalMounted: mountedComponents.size,
        components: Array.from(mountedComponents),
      });
    };
  }, [componentName]);
}

// 使用例
function MyComponent() {
  useComponentLifecycle('MyComponent');
  
  return <View />;
}
```

## ベストプラクティス

### 1. useEffectのクリーンアップチェックリスト

```typescript
function MyComponent() {
  useEffect(() => {
    // ✅ タイマー
    const timer = setInterval(() => {}, 1000);
    
    // ✅ イベントリスナー
    const subscription = eventEmitter.addListener('event', handler);
    
    // ✅ WebSocket
    const ws = new WebSocket('ws://example.com');
    
    // ✅ 非同期処理
    let isMounted = true;
    
    return () => {
      // クリーンアップ
      clearInterval(timer);
      subscription.remove();
      ws.close();
      isMounted = false;
    };
  }, []);

  return <View />;
}
```

### 2. カスタムフックでクリーンアップをカプセル化

```typescript
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 使用例
function MyComponent() {
  useInterval(() => {
    console.log('Tick');
  }, 1000);

  return <View />;
}
```

### 3. メモ化の適切な使用

```typescript
function MyComponent({ items }) {
  // ✅ 高コストな計算をメモ化
  const processedItems = useMemo(() => {
    return items.map(item => expensiveTransformation(item));
  }, [items]);

  // ✅ コールバックをメモ化
  const handlePress = useCallback((id: number) => {
    console.log('Pressed', id);
  }, []);

  return (
    <FlatList
      data={processedItems}
      renderItem={({ item }) => (
        <ItemComponent item={item} onPress={handlePress} />
      )}
    />
  );
}
```

### 4. React.memoでコンポーネントをメモ化

```typescript
const ItemComponent = React.memo(({ item, onPress }) => {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Text>{item.name}</Text>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数（オプション）
  return prevProps.item.id === nextProps.item.id;
});
```

## テスト方法

### 1. メモリリークテスト

```typescript
import { render, unmount } from '@testing-library/react-native';

test('should not leak memory on unmount', () => {
  const { unmount } = render(<MyComponent />);
  
  // コンポーネントをアンマウント
  unmount();
  
  // ガベージコレクションを強制実行
  if (global.gc) {
    global.gc();
  }
  
  // メモリ使用量を確認
  const memoryUsage = process.memoryUsage();
  expect(memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB以下
});
```

### 2. マウント/アンマウントサイクルテスト

```typescript
test('should handle multiple mount/unmount cycles', () => {
  for (let i = 0; i < 10; i++) {
    const { unmount } = render(<MyComponent />);
    unmount();
  }
  
  if (global.gc) {
    global.gc();
  }
  
  // メモリが安定していることを確認
  const memoryUsage = process.memoryUsage();
  expect(memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024);
});
```

## まとめ

メモリリークを防ぐための重要なポイント：

1. **useEffectのクリーンアップを必ず実装**
2. **イベントリスナーを適切に削除**
3. **非同期処理後のstate更新に注意**
4. **循環参照を避ける**
5. **キャッシュサイズを制限**
6. **FlatListで一意のkeyを使用**
7. **メモ化を適切に使用**
8. **定期的にメモリ使用量を監視**

これらのベストプラクティスに従うことで、React Nativeアプリケーションのメモリリークを最小限に抑えることができます。
