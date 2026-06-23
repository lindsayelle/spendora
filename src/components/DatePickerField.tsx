import { Ionicons } from "@expo/vector-icons";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { displayDate, displayMonth } from "@/utils/date";
import { palette } from "@/utils/theme";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disableFuture?: boolean;
};

export function DatePickerField({ label, value, onChange, disableFuture }: DatePickerFieldProps) {
  const colors = palette(useColorScheme());
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selected));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  function selectDate(date: Date) {
    if (disableFuture && isAfter(startOfDay(date), startOfDay(new Date()))) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setVisibleMonth(startOfMonth(selected));
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1
          }
        ]}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{displayDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.modalHeader}>
              <AppButton label="Prev" icon="chevron-back-outline" variant="secondary" onPress={() => setVisibleMonth((current) => subMonths(current, 1))} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{displayMonth(format(visibleMonth, "yyyy-MM"))}</Text>
              <AppButton label="Next" icon="chevron-forward-outline" variant="secondary" onPress={() => setVisibleMonth((current) => addMonths(current, 1))} />
            </View>

            <View style={styles.weekdayGrid}>
              {weekdayLabels.map((day) => (
                <Text key={day} style={[styles.weekday, { color: colors.muted }]}>{day}</Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {days.map((day) => {
                const selectedDay = isSameDay(day, selected);
                const muted = !isSameMonth(day, visibleMonth);
                const disabled = disableFuture && isAfter(startOfDay(day), startOfDay(new Date()));
                return (
                  <Pressable
                    key={day.toISOString()}
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={() => selectDate(day)}
                    style={({ pressed }) => [
                      styles.dayCell,
                      {
                        backgroundColor: selectedDay ? colors.tint : pressed ? colors.surfaceAlt : "transparent",
                        opacity: disabled ? 0.3 : muted ? 0.48 : 1
                      }
                    ]}
                  >
                    <Text style={[styles.dayText, { color: selectedDay ? "#FFFFFF" : colors.text }]}>{format(day, "d")}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <AppButton label="Today" icon="today-outline" variant="secondary" onPress={() => selectDate(new Date())} />
              <AppButton label="Close" icon="close-outline" onPress={() => setOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type MonthPickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function MonthPickerField({ label, value, onChange }: MonthPickerFieldProps) {
  const colors = palette(useColorScheme());
  const [open, setOpen] = useState(false);
  const selected = parseISO(`${value}-01`);
  const [year, setYear] = useState(selected.getFullYear());

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setYear(selected.getFullYear());
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1
          }
        ]}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{displayMonth(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.modalHeader}>
              <AppButton label="Prev" icon="chevron-back-outline" variant="secondary" onPress={() => setYear((current) => current - 1)} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{year}</Text>
              <AppButton label="Next" icon="chevron-forward-outline" variant="secondary" onPress={() => setYear((current) => current + 1)} />
            </View>

            <View style={styles.monthGrid}>
              {monthLabels.map((monthLabel, index) => {
                const monthValue = `${year}-${String(index + 1).padStart(2, "0")}`;
                const selectedMonth = monthValue === value;
                return (
                  <Pressable
                    key={monthValue}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(monthValue);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.monthCell,
                      {
                        backgroundColor: selectedMonth ? colors.tint : pressed ? colors.surfaceAlt : "transparent",
                        borderColor: colors.border
                      }
                    ]}
                  >
                    <Text style={[styles.monthText, { color: selectedMonth ? "#FFFFFF" : colors.text }]}>{monthLabel}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <AppButton label="This Month" icon="today-outline" variant="secondary" onPress={() => {
                onChange(format(new Date(), "yyyy-MM"));
                setOpen(false);
              }} />
              <AppButton label="Close" icon="close-outline" onPress={() => setOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

const styles = StyleSheet.create({
  fieldWrap: {
    gap: 6,
    flex: 1,
    minWidth: 160
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  selector: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 10
  },
  selectorText: {
    fontSize: 16,
    fontWeight: "700"
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.36)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900"
  },
  weekdayGrid: {
    flexDirection: "row"
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800"
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  dayText: {
    fontSize: 15,
    fontWeight: "800"
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  monthCell: {
    width: "31%",
    minHeight: 50,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center"
  },
  monthText: {
    fontSize: 15,
    fontWeight: "800"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap"
  }
});
