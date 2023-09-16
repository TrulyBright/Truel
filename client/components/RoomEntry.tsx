import { View, Text } from "react-native";
import { Room } from "../client/room";

const RoomEntry = (props: { room: Room }) => {
  return (
    <View>
      <Text>{props.room.name}</Text>
      <Text>{props.room.host.name}</Text>
      <Text>
        {props.room.members.length} / {props.room.maxMembers}
      </Text>
      <Text>{props.room.members.length}</Text>
    </View>
  );
};

export default RoomEntry;
