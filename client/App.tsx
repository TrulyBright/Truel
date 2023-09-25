import { SafeAreaView, StyleSheet } from "react-native";
import Lobby from "./components/Lobby";

const App = () => {
    return (
        <SafeAreaView style={styles.mainView}>
            <div style={styles.title}>Truel</div>
            <Lobby></Lobby>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainView: {
      display: "flex",
      width: "100%",
      height: "100%",
      backgroundColor: "black",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: "white",
      fontFamily: "times new roman",
      maxHeight: "5%",
      fontSize: 40,
      fontWeight: "bold",
      textAlign: "center",
      padding: 5,
    },
})

export default App;