export interface Vote {
    total: number;
    id: string;
}

export interface GameMap {
    name: string;
    ugc: string;
    banned: boolean;
    mapID: mapIndex;
    imageURL: string;
}

export type mapIndex = '1' | '2' | '3' | '4' | '5' | '6' | '7';

