import { View, Text, StyleSheet } from "react-native";
import { AntDesign } from '@expo/vector-icons'; 
import { Room } from "../client/room";

const RoomEntry = (props: { room: Room }) => {
  return (
    <View style={styles.roomEntry}>
      <Text>{props.room.name}</Text>
      <Text>{props.room.host.name}</Text>
      <Text>
        {props.room.members.length} / {props.room.maxMembers}
      </Text>
      {props.room.isPrivate
      ? <AntDesign name="lock" size={24} color="black" />
      : <div style={styles.emptyIcon}></div>}
      </View>
  );
};

const styles = StyleSheet.create({
  roomEntry: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#969696",
    width: "100%",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  emptyIcon: {
    width: 24,
    height: 24,
  }
})

export default RoomEntry;
