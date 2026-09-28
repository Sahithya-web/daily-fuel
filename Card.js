import { View, StyleSheet } from "react-native";
export default function Card({children, style}){

    return(
        <View  style={[styles.card , style]}>{children}</View>
    )

}

const styles = StyleSheet.create({
    card: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
  },
})