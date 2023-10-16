/**
 * This file contains all the events that can be sent to the client.
 */
import { Card, Drift, ErrorCode } from "./enums"
import { PlayerCommonInterface, RoomCommonInterface, UserCommonInterface } from "./interfaces"

export interface Event { }

export class UserCreated implements Event {
    constructor(
        public readonly user: UserCommonInterface
    ) { }
}

export class UserDeleted implements Event {
    constructor(
        public readonly user: UserCommonInterface
    ) { }
}

export class UserJoinedRoom implements Event {
    constructor(
        public readonly user: UserCommonInterface
    ) { }
}

export class UserLeftRoom implements Event {
    constructor(
        public readonly user: UserCommonInterface
    ) { }
}

export class UserChat implements Event {
    constructor(
        public readonly user: UserCommonInterface,
        public readonly message: string,
    ) { }
}

export class RoomCreated implements Event {
    constructor(
        public readonly room: RoomCommonInterface,
    ) { }
}

export class RoomDeleted implements Event {
    constructor(
        public readonly room: RoomCommonInterface,
    ) { }
}

export class RoomUpdated implements Event {
    constructor(
        public readonly room: RoomCommonInterface,
    ) { }
}

export class RoomList implements Event {
    constructor(
        public readonly rooms: RoomCommonInterface[],
    ) { }
}

export class UserList implements Event {
    constructor(
        public readonly users: UserCommonInterface[],
    ) { }
}

export class YouAreInRoom implements Event { }

export class YouAreOutOfRoom implements Event { }


export class GameError implements Event {
    constructor(
        public readonly code: ErrorCode,
    ) { }
}

export class NewHost implements Event {
    constructor(
        public readonly user: UserCommonInterface,
    ) { }
}

export class GameStarted implements Event { }

export class NewRound implements Event {
    constructor(
        public readonly roundNo: number
    ) { }
}

export class PlayerShot implements Event {
    constructor(
        public readonly shooting: PlayerCommonInterface,
        public readonly target: PlayerCommonInterface,
    ) { }
}

export class PlayerDead implements Event {
    constructor(
        public readonly player: PlayerCommonInterface,
    ) { }
}

export class YourTurn implements Event { }

export class YouDied implements Event { }

export class NowTurnOf implements Event {
    constructor(
        public readonly player: PlayerCommonInterface,
    ) { }
}

export class NewDrift implements Event {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export class BulletProofBroken implements Event {
    constructor(
        public readonly player: PlayerCommonInterface,
    ) { }
}

export class NewCard implements Event {
    constructor(
        public readonly card: Card
    ) { }
}

export class PlayerDrewCard implements Event {
    constructor(
        public readonly player: PlayerCommonInterface,
    ) { }
}

export class CardPlayed implements Event {
    constructor(
        public readonly player: PlayerCommonInterface,
        public readonly card: Card,
    ) { }
}

export type EventConstructor<T extends Event> = new (...args: any[]) => T

export const constructors: Record<string, EventConstructor<Event>> = {
    UserCreated,
    UserDeleted,
    UserJoinedRoom,
    UserLeftRoom,
    UserChat,
    RoomCreated,
    RoomDeleted,
    RoomUpdated,
    RoomList,
    UserList,
    GameError,
    NewHost,
    GameStarted,
    NewRound,
    PlayerShot,
    PlayerDead,
    YourTurn,
    YouDied,
    NowTurnOf,
    NewDrift,
    BulletProofBroken,
    NewCard,
    PlayerDrewCard,
    CardPlayed,
    YouAreInRoom,
    YouAreOutOfRoom
}