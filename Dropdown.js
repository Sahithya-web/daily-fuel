import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";

export default function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.key === value);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity style={styles.box} onPress={() => setOpen(true)}>
        <Text style={{ color: "#F2F4F6", fontSize: 15 }}>{selected?.label}</Text>
        <ChevronDown size={18} color="#8B95A1" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalSheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onChange(item.key);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={{
                      color: item.key === value ? "#E8A23D" : "#F2F4F6",
                      fontWeight: item.key === value ? "700" : "400",
                      fontSize: 16,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  box: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    maxHeight: "50%",
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
});