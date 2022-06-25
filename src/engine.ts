import { Coord, State } from "./fenEncoding";


export const emptySpace = (coord: Coord, state: State): boolean => {
    return coord.y >= 0
        && coord.y < 8
        && coord.x >= 0
        && coord.x < 8
        && state.board[coord.y][coord.x] === 0;
}

export const checkTargetCoordForHostilePiece = (coord: Coord, state: State, colour: number): boolean => {
    //enpassant target needs to be valid for capture so will be y = 6 if black and y = 1 if white

    return colour === 8 ? [1, 2, 3, 4, 5, 6].includes(state.board[coord.y][coord.x]) || (state.enpassantTarget && state.enpassantTarget.y === 6 && coord.x === state.enpassantTarget.x && coord.y === state.enpassantTarget.y):
        [9, 10, 11, 12, 13, 14].includes(state.board[coord.y][coord.x]) || (state.enpassantTarget && state.enpassantTarget.y === 1 && coord.x === state.enpassantTarget.x && coord.y === state.enpassantTarget.y);
}

//find path of coords between 2 coords
export const generateStraightPath = (coordFrom: Coord, coordTo: Coord): Coord[] => {

    const path = [];

    if (coordFrom.y !== coordTo.y) {
        if (coordFrom.y < coordTo.y) {
            for (let i = coordFrom.y+1; i <= coordTo.y; i++){
                path.push({ x: coordFrom.x, y: i });
            }
        } else {
            for (let i = coordFrom.y-1; i >= coordTo.y; i--){
                path.push({ x: coordFrom.x, y: i });
            }
        }
    } else {
        if (coordFrom.x < coordTo.x) {
            for (let i = coordFrom.x+1; i <= coordTo.x; i++){
                path.push({ y: coordFrom.y, x: i });
            }
        } else {
            for (let i = coordTo.x-1; i >= coordFrom.x-1; i--){
                path.push({ y: coordFrom.y, x: i });
            }
        }
    }
    return path;
}

export const calculateValidPawnMoves = (coord: Coord, state: State, colour: number): Coord[] => {
    const validMoves = [];
    //white
    if (colour === 8) {
        //double jump valid
        if (coord.y === 6) {
            const posCoord = { x: coord.x, y: coord.y - 2 };
            generateStraightPath(coord, posCoord).every(coord => {
                return emptySpace(coord, state);
            }) ? validMoves.push(posCoord) : null;
        }
        const posCoord = { x: coord.x, y: coord.y - 1 };
        generateStraightPath(coord, posCoord).every(coord => {
            return emptySpace(coord, state);
        }) ? validMoves.push(posCoord) : null;

        coord.x + 1 < 8 && coord.y - 1 > 0 && checkTargetCoordForHostilePiece({ x: coord.x + 1, y: coord.y - 1 }, state, colour) ? validMoves.push({ x: coord.x + 1, y: coord.y - 1 }) : null;
        coord.x - 1 > 0 && coord.y - 1 > 0 && checkTargetCoordForHostilePiece({ x: coord.x - 1, y: coord.y - 1 }, state, colour) ? validMoves.push({ x: coord.x - 1, y: coord.y - 1 }) : null;
    } //black
    else {
        //double jump valid
        if (coord.y === 1) {
            const posCoord = { x: coord.x, y: coord.y + 2 };
            generateStraightPath(coord, posCoord).every(coord => {
                emptySpace(coord, state);
            }) ? validMoves.push(posCoord) : null;
        }
        const posCoord = { x: coord.x, y: coord.y + 1 };
        generateStraightPath(coord, posCoord).every(coord => {
            emptySpace(coord, state)
        }) ? validMoves.push(posCoord) : null;

        coord.x + 1 < 8 && coord.y + 1 < 8 && checkTargetCoordForHostilePiece({ x: coord.x + 1, y: coord.y + 1 }, state, colour) ? validMoves.push({ x: coord.x + 1, y: coord.y + 1 }) : null;
        coord.x - 1 > 0 && coord.y + 1 < 8 && checkTargetCoordForHostilePiece({ x: coord.x - 1, y: coord.y + 1 }, state, colour) ? validMoves.push({ x: coord.x - 1, y: coord.y + 1 }) : null;
    }
    return validMoves;
}

