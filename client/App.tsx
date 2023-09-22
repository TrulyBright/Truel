import { View, ActivityIndicator, StyleSheet } from "react-native";
import CreateRoomModal from "./components/CreateRoomModal";
import { useState } from "react";
import { Socket } from "./client/socket";
import { RoomCreated, RoomUpdated, RoomDeleted, UserCreated, UserDeleted, UserList, RoomList } from "@shared/event";
import { Room } from "./client/room";
import { User } from "./client/user";
import RoomEntry from "./components/RoomEntry";
import { GetRooms, GetUsers } from "@shared/action";

const App = () => {
  const socket = Socket.instance;
  Socket.waitForConnectionOpen(); // TODO: await this
  const [modalVisible, setModalVisible] = useState(false);
  const [rooms, setRooms] = useState(Array<Room>());
  const [users, setUsers] = useState(Array<User>());
  socket.addEventListener(RoomList, (e: RoomList) => {
    setRooms(e.rooms.map((room) => Room.from(room)))
  })
  socket.addEventListener(RoomCreated, (e: RoomCreated) => {
    setRooms([...rooms, Room.from(e)]);
  });
  socket.addEventListener(RoomUpdated, (e: RoomUpdated) => {
    setRooms(rooms.map((room) => (room.id === e.id ? Room.from(e) : room)));
  });
  socket.addEventListener(RoomDeleted, (e: RoomDeleted) => {
    setRooms(rooms.filter((room) => room.id !== e.id));
  });
  socket.addEventListener(UserList, (e: UserList) => {
    setUsers(e.users.map((user) => User.from(user)))
  })
  socket.addEventListener(UserCreated, (e: UserCreated) => {
    setUsers([...users, User.from(e)]);
  });
  socket.addEventListener(UserDeleted, (e: UserDeleted) => {
    setUsers(users.filter((user) => user.name !== e.name))
  })
  socket.onOpen(() => {
    socket.perform(new GetUsers())
    socket.perform(new GetRooms())
  })
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
