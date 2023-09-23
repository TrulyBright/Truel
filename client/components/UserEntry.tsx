import { View, Text, StyleSheet } from "react-native";
import { User } from "../client/user";

const UserEntry = (props: { user: User }) => {
  return (
    <View>
        <div style={styles.userEntry}>{props.user.name}</div>
    </View>
  );
};

const styles = StyleSheet.create({
    userEntry: {
        backgroundColor: "#FFFFFF",
        borderRadius: 5,
        padding: 10,
        margin: 5,
    }
})

export default UserEntry