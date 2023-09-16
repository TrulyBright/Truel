import { RoomCreated, RoomUpdated } from "@shared/event"
import { User } from "./user"

export class Room {
    id: number
    name: string
    host: User
    members: User[]
    maxMembers: number

    constructor(e: RoomCreated) {
        this.id = e.id
        this.name = e.name
        this.host = new User(e.host)
        this.maxMembers = e.maxMembers
        this.members = []
    }

    public update(event: RoomUpdated) {
        this.name = event.name
        this.maxMembers = event.maxMembers
        this.members = event.members.map(m => new User(m))
    }
}