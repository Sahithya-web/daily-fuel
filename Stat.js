import { View, Text, StyleSheet } from "react-native";

export default function Stat({ label, value, unit, color }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
        <Text style={[styles.value, color && { color }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    color: "#F2F4F6",
    fontSize: 22,
    fontWeight: "800",
  },
  unit: {
    color: "#8B95A1",
    fontSize: 13,
    marginBottom: 3,
  },
});