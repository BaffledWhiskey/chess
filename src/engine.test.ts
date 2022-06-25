import 'jest-extended';
import { calculateValidPawnMoves, calculateValidRookMoves, checkTargetCoordForHostilePiece, emptySpace, generateDiagonalPath, generateStraightPath } from "./engine"
import { State } from "./fenEncoding";


let emptyBoard =
    [[0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]];


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

beforeEach((): void => {
    emptyBoard =
        [[0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]];
});

describe('tests generatePath', (): void => {
    test('generates straightline path in y coord between 6,0 - 4,0', (): void => {
        expect(generateStraightPath({ x: 0, y: 6 }, { x: 0, y: 4 })).toEqual([{ x: 0, y: 5 }, { x: 0, y: 4 }]);
    });

    test('generates straightline path in y coord between 4,0 - 6,0', (): void => {
        expect(generateStraightPath({ x: 0, y: 4 }, { x: 0, y: 6 })).toEqual([{ x: 0, y: 5 }, { x: 0, y: 6 }]);
    });

    test('generates straightline path in x coord between 4,0 - 4,2', (): void => {
        expect(generateStraightPath({ x: 0, y: 4 }, { x: 2, y: 4 })).toEqual([{ x: 1, y: 4 }, { x: 2, y: 4 }]);
    });

    test('generates straightline path in x coord between 6,1 - 6,4', (): void => {
        expect(generateStraightPath({ x: 1, y: 6 }, { x: 4, y: 6 })).toEqual([{ x: 2, y: 6 }, { x: 3, y: 6 },{ x: 4, y: 6 }]);
    });
});

describe('test emptySpace', (): void => {
    test('validate that 4,4 is empty default board', (): void => {
        expect(emptySpace({ x: 4, y: 4 }, defaultState)).toEqual(true);
    }); 

    test('validate that 1,1 is not empty default board', (): void => {
        expect(emptySpace({ x: 1, y: 1 }, defaultState)).toEqual(false);
    }); 

    test('validate that 8,8 is not empty default board', (): void => {
        expect(emptySpace({ x: 8, y: 8 }, defaultState)).toEqual(false);
    }); 

    test('validate that 0,0 is empty empty board', (): void => {
        expect(emptySpace({ x: 0, y: 0 }, {
            ...defaultState,
            board: emptyBoard
        })).toEqual(true);
    });

    test('validate that 0,8 is not empty empty board', (): void => {
        expect(emptySpace({ x: 8, y: 0 }, {
            ...defaultState,
            board: emptyBoard
        })).toEqual(false);
    });

    test('validate that 8,0 is not empty empty board', (): void => {
        expect(emptySpace({ x: 0, y: 8 }, {
            ...defaultState,
            board: emptyBoard
        })).toEqual(false);
    });
});

