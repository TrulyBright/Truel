import { Drift } from "./enums"

export type Action = CreateRoom | JoinRoom | LeaveRoom | Chat | StartGame | Shoot | DrawCard | PlayCard

export class CreateRoom {
    constructor(
        public title: string,
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
}

export class DrawCard { }

export class PlayCard { }

export class ChangeDrift {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export const actionConstructors: { [K in Action["constructor"]["name"]]: new (...args: any[]) => Action } = {
    CreateRoom,
    JoinRoom,
    LeaveRoom,
    Chat,
    StartGame,
    Shoot,
    DrawCard,
    PlayCard,
}