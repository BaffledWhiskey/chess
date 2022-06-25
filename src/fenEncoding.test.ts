import { encodeStateToFen, parseFenString, State } from './fenEncoding';

const defaultState: State = {
    board: [[4, 2, 3, 5, 6, 3, 2, 4],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [9, 9, 9, 9, 9, 9, 9, 9],
        [12, 10, 11, 13, 14, 11, 10, 12]] as number[][],
    //8 white,
    //0 black
    selfColour: 8,
    castleState: {
        whiteCastleKingside: true,
        whiteCastleQueenside: true,
        blackCastleKingside: true,
        blackCastleQueenside: true
    },
    //Single coord for enpassant target - I'm pretty sure there is only ever one target coord for this?
    enpassantTarget: undefined,
    halfmoveClock: 0,
    fullmoveCounter: 1,
}

describe('parseFenString', () => {
    test('parses empty string', ():void => {
        expect(parseFenString('')).toEqual(defaultState);
    });

    test('correctly parses start game fen string', (): void => {
        expect(parseFenString('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
            .toEqual(defaultState);
    });

    test('correctly parses fen string when white has moved single pawn', (): void => {
        expect(parseFenString('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')).toEqual(
        {
            ...defaultState,
            board: [[4, 2, 3, 5, 6, 3, 2, 4],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 9, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [9, 9, 9, 9, 0, 9, 9, 9],
            [12, 10, 11, 13, 14, 11, 10, 12]],
            enpassantTarget: { x: 4, y: 5 },
            selfColour: 0
        }) 
    });

    test('correctly parses fen string when black has moved pawn in response', (): void => {
        expect(parseFenString('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2')).toEqual(
            {
                ...defaultState,
                board: [[4, 2, 3, 5, 6, 3, 2, 4],
                [1, 1, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 9, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [9, 9, 9, 9, 0, 9, 9, 9],
                [12, 10, 11, 13, 14, 11, 10, 12]],
                enpassantTarget: { x: 2, y: 2 },
                fullmoveCounter: 2
            }
        )
    });

    test('correctly parses game after white knight moves', (): void => {
        expect(parseFenString('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2')).toEqual(
            {
                ...defaultState,
                board: [[4, 2, 3, 5, 6, 3, 2, 4],
                [1, 1, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 9, 0, 0, 0],
                [0, 0, 0, 0, 0, 10, 0, 0],
                [9, 9, 9, 9, 0, 9, 9, 9],
                [12, 10, 11, 13, 14, 11, 0, 12]],
                enpassantTarget: undefined,
                selfColour: 0,
                halfmoveClock: 1,
                fullmoveCounter: 2
            }
        )
    });
});

describe('state to fen tests', (): void => {
    test('default state parsed to default fen', (): void => {
        expect(encodeStateToFen(defaultState)).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    });

    test('correctly parses state after single moved played', (): void => {
        expect(encodeStateToFen({
            ...defaultState,
            board: [[4, 2, 3, 5, 6, 3, 2, 4],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 9, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [9, 9, 9, 9, 0, 9, 9, 9],
            [12, 10, 11, 13, 14, 11, 10, 12]],
            enpassantTarget: { x: 4, y: 5 },
            selfColour: 0
        })).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    });

    test('parses state to fen 3 moves in', (): void => {
        expect(encodeStateToFen({
            ...defaultState,
                board: [[4, 2, 3, 5, 6, 3, 2, 4],
                [1, 1, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 9, 0, 0, 0],
                [0, 0, 0, 0, 0, 10, 0, 0],
                [9, 9, 9, 9, 0, 9, 9, 9],
                [12, 10, 11, 13, 14, 11, 0, 12]],
                enpassantTarget: undefined,
                selfColour: 0,
                halfmoveClock: 1,
                fullmoveCounter: 2
        })).toEqual('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2')
    });

    test('parses state to fen 3 moves in with some magic meaning no castleing', (): void => {
        expect(encodeStateToFen({
            ...defaultState,
                board: [[4, 2, 3, 5, 6, 3, 2, 4],
                [1, 1, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 9, 0, 0, 0],
                [0, 0, 0, 0, 0, 10, 0, 0],
                [9, 9, 9, 9, 0, 9, 9, 9],
                [12, 10, 11, 13, 14, 11, 0, 12]],
            enpassantTarget: undefined,
            castleState: {
                blackCastleKingside: false,
                blackCastleQueenside: false,
                whiteCastleKingside: false,
                whiteCastleQueenside: false
                },
                selfColour: 0,
                halfmoveClock: 1,
                fullmoveCounter: 2
        })).toEqual('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b - - 1 2')
    });
});