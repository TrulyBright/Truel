import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    transform: {
        "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!variables/.*)"
    ],
    moduleNameMapper: {
        "@/(.*)": "<rootDir>/src/$1",
        "@shared/(.*)": "<rootDir>/../shared/src/$1"
    }
}

export default config