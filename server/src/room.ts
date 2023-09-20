import { Action, Chat, StartGame } from "@shared/action"
import { GameError, GameEvent, NewHost, UserChat, UserJoinedRoom, UserLeftRoom } from "@shared/event"
import { RoomCommonInterface } from "@shared/interfaces"
import { Broadcasting } from "@/interfaces"
import { User } from "@/user"
import { Game } from "@/game"

export class Room implements Broadcasting, RoomCommonInterface<User> {
    host: User | null = null
    members: User[] = []
    game: Game | null = null
    constructor(
        public readonly id: number,
        public name: string,
        public maxMembers: number,
        public password: string | null,
    ) { }

    get private() {
        return this.password !== null;
    }

    get empty() {
        return this.members.length === 0
    }

    get full() {
        return this.members.length === this.maxMembers
    }

    broadcast(event: GameEvent): void {
        this.members.forEach(user => user.recv(event))
    }

    addMember(user: User) {
        this.members.push(user)
        this.broadcast(new UserJoinedRoom(user.name))
    }

    removeMember(user: User) {
        this.members = this.members.filter(u => u !== user)
        this.broadcast(new UserLeftRoom(user.name))
        if (user === this.host && this.members.length > 0) {
            this.setHost(this.members[0])
        }
    }

    setHost(user: User) {
        this.host = user
        this.broadcast(new NewHost(user.name))
    }

    handleChat(user: User, action: Chat) {
        this.broadcast(new UserChat(user.name, action.message))
    }

    handleStartGame(user: User, action: StartGame) {
        if (user === this.host) {
            this.game = new Game(this.members, this)
            this.game.task = this.game.start().then(() => {
                this.game = null
            })
        } else {
            user.recv(new GameError(1002))
        }
    }
}