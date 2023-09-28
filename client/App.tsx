import { StyleSheet } from "react-native"
import Lobby from "./components/Lobby"
import HowToPlayScreen from "./components/HowToPlay"
import { NavigationContainer } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 
import { Entypo } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import LeaderboardScreen from "./components/LeaderboardScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Title from "./components/Title"

const Tab = createBottomTabNavigator()

const App = () => {
    return (
      <NavigationContainer>
        <Tab.Navigator initialRouteName="Lobby" sceneContainerStyle={styles.sceneContainer} screenOptions={{
          tabBarStyle: {
            backgroundColor: "black",
            borderTopColor: "black",
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          header: Title,
        }}>
          <Tab.Screen name="Lobby" component={Lobby} options={{
            tabBarIcon: () => (
              <AntDesign name="home" size={16} color="white"></AntDesign>
            ),
          }} />
          <Tab.Screen name="How to Play" component={HowToPlayScreen} options={{
            tabBarIcon: () => (
              <Entypo name="help" size={16} color="white"></Entypo>
            ),
          }} />
          <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{
            tabBarIcon: () => (
              <MaterialIcons name="leaderboard" size={16} color="white"></MaterialIcons>
            ),
          }} />
        </Tab.Navigator>
      </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    sceneContainer: {
      backgroundColor: "black",
    }
})

export default App;