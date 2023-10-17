import { ClassConstructor, Expose } from "class-transformer"
import { Drift } from "@/enums"
import { UserCommonInterface } from "@/interfaces"

export interface Action { }

export interface InRoomAction extends Action { }

export interface InGameAction extends InRoomAction { }

export class CreateRoom implements Action {
    static readonly nameMaxLength = 10
    static readonly limiter = (name: string) => name.slice(0, CreateRoom.nameMaxLength).replace(/\n/g, ' ').trim()

    @Expose()
    name: string
    @Expose()
    maxMembers: number
    @Expose()
    password: string | null
    constructor(
        name: string,
        maxMembers: number,
        password: string | null = null,
    ) {
        this.name = CreateRoom.limiter(name)
        this.maxMembers = maxMembers
        this.password = password
    }
}

export class JoinRoom implements Action {
    @Expose()
    roomId: number
    @Expose()
    password: string | null
    constructor(
        roomId: number,
        password: string | null = null,
    ) {
        this.roomId = roomId
        this.password = password
    }
}

/**
 * Surely `LeaveRoom` is performed when the `User` is in a `Room`.
 * But for the sake of simple design, I made it not an `InRoomAction` but a general `Action`, which `Hub` handles.
 * This is because `Hub` is the only one that knows what must happen after a `User` leaves a `Room`.
 */
export class LeaveRoom implements Action { }

export class GetRooms implements Action { }

export class GetUsers implements Action { }

export class Chat implements InRoomAction {
    static readonly maxLength = 100
    static readonly limiter = (message: string) => message.slice(0, Chat.maxLength).replace(/\n/g, ' ').trim()

    @Expose()
    readonly message: string
    constructor(
        message: string
    ) {
        this.message = Chat.limiter(message)
    }
}

export class StartGame implements InRoomAction { }

export class Shoot implements InGameAction {
    @Expose()
    target: string
    constructor(
        target: UserCommonInterface,
    ) {
        this.target = target.name
    }
}

export class DrawCard implements InGameAction { }

export class PlayCard implements InGameAction { }

export class ChangeDrift implements InGameAction {
    @Expose()
    drift: Drift
    constructor(
        drift: Drift,
    ) {
        this.drift = drift
    }
}

export type ActionConstructor<T extends Action> = ClassConstructor<T>

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