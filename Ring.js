import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function Ring({ consumed, target, size = 176 }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const over = consumed > target;
  const color = over ? "#E2665A" : "#E8A23D";
  const remaining = target - consumed;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* dim background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#2A323C"
          strokeWidth={stroke}
          fill="none"
        />
        {/* colored progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference * pct}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={styles.centerText}>
        <Text style={styles.remainingNumber}>{Math.abs(remaining)}</Text>
        <Text style={styles.remainingLabel}>
          {remaining >= 0 ? "kcal left" : "kcal over"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  remainingNumber: {
    color: "#F2F4F6",
    fontSize: 30,
    fontWeight: "800",
  },
  remainingLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
});