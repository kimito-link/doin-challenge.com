/**
 * Web対応の日付ピッカーコンポーネント
 * Webではinput type="date"を使用し、ネイティブではTextInputを使用
 */

import { Platform, View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

// 月の日数を取得
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// 月の最初の曜日を取得（0=日曜日）
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// 日付をYYYY-MM-DD形式にフォーマット
function formatDate(year: number, month: number, day: number): string {
  const m = (month + 1).toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// YYYY-MM-DD形式の日付をパース
function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10) - 1, // 0-indexed
    day: parseInt(match[3], 10),
  };
}

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function DatePicker({ value, onChange, placeholder = "日付を選択", minDate, maxDate }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  
  // カレンダー表示用の年月
  const today = new Date();
  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  // 値が変更されたらカレンダーの表示月も更新
  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Webの場合はネイティブのdate inputを使用
  if (Platform.OS === "web") {
    return (
      <View style={{ position: "relative" }}>
        <TouchableOpacity
          onPress={() => {
            // input要素をクリック
            const input = document.getElementById("date-picker-input") as HTMLInputElement;
            if (input) {
              input.showPicker?.();
              input.focus();
            }
          }}
          style={{
            backgroundColor: "#0D1117",
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: "#2D3139",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: value ? "#fff" : "#6B7280", fontSize: 14 }}>
            {value || placeholder}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <input
          id="date-picker-input"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
      </View>
    );
  }

  // ネイティブの場合はカスタムカレンダーモーダルを使用
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  
  // カレンダーの日付配列を作成
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const dateStr = formatDate(viewYear, viewMonth, day);
    onChange(dateStr);
    setShowCalendar(false);
  };

  const isSelected = (day: number): boolean => {
    if (!value) return false;
    const selected = parseDate(value);
    if (!selected) return false;
    return selected.year === viewYear && selected.month === viewMonth && selected.day === day;
  };

  const isToday = (day: number): boolean => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowCalendar(true)}
        style={{
          backgroundColor: "#0D1117",
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: "#2D3139",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: value ? "#fff" : "#6B7280", fontSize: 14 }}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View
            style={{
              backgroundColor: "#1A1D21",
              borderRadius: 16,
              padding: 16,
              width: 320,
              maxWidth: "90%",
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* ヘッダー */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8 }}>
                <MaterialIcons name="chevron-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                {viewYear}年 {MONTHS[viewMonth]}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
                <MaterialIcons name="chevron-right" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* 曜日ヘッダー */}
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {WEEKDAYS.map((day, index) => (
                <View key={day} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ 
                    color: index === 0 ? "#EF4444" : index === 6 ? "#3B82F6" : "#9CA3AF",
                    fontSize: 12,
                    fontWeight: "500",
                  }}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* カレンダーグリッド */}
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {calendarDays.map((day, index) => (
                <View key={index} style={{ width: "14.28%", aspectRatio: 1, padding: 2 }}>
                  {day !== null && (
                    <TouchableOpacity
                      onPress={() => handleSelectDate(day)}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                        backgroundColor: isSelected(day) ? "#EC4899" : isToday(day) ? "#2D3139" : "transparent",
                      }}
                    >
                      <Text style={{
                        color: isSelected(day) ? "#fff" : isToday(day) ? "#EC4899" : "#fff",
                        fontSize: 14,
                        fontWeight: isSelected(day) || isToday(day) ? "bold" : "normal",
                      }}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* 閉じるボタン */}
            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#2D3139",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "500" }}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
