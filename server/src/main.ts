import WebSocketEndpoint from "@/endpoint"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, "../.env") })

const endpoint = new WebSocketEndpoint(process.env.HOSTNAME!, Number(process.env.PORT))
endpoint.start()
endpoint.hub.addDummyUsers(10)
endpoint.hub.addDummyRooms()