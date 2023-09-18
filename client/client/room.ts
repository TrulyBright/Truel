import { RoomCreated, RoomUpdated } from "@shared/event"
import { RoomCommonInterface } from "@shared/interfaces"
import { User } from "./user"

export class Room implements RoomCommonInterface<User> {
    constructor(
        public id: number,
        public name: string,
        public host: User,
        public members: User[],
        public maxMembers: number,
    ) { }
    
    get private(): boolean {
        throw new Error("Method not implemented.")
    }

    static from(e: RoomCreated | RoomUpdated) {
        return new Room(
            e.id,
            e.name,
            new User(e.host),
            e.members.map(m => new User(m)),
            e.maxMembers,
        )
    }
}