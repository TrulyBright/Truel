import { Drift } from "./enums"
import { UserCommonInterface } from "./interfaces"

export interface Action { }

/**
 * Action that `Room` handles.
 */
export interface InRoomAction extends Action { }

/**
 * Action that `Game` handles.
 */
export interface InGameAction extends InRoomAction { }

export class CreateRoom implements Action {
    static readonly nameMaxLength = 10
    static readonly limiter = (name: string) => name.slice(0, CreateRoom.nameMaxLength).replace(/\n/g, ' ').trim()
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
        public password: string | null
    ) { }
}

/**
 * Surely `LeaveRoom` is performed when the `User` is in a `Room`.
 * But for the sake of good design, I made it not an `InRoomAction` but a general `Action`, which `Hub` handles.
 * This is because `Hub` is the only one that knows what must happen after a `User` leaves a `Room`.
 */
export class LeaveRoom implements Action { }

export class GetRooms implements Action { }

export class GetUsers implements Action { }

export class Chat implements InRoomAction {
    static readonly maxLength = 100
    static readonly limiter = (message: string) => message.slice(0, Chat.maxLength).replace(/\n/g, ' ').trim()
    constructor(
        public readonly message: string
    ) {
        this.message = Chat.limiter(message)
    }
}

export class StartGame implements InRoomAction { }

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

export type ActionConstructor<T extends Action> = new (...args: any[]) => T

export const constructors: Record<string, ActionConstructor<Action>> = {
    CreateRoom,
    JoinRoom,
    LeaveRoom,
    GetRooms,
    GetUsers,
    Chat,
    StartGame,
    Shoot,
    DrawCard,
    PlayCard,
    ChangeDrift,
}