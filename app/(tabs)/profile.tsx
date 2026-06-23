import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TextField } from "@/components/TextField";
import { useAppStore } from "@/stores/app-store";
import type { Budget, Category, CurrencyCode } from "@/types";
import { todayISO } from "@/utils/date";
import { currencyOptions, minorToInput, parseMoneyToMinor } from "@/utils/money";
import { categoryColors, palette } from "@/utils/theme";

type BudgetKey = "daily" | "weekday" | "weekend" | "weekly" | "monthly";

function budgetKey(budget: Budget): BudgetKey {
  if (budget.budgetType === "daily" && budget.dayType === "weekday") return "weekday";
  if (budget.budgetType === "daily" && budget.dayType === "weekend") return "weekend";
  return budget.budgetType;
}

function budgetShape(key: BudgetKey) {
  if (key === "weekday") return { budgetType: "daily" as const, dayType: "weekday" as const };
  if (key === "weekend") return { budgetType: "daily" as const, dayType: "weekend" as const };
  return { budgetType: key as "daily" | "weekly" | "monthly", dayType: null };
}

export default function ProfileScreen() {
  const colors = palette(useColorScheme());
  const ready = useAppStore((state) => state.ready);
  const settings = useAppStore((state) => state.settings);
  const categories = useAppStore((state) => state.categories);
  const transactions = useAppStore((state) => state.transactions);
  const budgets = useAppStore((state) => state.budgets);
  const setCurrency = useAppStore((state) => state.setCurrency);
  const saveBudget = useAppStore((state) => state.saveBudget);
  const removeBudget = useAppStore((state) => state.removeBudget);
  const saveCategory = useAppStore((state) => state.saveCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);
  const [budgetInputs, setBudgetInputs] = useState<Record<BudgetKey, string>>({ daily: "", weekday: "", weekend: "", weekly: "", monthly: "" });
  const [categoryName, setCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(categoryColors[0]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [message, setMessage] = useState("");

  const budgetByKey = useMemo(() => {
    const map = new Map<BudgetKey, Budget>();
    budgets.forEach((budget) => map.set(budgetKey(budget), budget));
    return map;
  }, [budgets]);

  useEffect(() => {
    setBudgetInputs({
      daily: budgetByKey.get("daily") ? minorToInput(budgetByKey.get("daily")!.amountMinor) : "",
      weekday: budgetByKey.get("weekday") ? minorToInput(budgetByKey.get("weekday")!.amountMinor) : "",
      weekend: budgetByKey.get("weekend") ? minorToInput(budgetByKey.get("weekend")!.amountMinor) : "",
      weekly: budgetByKey.get("weekly") ? minorToInput(budgetByKey.get("weekly")!.amountMinor) : "",
      monthly: budgetByKey.get("monthly") ? minorToInput(budgetByKey.get("monthly")!.amountMinor) : ""
    });
  }, [budgetByKey]);

  if (!ready || !settings) return <LoadingState />;

  async function handleSaveBudgets() {
    if (!settings) return;
    setMessage("");
    for (const key of Object.keys(budgetInputs) as BudgetKey[]) {
      const existing = budgetByKey.get(key);
      const raw = budgetInputs[key].trim();
      if (!raw && existing) {
        await removeBudget(existing.id);
        continue;
      }
      if (!raw) continue;
      const amountMinor = parseMoneyToMinor(raw);
      if (!amountMinor) {
        setMessage("Enter valid positive budget amounts.");
        return;
      }
      const shape = budgetShape(key);
      await saveBudget({
        id: existing?.id,
        budgetType: shape.budgetType,
        dayType: shape.dayType,
        amountMinor,
        currency: settings.mainCurrency,
        categoryId: null,
        startDate: existing?.startDate ?? todayISO(),
        endDate: null,
        createdAt: existing?.createdAt
      });
    }
    setMessage("Budget settings saved.");
  }

  async function handleCreateCategory() {
    const name = categoryName.trim();
    if (!name) return;
    await saveCategory({
      name,
      color: newCategoryColor,
      isDefault: false,
      parentCategoryId: null
    });
    setCategoryName("");
  }

  async function handleRenameCategory(category: Category) {
    const name = renameDraft.trim();
    if (!name) return;
    await saveCategory({
      ...category,
      name
    });
    setEditingCategoryId(null);
    setRenameDraft("");
  }

  async function handleColorChange(category: Category, color: string) {
    await saveCategory({
      ...category,
      color
    });
  }

  function canDeleteCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    return category && !category.isDefault && !transactions.some((transaction) => transaction.categoryId === categoryId);
  }

  return (
    <Screen title="Profile" subtitle="Budgets, categories, currency, and local-only privacy settings.">
      <Card style={styles.block}>
        <SectionTitle>Main Currency</SectionTitle>
        <View style={styles.chips}>
          {currencyOptions.map((currency) => (
            <Chip
              key={currency}
              label={currency}
              selected={settings.mainCurrency === currency}
              onPress={() => setCurrency(currency as CurrencyCode)}
            />
          ))}
        </View>
        <Text style={[styles.note, { color: colors.muted }]}>V1 does not fetch exchange rates or convert existing records.</Text>
      </Card>

      <Card style={styles.block}>
        <SectionTitle>Budget Setup</SectionTitle>
        <View style={styles.inputGrid}>
          {(["daily", "weekday", "weekend", "weekly", "monthly"] as BudgetKey[]).map((key) => (
            <TextField
              key={key}
              label={`${key[0].toUpperCase()}${key.slice(1)} Budget`}
              value={budgetInputs[key]}
              onChangeText={(value) => setBudgetInputs((current) => ({ ...current, [key]: value }))}
              placeholder="100.00"
              keyboardType="decimal-pad"
            />
          ))}
        </View>
        <View style={styles.saveRow}>
          <AppButton label="Save Budgets" icon="wallet-outline" onPress={handleSaveBudgets} />
        </View>
        {message ? <Text style={[styles.message, { color: message.includes("valid") ? colors.danger : colors.success }]}>{message}</Text> : null}
      </Card>

      <Card style={styles.block}>
        <SectionTitle>Category Management</SectionTitle>
        <View style={styles.categoryForm}>
          <TextField
            label="New Category"
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Coffee"
            maxLength={40}
          />
          <ColorSwatches selectedColor={newCategoryColor} onSelect={setNewCategoryColor} />
          <AppButton label="Create" icon="add-outline" onPress={handleCreateCategory} />
        </View>
        <View style={styles.categoryList}>
          {categories.map((category) => {
            const editing = editingCategoryId === category.id;
            return (
              <View key={category.id} style={[styles.categoryRow, { borderColor: colors.border }]}> 
                <View style={styles.categoryText}>
                  {editing ? (
                    <TextInput
                      value={renameDraft}
                      onChangeText={setRenameDraft}
                      maxLength={40}
                      autoFocus
                      style={[styles.inlineInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                    />
                  ) : (
                    <View style={styles.nameLine}>
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                    </View>
                  )}
                  <Text style={[styles.categoryMeta, { color: colors.muted }]}>{category.isDefault ? "Default category" : "Custom category"}</Text>
                  <ColorSwatches selectedColor={category.color} onSelect={(color) => handleColorChange(category, color)} compact />
                </View>
                <View style={styles.categoryActions}>
                  {editing ? (
                    <>
                      <AppButton label="Save" icon="checkmark-outline" onPress={() => handleRenameCategory(category)} />
                      <AppButton label="Cancel" variant="secondary" icon="close-outline" onPress={() => { setEditingCategoryId(null); setRenameDraft(""); }} />
                    </>
                  ) : (
                    <AppButton label="Rename" variant="secondary" icon="create-outline" onPress={() => { setEditingCategoryId(category.id); setRenameDraft(category.name); }} />
                  )}
                  {canDeleteCategory(category.id) ? <AppButton label="Delete" variant="danger" icon="trash-outline" onPress={() => deleteCategory(category.id)} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionTitle>Data & Privacy</SectionTitle>
        <Text style={[styles.privacy, { color: colors.text }]}>All Spendora V1 data stays on this device. No account, cloud sync, bank connection, analytics, LLM call, or paid API is used.</Text>
        <Text style={[styles.note, { color: colors.muted }]}>Native iPhone builds store data in SQLite. The localhost web preview stores offline data in this browser.</Text>
      </Card>
    </Screen>
  );
}

function ColorSwatches({ selectedColor, onSelect, compact }: { selectedColor: string; onSelect: (color: string) => void; compact?: boolean }) {
  const colors = palette(useColorScheme());
  return (
    <View style={[styles.swatches, compact ? styles.compactSwatches : null]}>
      {categoryColors.map((color) => {
        const selected = selectedColor === color;
        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            onPress={() => onSelect(color)}
            style={({ pressed }) => [
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: selected ? colors.text : colors.border,
                transform: [{ scale: pressed || selected ? 1.12 : 1 }]
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 12
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  note: {
    marginTop: 10,
    lineHeight: 20
  },
  inputGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  saveRow: {
    alignItems: "flex-start",
    marginTop: 14
  },
  message: {
    marginTop: 10,
    fontWeight: "800"
  },
  categoryForm: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 12
  },
  categoryList: {
    gap: 2
  },
  categoryRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  categoryText: {
    flex: 1,
    gap: 7,
    minWidth: 0
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  categoryName: {
    fontWeight: "800",
    fontSize: 16
  },
  inlineInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "800",
    maxWidth: 360
  },
  categoryMeta: {
    marginTop: 0
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 180
  },
  compactSwatches: {
    maxWidth: 260
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2
  },
  categoryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
    alignContent: "flex-start"
  },
  privacy: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700"
  }
});
