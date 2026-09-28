import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Flame, UtensilsCrossed, Dumbbell, Scale } from "lucide-react-native";

const tabs = [
  { key: "home", label: "Home", icon: Flame },
  { key: "food", label: "Food", icon: UtensilsCrossed },
  { key: "workout", label: "Workout", icon: Dumbbell },
  { key: "weight", label: "Weight", icon: Scale },
];

export default function TabBar({active , onChange}){
    return(
        <View style={styles.bar}>
            {tabs.map((tab)=> {

            const Icon = tab.icon;
            //Before switching checking active page.
            const isActive = active === tab.key
            return(
        <TouchableOpacity style ={styles.tab} key={tab.key} onPress={()=> onChange(tab.key)}>
        <Icon size={20} color={isActive ? "#E8A23D" : "#8B95A1"} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>

            )}
        )}
        </View>
    )

}
const styles = StyleSheet.create({

    bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1B2129",
    borderTopWidth: 1,
    borderTopColor: "#2A323C",
    paddingVertical: 10,
    paddingBottom: 20,
  },
  tab: {
    alignItems: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: "#8B95A1",
  },
  labelActive: {
    color: "#E8A23D",
  },
});