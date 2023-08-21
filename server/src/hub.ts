import { Action, CreateRoom, JoinRoom, LeaveRoom } from "@shared/action";
import { GameError, GameEvent, RoomCreated, UserCreated, UserDeleted } from "@shared/event";
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

    handleAction(user: User, action: Action) {
        switch (action.constructor) {
            case CreateRoom:
                const createRoom = action as CreateRoom
                const room = new Room(this.roomIdCounter++, createRoom.title, createRoom.maxMembers, createRoom.password)
                this.rooms.set(room.id, room)
                this.broadcast(new RoomCreated(room.id, room.title, room.maxMembers, room.password))
                break
            case JoinRoom:
                const joinRoom = action as JoinRoom
                const roomToJoin = this.rooms.get(joinRoom.roomId)
                if (roomToJoin) {
                    roomToJoin.addMember(user)
                } else {
                    user.recv(new GameError(1000))
                }
                break
            case LeaveRoom:
                const roomToLeave = user.room
                if (roomToLeave) {
                    roomToLeave.removeMember(user)
                } else {
                    user.recv(new GameError(1001))
                }
                break
            default:
                user.room!.handleAction(user, action)
        }
    }
}