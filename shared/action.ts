import { Drift } from "./enums"
import { UserCommonInterface } from "./interfaces"

export type Action = CreateRoom | JoinRoom | LeaveRoom | GetRooms | Chat | StartGame | Shoot | DrawCard | PlayCard | ChangeDrift
export type InGameAction = Shoot | DrawCard | PlayCard | ChangeDrift

export class CreateRoom {
    constructor(
        public name: string,
        public maxMembers: number,
        public password: string | null
    ) { }
}

export class JoinRoom {
    constructor(
        public roomId: number,
        public password: string
    ) { }
}

export class LeaveRoom { }

export class GetRooms { }

export class Chat {
    constructor(
        public readonly message: string
    ) {
        this.message = message.slice(0, 100).replace(/\n/g, ' ').trim()
    }
}

export class StartGame { }

export class Shoot {
    constructor(
        public readonly target: string,
    ) { }

    static from(user: UserCommonInterface) {
        return new Shoot(user.name)
    }
}

export class DrawCard { }

export class PlayCard { }

export class ChangeDrift {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export type ActionConstructor = new (...args: any[]) => Action

export const actionConstructors: { [key: string]: ActionConstructor } = {
    GetRooms,
    CreateRoom,
    JoinRoom,
    LeaveRoom,
    Chat,
    StartGame,
    Shoot,
    DrawCard,
    PlayCard,
    ChangeDrift
}