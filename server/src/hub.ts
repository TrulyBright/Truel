import { ClassConstructor } from "class-transformer";
import { Action, ChangeDrift, Chat, CreateRoom, DrawCard, GetRooms, GetUsers, InRoomAction, JoinRoom, LeaveRoom, PlayCard, Shoot, StartGame } from "@shared/action";
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
        .on(CreateRoom, this.onCreateRoom.bind(this))
        .on(JoinRoom, this.onJoinRoom.bind(this))
        .on(LeaveRoom, this.onLeaveRoom.bind(this))
        .on(GetRooms, this.onGetRooms.bind(this))
        .on(GetUsers, this.onGetUsers.bind(this))
        const inRoomActions: ClassConstructor<InRoomAction>[] = [Chat, StartGame, Shoot, DrawCard, PlayCard, ChangeDrift]
        inRoomActions.forEach(action => this.on(action, (user, action) => {user.room?.handle(user, action)}))
    }

    override handle(user: User, action: Action) {
        try {
            super.handle(user, action)
        } catch (e) {
            if (typeof e === "number") {
                user.recv(new GameError(e as ErrorCode))
            } else {
                console.error(e)
            }
        }
    }

    broadcast(event: Event) {
        this.users.forEach(user => user.recv(event))
    }

    addUser(user: User) {
        console.log(`${user.name} joined`)
        this.users.push(user)
        this.broadcast(new UserCreated(user))
    }

    removeUser(user: User) {
        console.log(`${user.name} left`)
        if (user.room) {
            this.handle(user, new LeaveRoom())
        }
        this.users = this.users.filter(u => u !== user)
        this.broadcast(new UserDeleted(user))
    }

    private onCreateRoom(user: User, action: CreateRoom) {
        if (user.room) {this.handle(user, new LeaveRoom())}
        const room = new Room(this.roomIdCounter++, action.name, action.maxMembers, user, action.password)
        this.rooms.set(room.id, room)
        this.broadcast(new RoomCreated(room))
        this.handle(user, new JoinRoom(room.id, room.password))
    }

    private onJoinRoom(user: User, action: JoinRoom) {
        if (user.room) throw ErrorCode.AlreadyInRoom
        const room = this.rooms.get(action.roomId)
        if (!room) throw ErrorCode.NoSuchRoom
        if (room.full) throw ErrorCode.RoomFull
        if (room.password !== action.password) throw ErrorCode.WrongPassword
        room.addMember(user)
        user.joinRoom(room)
        this.broadcast(new RoomUpdated(room))
    }

    private onLeaveRoom(user: User, action: LeaveRoom) {
        const left = user.room!
        user.leaveRoom()
        left.removeMember(user)
        if (left.empty) {
            this.deleteRoom(left)
        } else {
            this.broadcast(new RoomUpdated(left))
        }
    }

    private onGetRooms(user: User, action: GetRooms) {
        user.recv(new RoomList(Array.from(this.rooms.values())))
    }

    private onGetUsers(user: User, action: GetUsers) {
        user.recv(new UserList(this.users))
    }

    private deleteRoom(room: Room) {
        this.rooms.delete(room.id)
        this.broadcast(new RoomDeleted(room))
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