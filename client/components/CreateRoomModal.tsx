import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Alert,
  Pressable,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { CreateRoom } from "@shared/action";
import { Socket } from "../networking/socket";

const CreateRoomModal = (props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [roomName, setRoomName] = React.useState("");
  const [maxMembers, setMaxMembers] = React.useState(8);
  const [roomPassword, setRoomPassword] = React.useState("");
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          props.setModalVisible(!props.modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Create Room</Text>
            <TextInput
              style={styles.input}
              onChangeText={setRoomName}
              placeholder="Room Name"
              value={roomName}
              maxLength={16}
            ></TextInput>
            <Text style={styles.modalText}>{maxMembers} players</Text>
            <Slider
              style={styles.slider}
              minimumValue={3}
              maximumValue={8}
              step={1}
              value={maxMembers}
              onValueChange={setMaxMembers}
            ></Slider>
            <TextInput
              style={styles.input}
              onChangeText={setRoomPassword}
              placeholder="Password"
              secureTextEntry={true}
              value={roomPassword}
            ></TextInput>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={async () => {
                await performCreateRoom(
                  roomName,
                  maxMembers,
                  roomPassword
                ).then(() => {
                  props.setModalVisible(!props.modalVisible);
                });
              }}
            >
              <Text style={styles.textStyle}>Create!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => props.setModalVisible(true)}
      >
        <Text style={styles.textStyle}>Create Room</Text>
      </Pressable>
    </View>
  );
};

const performCreateRoom = async (
  name: string,
  maxMembers: number,
  password: string | null
) => {
  const createRoomAction = new CreateRoom(
    name,
    maxMembers,
    password === "" ? null : password
  );
  const socket = Socket.instance;
  socket.perform(createRoomAction);
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalHeader: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  slider: {
    width: 200,
    height: 40,
  },
});

export default CreateRoomModal;
