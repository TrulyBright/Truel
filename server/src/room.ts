import { Action, Chat, Mute, StartGame, Unmute } from "@shared/action"
import { GameError, GameEvent, NewHost, UserChat, UserJoinedRoom, UserLeftRoom } from "@shared/event"
import { ActionHandling, Broadcasting } from "@/interfaces"
import { User } from "@/user"

export class Room implements Broadcasting, ActionHandling {
    host: User | null = null
    members: User[] = []
    constructor(
        public readonly id: number,
        public title: string,
        public maxMembers: number,
        public password: string,
    ) { }

    get private() {
        return this.password !== '';
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

    handleAction(user: User, action: Action): void {
        switch (action.constructor) {
            case Chat:
                const chat = action as Chat
                this.broadcast(new UserChat(user.name, chat.message))
                break
            case StartGame:
                if (user === this.host) {
                    /// TODO: Start game
                } else {
                    user.recv(new GameError(1002))
                }
                break
            case Mute:
                const mute = action as Mute
                const userToMute = this.members.find(u => u.name === mute.name)
                if (userToMute) {
                    user.addMuted(userToMute)
                } else {
                    user.recv(new GameError(1003))
                }
                break
            case Unmute:
                const unmute = action as Unmute
                const userToUnmute = this.members.find(u => u.name === unmute.name)
                if (userToUnmute) {
                    user.removeMuted(userToUnmute)
                } else {
                    user.recv(new GameError(1003))
                }
                break
            default:
                throw new Error('Unknown action')
            // this.game!.handleAction(user, action)
        }
    }
}