import { Action, Chat, StartGame } from "@shared/action"
import { GameError, GameEvent, NewHost, UserChat, UserJoinedRoom, UserLeftRoom } from "@shared/event"
import { ActionHandling, Broadcasting } from "@/interfaces"
import { User } from "@/user"
import { Game } from "@/game"

export class Room implements Broadcasting, ActionHandling {
    superActionHandler: ActionHandling
    host: User | null = null
    members: User[] = []
    game: Game | null = null
    constructor(
        public readonly id: number,
        public name: string,
        public maxMembers: number,
        public password: string,
    ) { }

    get private() {
        return this.password !== '';
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

    handleAction(user: User, action: Action): void {
        console.log(`Room ${this.id} handles ${action.constructor.name} from ${user.name}`)
        switch (action.constructor) {
            case Chat:
                const chat = action as Chat
                this.broadcast(new UserChat(user.name, chat.message))
                break
            case StartGame:
                if (user === this.host) {
                    this.game = new Game(this.members)
                    this.game.task = this.game.start()
                    this.game.task.then(() => {
                        this.members.forEach(m => m.setSuperActionHandler(this))
                    })
                } else {
                    user.recv(new GameError(1002))
                }
                break
            default:
                this.superActionHandler!.handleAction(user, action)
        }
    }

    setSuperActionHandler(handler: ActionHandling): void {
        this.superActionHandler = handler
    }

    unsetSuperActionHandler(): void {
        this.superActionHandler = null
    }
}