export type GameEvent = UserCreated | UserDeleted | UserJoinedRoom | UserLeftRoom | UserChat | RoomCreated | RoomDeleted | RoomUpdated | GameError | NewHost | UserShot | UserDead | GameStarted | YourTurn | YouDied | NowTurnOf

/// Sent to everyone when a user instance is created.
export class UserCreated {
    constructor(
        public readonly name: string,
    ) { }
}

/// Sent to everyone when a user instance is deleted.
export class UserDeleted {
    constructor(
        public readonly name: string,
    ) { }
}

/// Sent to the members of a room when a user joined that room.
export class UserJoinedRoom {
    constructor(
        public readonly name: string,
    ) { }
}

/// Sent to the members of a room when a user left that room.
export class UserLeftRoom {
    constructor(
        public readonly name: string,
    ) { }
}

/// Sent to the members of a room when a user sends a chat message in that room.
export class UserChat {
    constructor(
        public readonly name: string,
        public readonly message: string,
    ) { }
}

/// Sent to everyone in the server when a room instance is created.
export class RoomCreated {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly maxMembers: number,
        public readonly isPrivate: boolean
    ) { }
}

/// Sent to everyone in the server when a room instance is deleted.
export class RoomDeleted {
    constructor(
        public readonly id: number,
    ) { }
}

/// Sent to everyone in the server when a room instance is updated.
export class RoomUpdated {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly maxMembers: number,
        public readonly isPrivate: boolean,
    ) { }
}

/// Sent to the user when an error occurs.
/// 1000: Room not found
/// 1001: User not in a room
/// 1002: User is not the host
/// 1003: User not found
export class GameError {
    constructor(
        public readonly code: number,
    ) { }
}

/// Sent to everyone in a room when a new host is set.
export class NewHost {
    constructor(
        public readonly name: string,
    ) { }
}

export class GameStarted { }

export class UserShot {
    constructor(
        public readonly shooter: string,
        public readonly target: string,
    ) { }
}

export class UserDead {
    constructor(
        public readonly name: string,
    ) { }
}

export class YourTurn { }

export class YouDied { }

export class NowTurnOf {
    constructor(
        public readonly name: string,
    ) { }
}

