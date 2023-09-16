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
import { CreateRoom } from "@shared/action";
import { Socket } from "../networking/socket";

const CreateRoomModal = (props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [roomTitle, setRoomTitle] = React.useState("");
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
            <Text>Create Room</Text>
            <TextInput
              style={styles.input}
              onChangeText={setRoomTitle}
              placeholder="Room Title"
              value={roomTitle}
            ></TextInput>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={async () => {
                await createRoom().then(() => {
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

const createRoom = async () => {
  const socket = Socket.instance;
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default CreateRoomModal;
