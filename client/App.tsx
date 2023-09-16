import { View, ActivityIndicator, StyleSheet } from "react-native";
import CreateRoomModal from "./components/CreateRoomModal";
import { useState } from "react";
import { Socket } from "./client/socket";
import { RoomCreated, RoomUpdated, RoomDeleted } from "@shared/event";
import { Room } from "./client/room";
import RoomEntry from "./components/RoomEntry";

const App = () => {
  const socket = Socket.instance;
  Socket.waitForConnectionOpen(); // TODO: await this
  const [modalVisible, setModalVisible] = useState(false);
  const [rooms, setRooms] = useState(Array<Room>());
  socket.addEventListener(RoomCreated, (e: RoomCreated) => {
    setRooms([...rooms, new Room(e)]);
  });
  socket.addEventListener(RoomUpdated, (e: RoomUpdated) => {
    setRooms(rooms.map((room) => (room.id === e.id ? new Room(e) : room)));
  });
  socket.addEventListener(RoomDeleted, (e: RoomDeleted) => {
    setRooms(rooms.filter((room) => room.id !== e.id));
  });
  return (
    <View>
      <CreateRoomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      ></CreateRoomModal>
      {rooms.map((room) => (
        <RoomEntry key={room.id} room={room}></RoomEntry>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
