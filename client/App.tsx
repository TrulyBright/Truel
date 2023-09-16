import { View } from "react-native";
import CreateRoomModal from "./components/CreateRoomModal";
import { useState } from "react";
import { Socket } from "./networking/socket";

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const socket = Socket.instance;
  return (
    <View>
      <CreateRoomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </View>
  );
};

export default App;
