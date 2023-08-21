export type Action = CreateRoom | JoinRoom | LeaveRoom | Chat | StartGame | Mute | Unmute

export class CreateRoom {
    constructor(
        public title: string,
        public maxMembers: number,
        public password: string
    ) {}
}

export class JoinRoom {
    constructor(
        public roomId: number,
        public password: string
    ) {}
}

export class LeaveRoom {}

export class Chat {
    constructor(
        public readonly message: string
    ) {
        this.message = message.slice(0, 100).replace(/\n/g, ' ').trim()
    }
}

export class StartGame {}

export class Mute {
    constructor(
        public readonly name: string,
    ) {}
}

export class Unmute {
    constructor(
        public readonly name: string,
    ) {}
}

export class Shoot {
    constructor(
        public readonly target: string,
    ) {}
}

export class DrawCard {}

export class PlayCard {}