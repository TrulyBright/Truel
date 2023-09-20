/**
 * This file contains the properties of User and Room that are common to both server and client.
 */

export interface UserCommonInterface {
    name: string
}

export interface RoomCommonInterface<T extends UserCommonInterface>{
    readonly id: number
    name: string
    host: T | null
    members: T[]
    maxMembers: number

    get private(): boolean
}