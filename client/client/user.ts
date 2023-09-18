import { UserCommonInterface } from "@shared/interfaces"

export class User implements UserCommonInterface {
    constructor(
        public readonly name: string
    ) { }
}