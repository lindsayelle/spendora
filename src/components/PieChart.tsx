import Svg, { Circle, G, Path } from "react-native-svg";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { categoryColors, palette } from "@/utils/theme";
import { formatMoney } from "@/utils/money";
import type { CurrencyCode } from "@/types";

type Slice = {
  label: string;
  value: number;
};

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ slices, currency }: { slices: Slice[]; currency: CurrencyCode }) {
  const colors = palette(useColorScheme());
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let angle = 0;

  if (!total) {
    return (
      <View style={styles.empty}>
        <CirclePlaceholder />
        <Text style={{ color: colors.muted }}>No transactions for this month yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Svg width={220} height={220} viewBox="0 0 220 220">
        <G>
          {slices.map((slice, index) => {
            const portion = slice.value / total * 360;
            const path = arcPath(110, 110, 96, angle, angle + portion);
            angle += portion;
            return <Path key={slice.label} d={path} fill={categoryColors[index % categoryColors.length]} />;
          })}
          <Circle cx={110} cy={110} r={52} fill={colors.surface} />
        </G>
      </Svg>
      <View style={styles.legend}>
        {slices.map((slice, index) => (
          <View key={slice.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: categoryColors[index % categoryColors.length] }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>{slice.label}</Text>
            <Text style={[styles.legendAmount, { color: colors.muted }]}>{formatMoney(slice.value, currency)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CirclePlaceholder() {
  const colors = palette(useColorScheme());
  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      <Circle cx={80} cy={80} r={68} fill={colors.surfaceAlt} />
      <Circle cx={80} cy={80} r={38} fill={colors.surface} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "center"
  },
  legend: {
    flex: 1,
    minWidth: 220,
    gap: 9
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendLabel: {
    flex: 1,
    fontWeight: "700"
  },
  legendAmount: {
    fontVariant: ["tabular-nums"]
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20
  }
});