describe('test calc valid pawn moves', (): void => {
    test('calculates valid pawn move when pawn starting on default board', (): void => {
        expect(calculateValidPawnMoves({ x: 0, y: 6 }, defaultState, 8)).toIncludeAllMembers([{ x: 0, y: 5 }, { x: 0, y: 4 }]);
    });

    test('calculates valid pawn move when pawn already moved', (): void => {
        expect(calculateValidPawnMoves({ x: 0, y: 4 }, {
            ...defaultState,
            board: [[4, 2, 3, 5, 6, 3, 2, 4],
            [1, 1, 0, 1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [9, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 9, 9, 9, 9, 9, 9, 9],
            [12, 10, 11, 13, 14, 11, 10, 12]]
        }, 8)).toEqual([{ x: 0, y: 3 }]);
    });

    test('calculates valid pawn move when valid capturable piece', (): void => {
        expect(calculateValidPawnMoves({ x: 0, y: 4 }, {
            ...defaultState,
            board:
            [[4, 2, 3, 5, 6, 3, 2, 4],
            [1, 0, 0, 1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [9, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 9, 9, 9, 9, 9, 9, 9],
            [12, 10, 11, 13, 14, 11, 10, 12]]
        }, 8)).toIncludeAllMembers([{ x: 0, y: 3 }, { x: 1, y: 3}]);
    });

    test('calculates valid pawn move when valid capturable piece', (): void => {
        expect(calculateValidPawnMoves({ x: 3, y: 5 }, {
            ...defaultState,
            board:
            [[4, 2, 3, 5, 6, 3, 2, 4],
            [1, 1, 0, 1, 0, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 9, 0, 0, 0, 0],
            [9, 9, 9, 0, 9, 9, 9, 9],
            [12, 10, 11, 13, 14, 11, 10, 12]]
        }, 8)).toIncludeAllMembers([{ x: 2, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 }]);
    });
});

describe('test calc valid rook moves', (): void => {
    test('white rook in position 4,4 with empty board', (): void => {
        const board = emptyBoard;
        board[4][4] = 12;
        expect(calculateValidRookMoves({ x: 4, y: 4 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 },
            { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
            { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 },
            { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 }
        ])
    });

    test('white rook in position 4,4 with black pawn in 4,6', (): void => {
        const board = emptyBoard;
        board[4][4] = 12;
        board[6][4] = 1;
        expect(calculateValidRookMoves({ x: 4, y: 4 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 },
            { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
            { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 },
            { x: 4, y: 5 }, { x: 4, y: 6 }
        ]);
    });

    test('white rook in position 4,4 with black pawn in 4,5', (): void => {
        const board = emptyBoard;
        board[4][4] = 12;
        board[5][4] = 1;
        expect(calculateValidRookMoves({ x: 4, y: 4 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 },
            { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
            { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 },
            { x: 4, y: 5 }
        ]);
    });

    test('white rook in position 4,4 with black pawn in 5,4', (): void => {
        const board = emptyBoard;
        board[4][4] = 12;
        board[4][5] = 1;
        expect(calculateValidRookMoves({ x: 4, y: 4 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 },
            { x: 5, y: 4 },
            { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 },
            { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 }
        ]);
    });

    test('white rook in position 0,0 with black pawn in 0,4', (): void => {
        const board = emptyBoard;
        board[0][0] = 12;
        board[4][0] = 1;
        expect(calculateValidRookMoves({ x: 0, y: 0 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 },
        ]);
    });

    test('white rook in position 0,0 with black pawns in 0,4 + 4,0', (): void => {
        const board = emptyBoard;
        board[0][0] = 12;
        board[4][0] = 1;
        expect(calculateValidRookMoves({ x: 0, y: 0 }, { ...defaultState, board }, 8)).toIncludeAllMembers([
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 },
        ]);
    });
});

describe('test checkTargetCoordForHostilePiece', (): void => {
    test('returns true when checking 1,1 for hostile white pawn on 1,1', (): void => {
        const board = emptyBoard;
        board[1][1] = 9;
        expect(checkTargetCoordForHostilePiece({ x: 1, y: 1 }, {
            ...defaultState,
            board
        }, 0)).toEqual(true);
    });

    test('returns true when checking 2,1 for hostile white pawn on 1,1', (): void => {
        const board = emptyBoard;
        board[1][2] = 9;
        expect(checkTargetCoordForHostilePiece({ x: 2, y: 1 }, {
            ...defaultState,
            board
        }, 0)).toEqual(true);
    });

    //Ensure that the enpassant coord is valid for testing!! - omitted check for speed, should be done in validation
    test('returns true when enpassant target on 1,1', (): void => {
        const board = emptyBoard;
        expect(checkTargetCoordForHostilePiece({ x: 1, y: 1 }, {
            ...defaultState,
            board,
            enpassantTarget: {x: 1, y: 1}
        }, 0)).toEqual(true);
    });

    test('returns true when enpassant target on 7,1', (): void => {
        const board = emptyBoard;
        expect(checkTargetCoordForHostilePiece({ x: 7, y: 1 }, {
            ...defaultState,
            board,
            enpassantTarget: {x: 7, y: 1}
        }, 0)).toEqual(true);
    });
});

describe('test generateDiagonalPath', (): void => {
    test('generates diagonal path between 0,0 and 7,7', (): void => {
        expect(generateDiagonalPath({ x: 0, y: 0 }, { x: 7, y: 7 })).toEqual([
            { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 },
            { x: 6, y: 6 }, { x: 7, y: 7 }
        ]); 
    });

    test('generates diagonal path between 3,0 and 7,4', (): void => {
        expect(generateDiagonalPath({ x: 3, y: 0 }, { x: 7, y: 4 })).toEqual([
            { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 3 }, { x: 7, y: 4 }
        ]); 
    });

    test('generates diagonal path between 7,4 and 3,0', (): void => {
        expect(generateDiagonalPath({ x: 7, y: 4 }, { x: 3, y: 0 })).toEqual([
            { x: 3, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 3 }
        ].reverse()); 
    });

    test('generates diagonal path between 7,0 and 0,7', (): void => {
        expect(generateDiagonalPath({ x: 7, y: 0 }, { x: 0, y: 7 })).toEqual([
            { x: 6, y: 1 }, { x: 5, y: 2 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 5 }, { x: 1, y: 6 }, { x: 0, y: 7 }
        ]);
    });

    test('generates diagonal path between 7,0 and 2,5', (): void => {
        expect(generateDiagonalPath({ x: 7, y: 0 }, { x: 2, y: 5 })).toEqual([
            { x: 6, y: 1 }, { x: 5, y: 2 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 5 }
        ]);
    });

});