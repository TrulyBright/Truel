/**
 * This file contains all the events that can be sent to the client.
 */
import { Card, Drift } from "./enums"
import { RoomCommonInterface, UserCommonInterface } from "./interfaces"
export type GameEvent = UserCreated | UserDeleted | UserJoinedRoom | UserLeftRoom | UserChat | RoomCreated | RoomDeleted | RoomUpdated | GameError | NewHost | UserShot | UserDead | GameStarted | YourTurn | YouDied | NowTurnOf | NewRound | NewDrift

/**
 * Sent to everyone when a user instance is created.
 */
export class UserCreated {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserCreated(e.name)
}

/**
 * Sent to everyone when a user instance is deleted.
 */
export class UserDeleted {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDeleted(e.name)
}

/**
 * Sent to the members of a room when a user joined that room.
 */
export class UserJoinedRoom {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserJoinedRoom(e.name)
}

/**
 * Sent to the members of a room when a user left that room.
 */
export class UserLeftRoom {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserLeftRoom(e.name)
}

/**
 * Sent to the members of a room when a user sent a chat message.
 */
export class UserChat {
    constructor(
        public readonly name: string,
        public readonly message: string,
    ) { }
}

/**
 * Sent to everyone in the server when a room instance is created.
 */
export class RoomCreated {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly host: string,
        public readonly maxMembers: number,
        public readonly members: string[],
        public readonly isPrivate: boolean
    ) { }

    static from = (e: RoomCommonInterface<UserCommonInterface>) => new RoomCreated(
        e.id,
        e.name,
        e.host.name,
        e.maxMembers,
        e.members.map(m => m.name),
        e.private,
    )
}

/**
 * Sent to everyone in the server when a room instance is deleted.
 */
export class RoomDeleted {
    constructor(
        public readonly id: number,
    ) { }

    static from = (e: RoomCommonInterface<UserCommonInterface>) => new RoomDeleted(e.id)
}

/**
 * Sent to everyone in the server when a room instance is updated.
 */
export class RoomUpdated {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly host: string,
        public readonly maxMembers: number,
        public readonly members: string[],
        public readonly isPrivate: boolean,
    ) { }

    static from = (e: RoomCommonInterface<UserCommonInterface>) => new RoomUpdated(
        e.id,
        e.name,
        e.host.name,
        e.maxMembers,
        e.members.map(m => m.name),
        e.private,
    )
}

export class RoomList {
    constructor(
        public readonly rooms: RoomCreated[],
    ) { }

    static from = (rooms: RoomCommonInterface<UserCommonInterface>[]) => new RoomList(rooms.map(RoomCreated.from))
}

export class UserList {
    constructor(
        public readonly users: UserCreated[],
    ) { }

    static from = (users: UserCommonInterface[]) => new UserList(users.map(UserCreated.from))
}

/**
 * Sent to the user when an error occurs.
 * 1000: Room not found
 * 1001: User not in a room
 * 1002: User is not the host
 * 1003: User not found
 * 1004: User is not alive
 * 9999: Unknown error
 */
export class GameError {
    constructor(
        public readonly code: number,
    ) { }
}

/**
 * Sent to the members of a room when a new host is set.
 */
export class NewHost {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new NewHost(e.name)
}

export class GameStarted { }

export class NewRound {
    constructor(
        public readonly roundNo: number
    ) { }
}

export class UserShot {
    constructor(
        public readonly shooting: string,
        public readonly target: string,
    ) { }
}

export class UserDead {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDead(e.name)
}

export class YourTurn { }

export class YouDied { }

export class NowTurnOf {
    constructor(
        public readonly name: string,
    ) { }
}

export class NewDrift {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export class BulletProofBroken {
    constructor(
        public readonly name: string,
    ) { }
}

export class NewCard {
    constructor(
        public readonly card: Card
    ) { }
}

export class UserDrewCard {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDrewCard(e.name)
}

export class CardPlayed {
    constructor(
        public readonly name: string,
        public readonly card: Card,
    ) { }
}