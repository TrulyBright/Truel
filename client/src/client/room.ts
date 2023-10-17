import { RoomCommonInterface } from "@shared/interfaces"
import User from "@/client/user"

export default class Room implements RoomCommonInterface {
    constructor(
        public readonly id: number,
        public name: string,
        public host: User,
        public members: User[],
        public maxMembers: number,
        public isPrivate: boolean,
    ) { }
}