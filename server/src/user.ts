import { Event } from "@shared/event"
import { EventListening, UserCommonInterface } from "@shared/interfaces"
import { Queue } from "@shared/utils"
import Room from "@/room"
import Player from "@/player"
import { Exclude, Expose } from "class-transformer"

@Exclude()
export default class User extends EventListening implements UserCommonInterface {
    room: Room | null = null
    readonly last50Events = new Queue()
    private readonly eventRecorder = (e: Event) => {
        this.last50Events.enqueue(e)
        if (this.last50Events.length > 50) this.last50Events.dequeue()
    }
    player: Player | null = null

    @Expose()
    readonly name: string
    constructor(name: string) {
        super()
        this.name = name
        this.setDefaultListener(this.eventRecorder)
    }

    joinRoom(room: Room) {
        this.room = room
    }

    leaveRoom() {
        this.room = null
        this.player = null
    }
}