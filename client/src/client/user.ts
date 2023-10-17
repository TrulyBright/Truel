import { UserCommonInterface } from "@shared/interfaces"

export default class User implements UserCommonInterface {
    constructor(
        public readonly name: string
    ) { }
}