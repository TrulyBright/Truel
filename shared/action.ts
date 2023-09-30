import { Drift } from "./enums"
import { UserCommonInterface } from "./interfaces"

export interface Action { }

export interface InGameAction extends Action { }

export class CreateRoom implements Action {
    static readonly nameMaxLength = 10
    static limiter = (name: string) => name.slice(0, CreateRoom.nameMaxLength).replace(/\n/g, ' ').trim()
    constructor(
        public name: string,
        public maxMembers: number,
        public password: string | null
    ) {
        this.name = CreateRoom.limiter(name)
    }
}

export class JoinRoom implements Action {
    constructor(
        public roomId: number,
        public password: string
    ) { }
}

export class LeaveRoom implements Action { }

export class GetRooms implements Action { }

export class GetUsers implements Action { }

export class Chat implements Action {
    static readonly maxLength = 100
    static limiter = (message: string) => message.slice(0, Chat.maxLength).replace(/\n/g, ' ').trim()
    constructor(
        public readonly message: string
    ) {
        this.message = Chat.limiter(message)
    }
}

export class StartGame implements Action { }

export class Shoot implements InGameAction {
    constructor(
        public readonly target: string,
    ) { }

    static from(user: UserCommonInterface) {
        return new Shoot(user.name)
    }
}

export class DrawCard implements InGameAction { }

export class PlayCard implements InGameAction { }

export class ChangeDrift implements InGameAction {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export type ActionConstructor = new (...args: any[]) => Action

export const actionConstructors: { [key: string]: ActionConstructor } = {
    GetRooms,
    GetUsers,
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