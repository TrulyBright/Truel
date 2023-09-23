import WebSocketEndpoint from "@/endpoint"

const port = 8080

const endpoint = new WebSocketEndpoint("0.0.0.0", port)
endpoint.start()
endpoint.addDummyUsers(256)