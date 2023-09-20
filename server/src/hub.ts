import { ChangeDrift, Chat, CreateRoom, DrawCard, InGameAction, JoinRoom, LeaveRoom, PlayCard, Shoot, StartGame } from "@shared/action";
import { GameError, GameEvent, RoomCreated, RoomDeleted, RoomUpdated, UserCreated, UserDeleted } from "@shared/event";
import { Broadcasting } from "@/interfaces";
import { Room } from "@/room";
import { User } from "@/user";
import { EventEmitter } from "node:events";

export class Hub extends EventEmitter implements Broadcasting {
    users: User[] = []
    rooms: Map<number, Room> = new Map()
    roomIdCounter = 0

    constructor() {
        super()
        this.on(CreateRoom.name, this.handleCreateRoom)
        this.on(JoinRoom.name, this.handleJoinRoom)
        this.on(LeaveRoom.name, this.handleLeaveRoom)
        // Q. What if user.room or user.room.game is undefined in the code below?
        // A. Just let it throw error.
        this.on(Chat.name, (user: User, action: Chat) => user.room.handleChat(user, action))
        this.on(StartGame.name, (user: User, action: StartGame) => user.room.handleStartGame(user, action))
        const inGameActions = [Shoot, DrawCard, PlayCard, ChangeDrift]
        inGameActions.forEach(action => {
            this.on(action.name, (user: User, action: InGameAction) => {
                user.room.game.emit(action.constructor.name, user, action)
            })
        })
    }

    broadcast(event: GameEvent) {
        this.users.forEach(user => user.recv(event))
    }

    addUser(user: User) {
        this.users.push(user)
        this.broadcast(new UserCreated(user.name))
        this.rooms.forEach(room => {
            user.recv(RoomCreated.from(room))
        })
    }

    removeUser(user: User) {
        if (user.room) {
            this.emit(LeaveRoom.name, user, new LeaveRoom())
        }
        this.users = this.users.filter(u => u !== user)
        this.broadcast(new UserDeleted(user.name))
    }

    handleCreateRoom(user: User, action: CreateRoom) {
        if (user.room) {
            user.recv(new GameError(1002))
            return
        }
        const room = new Room(this.roomIdCounter++, action.name, action.maxMembers, action.password)
        room.setHost(user)
        this.rooms.set(room.id, room)
        this.broadcast(RoomCreated.from(room))
        this.emit(JoinRoom.name, user, new JoinRoom(room.id, room.password))
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
            this.broadcast(RoomUpdated.from(room))
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
                this.broadcast(RoomUpdated.from(left))
            }
        } else {
            user.recv(new GameError(1001))
        }
    }

    deleteRoom(room: Room) {
        this.rooms.delete(room.id)
        this.broadcast(RoomDeleted.from(room))
    }
}