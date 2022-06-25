

const pawn = 1;
const knight = 2;
const bishop = 3;
const rook = 4;
const queen = 5;
const king = 6;
const black = 0;
const white = 8;


//WHITE IS UPPERCASE
//black is lowercase
const dict: Record<string, number> = {
    'r': rook + black, 'n': knight + black, 'b' : bishop + black, 'q' : queen + black, 'k' : king + black, 'p' : pawn + black,
    'R': rook + white, 'N': knight + white, 'B' : bishop + white, 'Q' : queen + white, 'K' : king + white, 'P' : pawn + white
};


const allowed = ['r', 'n', 'b', 'q', 'k'];

interface CastleState {
    whiteCastleKingside: boolean;
    whiteCastleQueenside: boolean;
    blackCastleKingside: boolean;
    blackCastleQueenside: boolean;
}

export interface Coord{
    x: number;
    y: number;
}

export interface State{
    board: number[][];
    selfColour: 0 | 8;
    castleState: CastleState;
    //Single coord for enpassant target - I'm pretty sure there is only ever one target coord for this?
    enpassantTarget?: Coord;
    halfmoveClock: number;
    fullmoveCounter: number;
}

export const calculateCastles = (castleFenSegment: string): CastleState => {
    const castleState = {
        whiteCastleKingside: true,
        whiteCastleQueenside: true,
        blackCastleKingside: true,
        blackCastleQueenside: true
    }
    if (castleFenSegment) {
        if (!castleFenSegment.includes('K')) castleState.whiteCastleKingside = false;
        if (!castleFenSegment.includes('Q')) castleState.whiteCastleQueenside = false;
        if (!castleFenSegment.includes('k')) castleState.blackCastleKingside = false;
        if (!castleFenSegment.includes('q')) castleState.blackCastleQueenside = false;
    }

    return castleState;
}

export const parseEnPassant = (coord: string): Coord => {
    if (!coord || coord === '-') return undefined;
    return {
        x: ((coord.charCodeAt(0) - 97)),
        y: (7 - parseInt(coord.split('')[1])) + 1
    }
}

// parses fen string to internal representation - if empty string passed returns default game state
export const parseFenString = (fenString: string): State => {

    const boardState = fenString.split(' ')[0] ? fenString.split(' ')[0] : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const selfColour = fenString.split(' ')[1] === 'b' ? 0 : 8;
    const castleState = calculateCastles(fenString.split(' ')[2]);
    const enpassantTarget = parseEnPassant(fenString.split(' ')[3]);
    const halfmoveClock = fenString.split(' ')[4] ? parseInt(fenString.split(' ')[4]) : 0;
    const fullmoveCounter = fenString.split(' ')[5] ? parseInt(fenString.split(' ')[5]) : 1;


    // dont forget:    y x
    const board: number[][] = [[],[],[],[],[],[],[],[]];
    boardState.split('/').forEach((row, y) => {
        row.split('').forEach((char) => {
            if (parseInt(char)) {
                for (let i = 0; i < parseInt(char); i++) {
                    board[y].push(0);
                }
            } else {
                board[y].push(dict[char]);
            }
        })
    });
    return {
        board,
        selfColour,
        castleState,
        enpassantTarget,
        halfmoveClock,
        fullmoveCounter
    }
}

const stateToFenDefinitions = ['EMPTY', 'p', 'n', 'b', 'r', 'q', 'k',
                                undefined, undefined,
                               'P', 'N', 'B', 'R', 'Q', 'K'];


const encodeEnpassantStringCoord = (coord: Coord): string => {
    return String.fromCharCode(coord.x + 97) + ((7 - coord.y) + 1).toString();
}

export const encodeStateToFen = (state: State): string => {
    let fenString = '';
    state.board.forEach(row => {
        let emptyCounter = 0;
        fenString += '/';
        row.forEach((col, i) => {
            if (stateToFenDefinitions[col] === 'EMPTY') {
                emptyCounter++;
            } else {
                fenString += emptyCounter ? emptyCounter.toString() : '';
                fenString += stateToFenDefinitions[col];
                emptyCounter = 0;
            }
            if (i === 7 && emptyCounter) {
                fenString+= emptyCounter.toString()
            }
        });
    });
    fenString += ' ';
    fenString += state.selfColour === 8 ? 'w ' : 'b ';
    if (state.castleState.blackCastleKingside
        || state.castleState.blackCastleQueenside
        || state.castleState.whiteCastleKingside
        || state.castleState.whiteCastleQueenside) {
        fenString += state.castleState.whiteCastleKingside ? 'K' : '';
        fenString += state.castleState.whiteCastleQueenside ? 'Q' : '';
        fenString += state.castleState.blackCastleKingside ? 'k' : '';
        fenString += state.castleState.blackCastleQueenside ? 'q' : '';
    } else {
        fenString += '-';
    }
    fenString += ' ';
    fenString += state.enpassantTarget ? encodeEnpassantStringCoord(state.enpassantTarget)+' ' : '- ';
    fenString += state.halfmoveClock + ' ';
    fenString += state.fullmoveCounter;
    return fenString.substring(1);
}