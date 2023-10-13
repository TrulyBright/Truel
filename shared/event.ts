/**
 * This file contains all the events that can be sent to the client.
 */
import { Card, Drift, ErrorCode } from "./enums"
import { PlayerCommonInterface, RoomCommonInterface, UserCommonInterface } from "./interfaces"

export interface Event { }

export class UserCreated implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserCreated(e.name)
}

export class UserDeleted implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserDeleted(e.name)
}

export class UserJoinedRoom implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserJoinedRoom(e.name)
}

export class UserLeftRoom implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (e: UserCommonInterface) => new UserLeftRoom(e.name)
}

export class UserChat implements Event {
    constructor(
        public readonly name: string,
        public readonly message: string,
    ) { }
}

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

export class RoomDeleted implements Event {
    constructor(
        public readonly id: number,
    ) { }

    static from = (e: RoomCommonInterface) => new RoomDeleted(e.id)
}

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

export class YouAreInRoom implements Event { }

export class YouAreOutOfRoom implements Event { }


export class GameError implements Event {
    constructor(
        public readonly code: ErrorCode,
    ) { }
}

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

export class PlayerShot implements Event {
    constructor(
        public readonly shooting: string,
        public readonly target: string,
    ) { }

    static from(shooting: PlayerCommonInterface, target: PlayerCommonInterface) {
        return new PlayerShot(shooting.name, target.name)
    }
}

export class PlayerDead implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (p: PlayerCommonInterface) => new PlayerDead(p.name)
}

export class YourTurn implements Event { }

export class YouDied implements Event { }

export class NowTurnOf implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (p: PlayerCommonInterface) => new NowTurnOf(p.name)
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

    static from = (p: PlayerCommonInterface) => new BulletProofBroken(p.name)
}

export class NewCard implements Event {
    constructor(
        public readonly card: Card
    ) { }
}

export class PlayerDrewCard implements Event {
    constructor(
        public readonly name: string,
    ) { }

    static from = (p: PlayerCommonInterface) => new PlayerDrewCard(p.name)
}

export class CardPlayed implements Event {
    constructor(
        public readonly name: string,
        public readonly card: Card,
    ) { }

    static from = (p: PlayerCommonInterface, card: Card) => new CardPlayed(p.name, card)
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