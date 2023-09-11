import { Action, CreateRoom, JoinRoom, LeaveRoom } from "@shared/action";
import { GameError, GameEvent, RoomCreated, RoomDeleted, RoomUpdated, UserCreated, UserDeleted } from "@shared/event";
import { ActionHandling, Broadcasting } from "@/interfaces";
import { Room } from "@/room";
import { User } from "@/user";

export class Hub implements Broadcasting, ActionHandling {
    users: User[] = []
    rooms: Map<number, Room> = new Map()
    roomIdCounter = 0

    broadcast(event: GameEvent) {
        this.users.forEach(user => user.recv(event))
    }

    addUser(user: User) {
        this.users.push(user)
        this.broadcast(new UserCreated(user.name))
    }

    removeUser(user: User) {
        this.users = this.users.filter(u => u !== user)
        this.broadcast(new UserDeleted(user.name))
    }

    // HACK: hub can handle actions of a user who is not in the hub.
    handleAction(user: User, action: Action) {
        console.log(`Hub handles ${action.constructor.name} from ${user.name} with args ${JSON.stringify(action)} `)
        try {
            switch (action.constructor) {
                case CreateRoom:
                    this.handleCreateRoom(user, action as CreateRoom)
                    break
                case JoinRoom:
                    this.handleJoinRoom(user, action as JoinRoom)
                    break
                case LeaveRoom:
                    this.handleLeaveRoom(user, action as LeaveRoom)
                    break
                default:
                    user.room!.handleAction(user, action)
            }
            user.afterAction(action)
        } catch (e) {
            console.log(e)
            console.log(user.last50Events)
            user.recv(new GameError(9999))
        }
    }

    handleCreateRoom(user: User, action: CreateRoom) {
        if (user.room) {
            user.recv(new GameError(1002))
            return
        }
        const room = new Room(this.roomIdCounter++, action.title, action.maxMembers, action.password)
        this.rooms.set(room.id, room)
        this.handleAction(user, new JoinRoom(room.id, room.password))
        room.setHost(user)
        this.broadcast(new RoomCreated(room.id, room.title, room.maxMembers, room.private))
    }

    handleJoinRoom(user: User, action: JoinRoom) {
        const room = this.rooms.get(action.roomId)
        if (!room) {
            user.recv(new GameError(1000))
        } else if (room.password !== action.password) {
            user.recv(new GameError(1003))
        } else {
            room.addMember(user)
            user.joinRoom(room)
            this.broadcast(new RoomUpdated(room.id, room.title, room.maxMembers, room.private))
        }
    }

    handleLeaveRoom(user: User, action: LeaveRoom) {
        const left = user.room
        if (left) {
            user.leaveRoom()
            left.removeMember(user)
            if (left.empty) {
                this.deleteRoom(left)
            } else {
                this.broadcast(new RoomUpdated(left.id, left.title, left.maxMembers, left.private))
            }
        } else {
            user.recv(new GameError(1001))
        }
    }

    deleteRoom(room: Room) {
        this.rooms.delete(room.id)
        this.broadcast(new RoomDeleted(room.id))
    }
}