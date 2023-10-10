import { Chat, StartGame, Shoot, PlayCard, DrawCard, ChangeDrift, ActionConstructor, InGameAction, InRoomAction } from "@shared/action"
import { GameError, Event, NewHost, UserChat, UserJoinedRoom, UserLeftRoom } from "@shared/event"
import { RoomCommonInterface } from "@shared/interfaces"
import { ActionHandling, Broadcasting } from "@/interfaces"
import User from "@/user"
import Game from "@/game"

export default class Room extends ActionHandling<InRoomAction> implements Broadcasting, RoomCommonInterface {
    members: User[] = []
    game: Game | null = null
    constructor(
        public readonly id: number,
        public name: string,
        public maxMembers: number,
        public password: string | null,
        public host: User
    ) {
        super()
        this.on(Chat, this.onChat)
        this.on(StartGame, this.onStartGame)
        const inGameActions: ActionConstructor<InGameAction>[] = [Shoot, DrawCard, PlayCard, ChangeDrift]
        inGameActions.forEach(action => this.on(action, (user, action) => this.game?.handle(user, action)))
    }

    get private() {
        return this.password !== null;
    }

    get empty() {
        return this.members.length === 0
    }

    get full() {
        return this.members.length === this.maxMembers
    }

    broadcast(event: Event): void {
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

    private setHost(user: User) {
        this.host = user
        this.broadcast(new NewHost(user.name))
    }

    private onChat(user: User, action: Chat) {
        this.broadcast(new UserChat(user.name, action.message))
    }

    private onStartGame(user: User, action: StartGame) {
        if (user === this.host) {
            this.game = new Game(this.members, this)
            this.game.start()
            this.game.task.then(() => {
                this.game = null
            })
        } else {
            user.recv(new GameError(1002))
        }
    }
}