export const calculateValidRookMoves = (coord: Coord, state: State, colour: number): Coord[] =>{
    // x pattern required - search along path from coord in each of 4 directions
    const validMoves = [];
    //y up
    for (let i = coord.y+1; i < 8; i++){
        const move = { x: coord.x, y: i };
        if(generateStraightPath(coord, move).every(coord => {
            return emptySpace(coord, state);
        })
        ) {
            validMoves.push(move) 
        } else {
            checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push(move) : null
            break; 
        }
    }

    //y down
    for (let i = coord.y-1; i >= 0; i--){
        const move = { x: coord.x, y: i };
        if(generateStraightPath(coord, move).every(coord => {
            return emptySpace(coord, state);
        })
        ) {
            validMoves.push(move) 
        } else {
            checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push(move) : null
            break;  
        }
    }

    //x up
    for (let i = coord.x+1; i < 8; i++){
        const move = { x: i, y: coord.y };
        if(generateStraightPath(coord, move).every(coord => {
            return emptySpace(coord, state);
        })
        ) {
            validMoves.push(move)
        } else {
            checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push(move) : null
            break;   
        }
    }

    //x down
    for (let i = coord.x-1; i >= 0; i--){
        const move = { x: i, y: coord.y };
        if (generateStraightPath(coord, move).every(coord => {
            return emptySpace(coord, state);
            })
        ) {
            validMoves.push(move);
        } else {
            checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push(move) : null
            break;
        }
    }
    //TODO: ensure that castleing is possible - does this need a separate function?

    return validMoves;
}


export const generateDiagonalPath = (fromCoord: Coord, toCoord: Coord) => {
    const path = [];
    //up-right
    if (fromCoord.x < toCoord.x && fromCoord.y < toCoord.y) {
        const pathCoord = { ...fromCoord };
        
        while (pathCoord.x < toCoord.x && pathCoord.y < toCoord.y) {
            pathCoord.x++;
            pathCoord.y++;
            path.push({ ...pathCoord });
        }
    };
    //down-right
    if (fromCoord.x < toCoord.x && fromCoord.y > toCoord.y) {
        const pathCoord = { ...fromCoord };
        
        while (pathCoord.x < toCoord.x && pathCoord.y > toCoord.y) {
            pathCoord.x++;
            pathCoord.y--;
            path.push({ ...pathCoord });
        }
    }

    //up-left
    if (fromCoord.x > toCoord.x && fromCoord.y < toCoord.y) {
        const pathCoord = { ...fromCoord };
        while (pathCoord.x > toCoord.x && pathCoord.y < toCoord.y) {
            pathCoord.x--;
            pathCoord.y++;
            path.push({ ...pathCoord });
        }
    }

    //down-left
    if (fromCoord.x > toCoord.x && fromCoord.y > toCoord.y) {
        const pathCoord = { ...fromCoord };
        while (pathCoord.x > toCoord.x && pathCoord.y > toCoord.y) {
            pathCoord.x--;
            pathCoord.y--;
            path.push({ ...pathCoord });
        }
    }
    return path;
}

export const calculateValidBishopMoves = (coord: Coord, state: State, colour: number) => {
    //x pattern requires reaching out diagonally in all directions
    const validMoves = [];
    //up-right
    let move = { ...coord };
    while (emptySpace(move, state)) {
        move.x++;
        move.y++;
        if (generateDiagonalPath(coord, move).every(coord => {
            return emptySpace(coord, state);
        })
        ) {
            validMoves.push({ ...move });
        } else {
            move.y >= 0
            && move.y < 8
            && move.x >= 0
            && move.x < 8
            && checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push({ ...move }) : null
            break;
        }
    };
    //up-left
    move = { ...coord };
    while (emptySpace(move, state)) {
        move.x--;
        move.y++;
        if (generateDiagonalPath(coord, move).every(coord => {
            return emptySpace(coord, state);
        })
        ) {
            validMoves.push({ ...move });
        } else {
            move.y >= 0
            && move.y < 8
            && move.x >= 0
            && move.x < 8
            && checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push({ ...move }) : null
            break;
        }
    }
    //down-right
    move = { ...coord };
    while (emptySpace(move, state)) {
        move.x++;
        move.y--;
        if (generateDiagonalPath(coord, move).every(coord => {
            return emptySpace(coord, state);
            })
        ) {
            validMoves.push({ ...move });
        } else {
            move.y >= 0
            && move.y < 8
            && move.x >= 0
            && move.x < 8
            && checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push({ ...move }) : null
            break;
        }
    }
    //down-left
    move = { ...coord };
    while (emptySpace(move, state)) {
        move.x--;
        move.y--;
        if (generateDiagonalPath(coord, move).every(coord => {
            return emptySpace(coord, state);
            })
        ) {
            validMoves.push({ ...move });
        } else {
            move.y >= 0
            && move.y < 8
            && move.x >= 0
            && move.x < 8
            && checkTargetCoordForHostilePiece(move, state, colour) ? validMoves.push({ ...move }) : null
            break;
        }
    }
    return validMoves;
}

export const calculateValidMoves = (piece: number, coord: Coord, state: State): Coord[] => {
    return [{x:1,y:1}]
}