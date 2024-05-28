export interface Card {
    cardName: string;
    value: CardValue;
    type: "hearts" | "clubs" | "spades" | "diamonds";
    color: "red" | "black";
    visible: boolean;
}

export enum CardValue {
    "ACE" = 1,
    "TWO" = 2,
    "TREE" = 3,
    "FOUR" = 4,
    "FIVE" = 5,
    "SIX" = 6,
    "SEVEN" = 7,
    "EIGHT" = 8,
    "NINE" = 9,
    "TEN" = 10,
    "JACK" = 11,
    "QUEEN" = 12,
    "KING" = 13,
}
