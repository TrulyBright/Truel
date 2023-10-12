export enum ErrorCode {
    NoSuchRoom,
    WrongPassword,
    YouAreNotHost,
}

export enum Card {
    Robbery, // Take 4 times more money from the target
    BulletProof, // Immune to the next shot
    Run, // Take 20% of the current stake and run away from the game
    Reverse, // Reverse the turn order
    PatronA, // Get 50 dollars immediately
    PatronB, // For every of your turn, get 10 dollars
    Meditation, // Probability drift becomes consistent
    Ammo, // Your probability becomes 0.9
    Curse, // The target you shoot at will have 0.1 probability
    Insurance, // Pay 10 dollars. If you die, you will get 80 dollars
    Destroy, // Destroy cards of all players
    LastDitch // You get one more turn but your probability decreases by 0.25
}

export enum Drift {
    Increase = 1,
    Hold = 0,
    Decrease = -1
}