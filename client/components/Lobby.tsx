import { StyleSheet, ScrollView, SafeAreaView, Text, View } from "react-native";
import CreateRoomModal from "./CreateRoomModal";
import { useState } from "react";
import { Socket } from "../client/socket";
import { RoomCreated, RoomUpdated, RoomDeleted, UserCreated, UserDeleted, UserList, RoomList } from "@shared/event";
import { Room } from "../client/room";
import { User } from "../client/user";
import RoomEntry from "./RoomEntry";
import { GetRooms, GetUsers } from "@shared/action";

const Lobby = () => {
  const socket = Socket.instance;
  const openTask = socket.waitForConnectionOpen(); // TODO: await this
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
    <View style={styles.lobby}>
    <Text style={[styles.normalText, styles.onlineText]}>{users.length} users & {rooms.length} rooms online.</Text>
    <ScrollView contentContainerStyle={styles.roomList}>
      {rooms.map((room) => (
        <RoomEntry key={room.id} room={room}></RoomEntry>
      ))}
    </ScrollView>
    <div style={styles.functionBar}>
      <CreateRoomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      ></CreateRoomModal>
    </div>
  </View>
  );
};

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
  pageBar: {
    display: "flex",
    maxHeight: "5%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
  },
  lobby: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  functionBar: {
    display: "flex",
    width: "100%",
    height: "10%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  roomList: {
    display: "flex",
    width: "100%",
    height: "50%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  normalText: {
    color: "white",
  },
  onlineText: {
    marginBottom: 10,
  },
});

export default Lobby;
