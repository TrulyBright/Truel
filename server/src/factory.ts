import { RoomCreated, RoomDeleted, RoomUpdated } from "@shared/event"
import { Room } from "./room"

export const RoomCreatedFactory = (room: Room) => {
    return new RoomCreated(room.id, room.name, room.host.name, room.maxMembers, room.private)
}

export const RoomUpdatedFactory = (room: Room) => {
    return new RoomUpdated(room.id, room.name, room.host.name, room.maxMembers, room.members.map(m => m.name), room.private)
}

export const RoomDeletedFactory = (room: Room) => {
    return new RoomDeleted(room.id)
}
