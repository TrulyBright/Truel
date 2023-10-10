/**
 * This file contains the properties of User and Room that are common to both server and client.
 */

/**
 * Properties of User that are common to both server and client.
 */
export interface UserCommonInterface {
    name: string
}

/**
 * Properties of Room that are common to both server and client.
 */
export interface RoomCommonInterface<T extends UserCommonInterface>{
    readonly id: number
    name: string
    host: T
    members: T[]
    maxMembers: number

    get private(): boolean
}