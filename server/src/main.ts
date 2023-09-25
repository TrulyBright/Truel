import WebSocketEndpoint from "@/endpoint"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, "../.env") })

const endpoint = new WebSocketEndpoint(process.env.HOSTNAME, Number(process.env.PORT))
endpoint.start()
endpoint.addDummyUsers(256)
endpoint.addDummyRooms()