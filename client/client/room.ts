import { RoomCreated, RoomUpdated } from "@shared/event"
import { User } from "./user"

export class Room {
    id: number
    name: string
    host: User
    members: User[]
    maxMembers: number

    constructor(e: RoomCreated | RoomUpdated) {
        this.id = e.id
        this.name = e.name
        this.host = new User(e.host)
        this.maxMembers = e.maxMembers
        this.members = e.members.map(m => new User(m))
    }
}