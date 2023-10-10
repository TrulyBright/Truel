import { Action, ActionConstructor, ChangeDrift, Chat, CreateRoom, DrawCard, GetRooms, GetUsers, InRoomAction, JoinRoom, LeaveRoom, PlayCard, Shoot, StartGame } from "@shared/action";
import { GameError, Event, RoomCreated, RoomDeleted, RoomList, RoomUpdated, UserCreated, UserDeleted, UserList } from "@shared/event";
import { Broadcasting } from "@/interfaces";
import Room from "@/room";
import User from "@/user";
import { ActionHandling } from "@/interfaces";

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

    broadcast(event: Event) {
        this.users.forEach(user => user.recv(event))
    }

    addUser(user: User) {
        this.users.push(user)
        this.broadcast(new UserCreated(user.name))
    }

    removeUser(user: User) {
        if (user.room) {
            this.handle(user, new LeaveRoom())
        }
        this.users = this.users.filter(u => u !== user)
        this.broadcast(new UserDeleted(user.name))
    }

    private onCreateRoom(user: User, action: CreateRoom) {
        if (user.room) {
            user.recv(new GameError(1002))
            return
        }
        const room = new Room(this.roomIdCounter++, action.name, action.maxMembers, action.password, user)
        this.rooms.set(room.id, room)
        this.broadcast(RoomCreated.from(room))
        this.handle(user, new JoinRoom(room.id, room.password))
    }

    private onJoinRoom(user: User, action: JoinRoom) {
        const room = this.rooms.get(action.roomId)
        if (!room) {
            user.recv(new GameError(1000))
        } else if (room.password !== action.password) {
            user.recv(new GameError(1003))
        } else {
            room.addMember(user)
            user.joinRoom(room)
            this.broadcast(RoomUpdated.from(room))
        }
    }

    private onLeaveRoom(user: User, action: LeaveRoom) {
        const left = user.room
        if (left) {
            user.leaveRoom()
            left.removeMember(user)
            if (left.empty) {
                this.deleteRoom(left)
            } else {
                this.broadcast(RoomUpdated.from(left))
            }
        } else {
            user.recv(new GameError(1001))
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