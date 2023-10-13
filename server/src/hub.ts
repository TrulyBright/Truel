import { Action, ActionConstructor, ChangeDrift, Chat, CreateRoom, DrawCard, GetRooms, GetUsers, InRoomAction, JoinRoom, LeaveRoom, PlayCard, Shoot, StartGame } from "@shared/action";
import { GameError, Event, RoomCreated, RoomDeleted, RoomList, RoomUpdated, UserCreated, UserDeleted, UserList } from "@shared/event";
import { Broadcasting } from "@/interfaces";
import Room from "@/room";
import User from "@/user";
import { ActionHandling } from "@/interfaces";
import { ErrorCode } from "@shared/enums";

export default class Hub extends ActionHandling<User, Action> implements Broadcasting {
    users: User[] = []
    rooms: Map<number, Room> = new Map()
    roomIdCounter = 0

    constructor() {
        super()
        this
        .on(CreateRoom, (actor, action) => this.onCreateRoom(actor, action))
        .on(JoinRoom, (actor, action) => this.onJoinRoom(actor, action))
        .on(LeaveRoom, (actor, action) => this.onLeaveRoom(actor, action))
        .on(GetRooms, (actor, action) => this.onGetRooms(actor, action))
        .on(GetUsers, (actor, action) => this.onGetUsers(actor, action))
        const inRoomActions: ActionConstructor<InRoomAction>[] = [Chat, StartGame, Shoot, DrawCard, PlayCard, ChangeDrift]
        inRoomActions.forEach(action => this.on(action, (user, action) => {user.room?.handle(user, action)}))
    }

    override handle(user: User, action: Action) {
        try {
            super.handle(user, action)
        } catch (e) {
            if (e instanceof Error) {
                user.recv(new GameError(ErrorCode[e.message as keyof typeof ErrorCode]))
            } else {
                throw e
            }
        }
    }

    broadcast(event: Event) {
        this.users.forEach(user => user.recv(event))
    }

    addUser(user: User) {
        console.log(`${user.name} joined`)
        this.users.push(user)
        this.broadcast(new UserCreated(user.name))
    }

    removeUser(user: User) {
        console.log(`${user.name} left`)
        if (user.room) {
            this.handle(user, new LeaveRoom())
        }
        this.users = this.users.filter(u => u !== user)
        this.broadcast(new UserDeleted(user.name))
    }

    private onCreateRoom(user: User, action: CreateRoom) {
        if (user.room) {this.handle(user, new LeaveRoom())}
        const room = new Room(this.roomIdCounter++, action.name, action.maxMembers, action.password, user)
        this.rooms.set(room.id, room)
        this.broadcast(RoomCreated.from(room))
        this.handle(user, new JoinRoom(room.id, room.password))
    }

    private onJoinRoom(user: User, action: JoinRoom) {
        if (user.room) throw new Error(ErrorCode[ErrorCode.AlreadyInRoom])
        const room = this.rooms.get(action.roomId)
        if (!room) throw new Error(ErrorCode[ErrorCode.NoSuchRoom])
        if (room.password !== action.password) throw new Error(ErrorCode[ErrorCode.WrongPassword])
        room.addMember(user)
        user.joinRoom(room)
        this.broadcast(RoomUpdated.from(room))
    }

    private onLeaveRoom(user: User, action: LeaveRoom) {
        const left = user.room!
        user.leaveRoom()
        left.removeMember(user)
        if (left.empty) {
            this.deleteRoom(left)
        } else {
            this.broadcast(RoomUpdated.from(left))
        }
    }

    private onGetRooms(user: User, action: GetRooms) {
        user.recv(RoomList.from(Array.from(this.rooms.values())))
    }

    private onGetUsers(user: User, action: GetUsers) {
        user.recv(UserList.from(this.users))
    }

    private deleteRoom(room: Room) {
        this.rooms.delete(room.id)
        this.broadcast(RoomDeleted.from(room))
    }

    addDummyUsers(count: number) {
        for (let i = 0; i < count; i++) {
            const user = new User("dummy" + i)
            this.addUser(user)
        }
    }

    addDummyRooms() {
        this.users.filter(user => user.name.startsWith("dummy")).forEach((user, i) => {
            this.handle(user, new CreateRoom("dummyRoom", 8, i % 2 === 0 ? "password": null))
        })
    }
}