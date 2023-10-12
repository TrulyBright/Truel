import { Chat, StartGame, Shoot, PlayCard, DrawCard, ChangeDrift, ActionConstructor, InGameAction, InRoomAction } from "@shared/action"
import { Event, NewHost, UserChat, UserJoinedRoom, UserLeftRoom } from "@shared/event"
import { RoomCommonInterface } from "@shared/interfaces"
import { ActionHandling, Broadcasting } from "@/interfaces"
import User from "@/user"
import Game from "@/game"
import Player from "@/player"
import { ErrorCode } from "@shared/enums"

export default class Room extends ActionHandling<User, InRoomAction> implements Broadcasting, RoomCommonInterface {
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
        this
        .on(Chat, (actor, action) => this.onChat(actor, action))
        .on(StartGame, (actor, action) => this.onStartGame(actor, action))
        const inGameActions: ActionConstructor<InGameAction>[] = [Shoot, DrawCard, PlayCard, ChangeDrift]
        inGameActions.forEach(action => this.on(action, (user, action) => {
            // If user.player is not null, it is guaranteed that the user is playing the game of *this* room.
            // It is because if the user is playing the game of another room, the user is not in this room,
            // which means this callback is never called.
            if (user.player) this.game!.handle(user.player, action)
        }))
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
        if (user !== this.host) throw new Error(ErrorCode[ErrorCode.YouAreNotHost])
        this.game = new Game(this.members.map(m => new Player(m)), this)
        this.game.start()
        this.game.task!.then(() => {
            this.game = null
        })
    }
}