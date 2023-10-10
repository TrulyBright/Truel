/**
 * This file contains all the events that can be sent to the client.
 */
import { Card, Drift } from "./enums"
import { RoomCommonInterface, UserCommonInterface } from "./interfaces"

export interface Event { }

/**
 * Sent to everyone when a user instance is created.
 */
export class UserCreated implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserCreated(e.name)
}

/**
 * Sent to everyone when a user instance is deleted.
 */
export class UserDeleted implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDeleted(e.name)
}

/**
 * Sent to the members of a room when a user joined that room.
 */
export class UserJoinedRoom implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserJoinedRoom(e.name)
}

/**
 * Sent to the members of a room when a user left that room.
 */
export class UserLeftRoom implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserLeftRoom(e.name)
}

/**
 * Sent to the members of a room when a user sent a chat message.
 */
export class UserChat implements Event {
    constructor(
        public readonly name: string,
        public readonly message: string,
    ) { }
}

/**
 * Sent to everyone in the server when a room instance is created.
 */
export class RoomCreated implements Event {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly host: string,
        public readonly maxMembers: number,
        public readonly members: string[],
        public readonly isPrivate: boolean
    ) { }

    static from = (e: RoomCommonInterface) => new RoomCreated(
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
export class RoomDeleted implements Event {
    constructor(
        public readonly id: number,
    ) { }

    static from = (e: RoomCommonInterface) => new RoomDeleted(e.id)
}

/**
 * Sent to everyone in the server when a room instance is updated.
 */
export class RoomUpdated implements Event {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly host: string,
        public readonly maxMembers: number,
        public readonly members: string[],
        public readonly isPrivate: boolean,
    ) { }

    static from = (r: RoomCommonInterface) => new RoomUpdated(
        r.id,
        r.name,
        r.host.name,
        r.maxMembers,
        r.members.map(m => m.name),
        r.private,
    )
}

export class RoomList implements Event {
    constructor(
        public readonly rooms: RoomCreated[],
    ) { }

    static from = (rooms: RoomCommonInterface[]) => new RoomList(rooms.map(RoomCreated.from))
}

export class UserList implements Event {
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
export class GameError implements Event {
    constructor(
        public readonly code: number,
    ) { }
}

/**
 * Sent to the members of a room when a new host is set.
 */
export class NewHost implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (u: UserCommonInterface) => new NewHost(u.name)
}

export class GameStarted implements Event { }

export class NewRound implements Event {
    constructor(
        public readonly roundNo: number
    ) { }
}

export class UserShot implements Event {
    constructor(
        public readonly shooting: string,
        public readonly target: string,
    ) { }
}

export class UserDead implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (u: UserCommonInterface) => new UserDead(u.name)
}

export class YourTurn implements Event { }

export class YouDied implements Event { }

export class NowTurnOf implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (u: UserCommonInterface) => new NowTurnOf(u.name)
}

export class NewDrift implements Event {
    constructor(
        public readonly drift: Drift,
    ) { }
}

export class BulletProofBroken implements Event {
    constructor(
        public readonly name: string,
    ) { }
}

export class NewCard implements Event {
    constructor(
        public readonly card: Card
    ) { }
}

export class UserDrewCard implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDrewCard(e.name)
}

export class CardPlayed implements Event {
    constructor(
        public readonly name: string,
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
    UserShot,
    UserDead,
    YourTurn,
    YouDied,
    NowTurnOf,
    NewDrift,
    BulletProofBroken,
    NewCard,
    UserDrewCard,
    CardPlayed,
}