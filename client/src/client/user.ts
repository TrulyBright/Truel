import { UserCreated } from "@shared/event"
import { UserCommonInterface } from "@shared/interfaces"

export default class User implements UserCommonInterface {
    constructor(
        public readonly name: string
    ) { }
    static from = (e: UserCreated) => new User(e.name)
}