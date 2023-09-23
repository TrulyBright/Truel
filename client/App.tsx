import { View, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import CreateRoomModal from "./components/CreateRoomModal";
import { useState } from "react";
import { Socket } from "./client/socket";
import { RoomCreated, RoomUpdated, RoomDeleted, UserCreated, UserDeleted, UserList, RoomList } from "@shared/event";
import { Room } from "./client/room";
import { User } from "./client/user";
import RoomEntry from "./components/RoomEntry";
import { GetRooms, GetUsers } from "@shared/action";
import UserEntry from "./components/UserEntry";

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
    <SafeAreaView style={styles.mainView}>
      <div style={styles.lobbyView}>
        <div style={styles.lobbyFunctionBar}>
          <CreateRoomModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          ></CreateRoomModal>
        </div>
        <div style={styles.lobbyMain}>
          <div style={styles.userListContainer}>
            <ScrollView style={styles.userList}>
              {users.map(user => (
                <UserEntry key={user.name} user={user}></UserEntry>
              ))}
            </ScrollView>
          </div>
          <ScrollView style={styles.roomList}>
            {rooms.map((room) => (
              <RoomEntry key={room.id} room={room}></RoomEntry>
            ))}
          </ScrollView>
        </div>
      </div>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainView: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5E0",
    height: "100%",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
  },
  lobbyView: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141E46",
    border: "1px solid white",
    borderRadius: 5,
    width: "90%",
    height: "80%"
  },
  lobbyFunctionBar: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "10%",
  },
  lobbyMain: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  userListContainer: {
    flex: 1,
    border: "1px solid white",
    borderRadius: 5,
    margin: 10,
    width: "20%",
    height: "80%",
  },
  userListHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  userList: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  roomList: {
  }
});

export default App;
