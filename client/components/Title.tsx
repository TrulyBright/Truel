import { Text, StyleSheet } from "react-native"

const Title = () => {
    return (
        <Text style={styles.title}>Truel</Text>
    )
}

const styles = StyleSheet.create({
    title: {
        color: "white",
        fontFamily: "times new roman",
        fontSize: 40,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "black",
    }
})

export default Title