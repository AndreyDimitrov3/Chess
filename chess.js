document.addEventListener("DOMContentLoaded", function() {
    // Declare Variables
    let sectionBoardInnerHtml = "";
    let selectedPiece = null;
    let moves = 0;
    let isCapture = false;
    let previousMoveWasCheck = false;
    let checkingPiece = null;    

    for(let i = 64; i >= 1; i--) {
        let backgroundClass;
        const row = Math.floor((i - 1) / 8);
        const col = (i - 1) % 8;

        backgroundClass = (row + col) % 2 === 0 ? "lightBackgound" : "darkBackground";
        sectionBoardInnerHtml += `<div class="block ${backgroundClass}" data-column="${(col) + 1}" data-row="${(row) + 1}" data-square="${i}"></div>`;
    }
    document.getElementById("sectionBoard").innerHTML = sectionBoardInnerHtml;

    function resetWhitePieces() {
        const whiteRook = document.querySelectorAll(`[data-square="1"], [data-square="8"]`);
        const whiteKnight = document.querySelectorAll(`[data-square="2"], [data-square="7"]`);
        const whiteBishop = document.querySelectorAll(`[data-square="3"], [data-square="6"]`);
        const whiteKing = document.querySelector(`[data-square="4"]`);
        const whiteQueen = document.querySelector(`[data-square="5"]`);

        for(let i = 9; i <= 16; i++) {
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/whitePawn.svg" alt="Pawn" data-piece="pawn" data-color="white">`;
        }

        whiteRook.forEach(rook => {
            rook.innerHTML = `
                <img src="assets/whiteRook.svg" alt="Rook" data-piece="rook" data-color="white">
            `;
        });

        whiteKnight.forEach(knight => {
            knight.innerHTML = `
                <img src="assets/whiteKnight.svg" alt="Knight" data-piece="knight" data-color="white">
            `;
        });

        whiteBishop.forEach(bishop => {
            bishop.innerHTML = `
                <img src="assets/whiteBishop.svg" alt="Bishop" data-piece="bishop" data-color="white">
            `;
        });

        whiteKing.innerHTML = `<img src="assets/whiteKing.svg" alt="King" data-piece="king" data-color="white">`;
        whiteQueen.innerHTML = `<img src="assets/whiteQueen.svg" alt="Queen" data-piece="queen" data-color="white">`;
    }

    function resetBlackPieces() {
        const blackRook = document.querySelectorAll(`[data-square="64"], [data-square="57"]`);
        const blackKnight = document.querySelectorAll(`[data-square="63"], [data-square="58"]`);
        const blackBishop = document.querySelectorAll(`[data-square="62"], [data-square="59"]`);
        const blackQueen = document.querySelector(`[data-square="61"]`);
        const blackKing = document.querySelector(`[data-square="60"]`);

        for(let i = 49; i <= 56; i++) {
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/blackPawn.svg" alt="Pawn" data-piece="pawn" data-color="black"">`;
        }

        blackRook.forEach(rook => {
            rook.innerHTML = `
                <img src="assets/blackRook.svg" alt="Rook" data-piece="rook" data-color="black">
            `;
        });

        blackKnight.forEach(knight => {
            knight.innerHTML = `
                <img src="assets/blackKnight.svg" alt="Knight" data-piece="knight" data-color="black">
            `;
        });

        blackBishop.forEach(bishop => {
            bishop.innerHTML = `
                <img src="assets/blackBishop.svg" alt="Bishop" data-piece="bishop" data-color="black">
            `;
        });

        blackQueen.innerHTML = `<img src="assets/blackQueen.svg" alt="Queen" data-piece="queen" data-color="black">`;
        blackKing.innerHTML = `<img src="assets/blackKing.svg" alt="King" data-piece="king" data-color="black">`;
    }
    resetWhitePieces();
    resetBlackPieces();

    document.querySelectorAll(`[data-piece]`).forEach(element => {
        element.addEventListener("click", function pieceClick(event) {
            if (selectedPiece !== null) {
                selectedPiece.classList.remove("selected");
            }

            let player = moves % 2 === 0 ? "white" : "black";

            if (event.target.dataset.color !== player) {
                return;
            }

            selectedPiece = event.target;
            selectedPiece.classList.add("selected");
            event.stopPropagation();

            document.querySelectorAll("[data-square]").forEach(square => {
                square.removeEventListener("click", squareClick);
            });

            document.querySelectorAll("[data-square]").forEach(square => {
                square.addEventListener("click", squareClick);
            });
        });
    });

    function squareClick(event) {
        const square = event.currentTarget;
        let isMoveCorrect = false;
        let player = moves % 2 === 0 ? "white" : "black";

        try {
            isCapture = false;

            if (previousMoveWasCheck) {
                if (!isKingMove(selectedPiece, square) && !canCaptureAttackingPiece(square)) {
                    return;
                }
            }

            switch (selectedPiece.dataset.piece) {
                case "pawn":
                    isMoveCorrect = pawnMoveChecker(selectedPiece, square, player);
                    break;
                case "rook":
                    isMoveCorrect = rookMoveChecker(selectedPiece, square);
                    break;
                case "knight":
                    isMoveCorrect = knightMoveChecker(selectedPiece, square);
                    break;
                case "bishop":
                    isMoveCorrect = bishopMoveChecker(selectedPiece, square);
                    break;
                case "queen":
                    isMoveCorrect = queenMoveChecker(selectedPiece, square);
                    break;
                case "king":
                    isMoveCorrect = kingMoveChecker(selectedPiece, square);
                    break;
            }

            if (isMoveCorrect) {
                square.appendChild(selectedPiece);
                selectedPiece.classList.remove("selected");
                selectedPiece = null;
                moves++;

                previousMoveWasCheck = isKingInCheck(player);

                if (previousMoveWasCheck) {
                    new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3").play();
                } else if (isCapture) {
                    new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3').play();
                } else {
                    new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3").play();
                }
            }
        } catch (error) {
            console.error("Error in squareClick: ", error);
        }
    }

    function pawnMoveChecker(selectedPiece, movedSquare, player) {
        let playerPawn = player === "white" ? 1 : -1;
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);
    
        if ((player === "white" && previousSquareRow === 2) || (player === "black" && previousSquareRow === 7)) {
            playerPawn = player === "white" ? 2 : -2;
            if (selectedPiece.dataset.color === "white" &&
                movedSquareRow <= previousSquareRow + playerPawn &&
                previousSquareColumn === movedSquareColumn) {
                return pawnRowChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
            } else if (selectedPiece.dataset.color === "black" &&
                movedSquareRow >= previousSquareRow + playerPawn &&
                previousSquareColumn === movedSquareColumn) {
                return pawnRowChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
            }
        } else {
            if (movedSquareRow === previousSquareRow + playerPawn && previousSquareColumn === movedSquareColumn) {
                return pawnRowChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
            }
        }
    
        return pawnDiagonalCapture(selectedPiece, movedSquare, previousSquare, player);
    }

    function pawnDiagonalCapture(selectedPiece, movedSquare, previousSquare, player) {
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
    
        const playerPawn = player === "white" ? 1 : -1;
        const checkLeftDiagonal = document.querySelector(`[data-row="${previousSquareRow + playerPawn}"][data-column="${previousSquareColumn - 1}"]`);
        const checkRightDiagonal = document.querySelector(`[data-row="${previousSquareRow + playerPawn}"][data-column="${previousSquareColumn + 1}"]`);
    
        if ((movedSquare === checkLeftDiagonal || movedSquare === checkRightDiagonal) && movedSquare.children.length > 0) {
            const targetPiece = movedSquare.querySelector("img");
            if (targetPiece && targetPiece.dataset.color !== player) {
                capturePiece(movedSquare);
                return true;
            }
        }
    
        return false;
    }

    function rookMoveChecker(selectedPiece, movedSquare) {
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);

        if(lineMoveChecker(previousSquareRow, previousSquareColumn, movedSquareRow, movedSquareColumn)) return true;
        return false;
    }

    function knightMoveChecker(selectedPiece, movedSquare) {
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);

        const rowDifference = Math.abs(movedSquareRow - previousSquareRow);
        const columnDifference = Math.abs(movedSquareColumn - previousSquareColumn);

        if((rowDifference === 2 && columnDifference === 1) || (rowDifference === 1 && columnDifference === 2)) {
            if(movedSquare.querySelector("img")) {
                isCapture = true;
                capturePiece(movedSquare);
            }
            return true;
        }

        return false;
    }

    function bishopMoveChecker(selectedPiece, movedSquare) {
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);

        let directionHorizontal = previousSquareColumn < movedSquareColumn ? 1 : -1;
        let directionVertical = previousSquareRow < movedSquareRow ? 1 : -1;

        return diagonalChecker(previousSquareRow, previousSquareColumn, directionHorizontal, directionVertical, movedSquareRow, movedSquareColumn);
    }

    function queenMoveChecker(selectedPiece, movedSquare) {
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);

        if(lineMoveChecker(previousSquareRow, previousSquareColumn, movedSquareRow, movedSquareColumn)) return true;

        let directionHorizontal = previousSquareColumn < movedSquareColumn ? 1 : -1;
        let directionVertical = previousSquareRow < movedSquareRow ? 1 : -1;
        return diagonalChecker(previousSquareRow, previousSquareColumn, directionHorizontal, directionVertical, movedSquareRow, movedSquareColumn);
    }

    function kingMoveChecker(selectedPiece, movedSquare) {
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);

        const rowDifference = Math.abs(movedSquareRow - previousSquareRow);
        const columnDifference = Math.abs(movedSquareColumn - previousSquareColumn);

        if(rowDifference <= 1 && columnDifference <= 1) {
            if(movedSquare.querySelector("img")) {
                isCapture = true;
                capturePiece(movedSquare);
            }
            return true;
        }

        return false;
    }

    function pawnRowChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player) {
        const step = player === "white" ? 1 : -1;

        for(let i = previousSquareRow + step; player === "white" ? i <= movedSquareRow : i >= movedSquareRow; i += step) {
            const targetSquare = document.querySelector(`[data-row="${i}"][data-column="${previousSquareColumn}"]`);
            if(targetSquare && targetSquare.children.length > 0) {
                return false;
            }
        }
        return true;
    }

    function lineMoveChecker(previousRow, previousColumn, movedRow, movedColumn) {
        if(previousRow === movedRow) {
            let direction = previousColumn < movedColumn ? 1 : -1;
            return columnChecker(previousColumn, movedColumn, previousRow, direction);
        } else if(previousColumn === movedColumn) {
            let direction = previousRow < movedRow ? 1 : -1;
            return rowChecker(previousRow, movedRow, previousColumn, direction);
        }
        return false;
    }

    function rowChecker(previousSquareRow, movedSquareRow, previousSquareColumn, direction) {
        for(let i = previousSquareRow + direction; direction > 0 ? i <= movedSquareRow : i >= movedSquareRow; i += direction) {
            const targetSquare = document.querySelector(`[data-row="${i}"][data-column="${previousSquareColumn}"]`);
            if(i !== movedSquareRow) {
                if(targetSquare && targetSquare.children.length > 0) {
                    return false;
                }
            } else {
                if(targetSquare && targetSquare.querySelector("img")) {
                    isCapture = true;
                    capturePiece(targetSquare)
                    return true;
                }
            }
        }

        return true;
    }

    function columnChecker(previousSquareColumn, movedSquareColumn, previousSquareRow, direction) {
        for(let i = previousSquareColumn + direction; direction > 0 ? i <= movedSquareColumn : i >= movedSquareColumn; i += direction) {
            const targetSquare = document.querySelector(`[data-row="${previousSquareRow}"][data-column="${i}"]`);
            if(i !== movedSquareColumn) {
                if(targetSquare && targetSquare.children.length > 0) {
                    return false;
                }
            } else {
                if(targetSquare && targetSquare.querySelector("img")) {
                    isCapture = true;
                    capturePiece(targetSquare);
                    return true;
                }
            }
        }

        return true;
    }

    function diagonalChecker(previousSquareRow, previousSquareColumn, directionHorizontal, directionVertical, movedSquareRow, movedSquareColumn) {
        if(Math.abs(previousSquareRow - movedSquareRow) !== Math.abs(previousSquareColumn - movedSquareColumn)) return false;

        for(let i = previousSquareRow + directionVertical, j = previousSquareColumn + directionHorizontal; 
             (directionVertical > 0 ? i <= movedSquareRow : i >= movedSquareRow) && (directionHorizontal > 0 ? j <= movedSquareColumn : j >= movedSquareColumn);
             i += directionVertical, j += directionHorizontal) {
            const targetSquare = document.querySelector(`[data-row="${i}"][data-column="${j}"]`);    
            if(i !== movedSquareRow) {
                if(targetSquare && targetSquare.children.length > 0) {
                    return false;
                }
            } else {
                if(targetSquare && targetSquare.querySelector("img")) {
                    isCapture = true;
                    capturePiece(targetSquare);
                    return true;
                }
            }
        }

        return true;
    }

    function isKingInCheck(player) {
        const oppositePlayer = player === "white" ? "black" : "white";
        const king = document.querySelector(`[data-piece="king"][data-color="${oppositePlayer}"]`);
        let isInCheck = false;

        for (const opponentPiece of document.querySelectorAll(`[data-color="${player}"]`)) {
            const pieceType = opponentPiece.dataset.piece;
            const piecePosition = opponentPiece.closest(".block");

            if (isPieceCheckingKing(pieceType, opponentPiece, piecePosition, king)) {
                isInCheck = true;
                break;
            }
        }

        return isInCheck;
    }

    function isPieceCheckingKing(pieceType, opponentPiece, piecePosition, king) {
        switch (pieceType) {
            case "pawn":
                return pawnCanAttack(opponentPiece, piecePosition, king);
            case "rook":
                return rookCanAttack(opponentPiece, piecePosition, king);
            case "knight":
                return knightCanAttack(opponentPiece, piecePosition, king);
            case "bishop":
                return bishopCanAttack(opponentPiece, piecePosition, king);
            case "queen":
                return queenCanAttack(opponentPiece, piecePosition, king);
            case "king":
                return kingCanAttack(opponentPiece, piecePosition, king);
        }
    }

    function pawnCanAttack(opponentPiece, piecePosition, king) {
        const opponentPawnRow = parseInt(piecePosition.dataset.row);
        const opponentPawnCol = parseInt(piecePosition.dataset.column);
        const kingRow = parseInt(king.closest(".block").dataset.row);
        const kingCol = parseInt(king.closest(".block").dataset.column);

        const attackDirection = opponentPiece.dataset.color === "black" ? -1 : 1;

        if((opponentPawnRow + attackDirection === kingRow) &&
            Math.abs(opponentPawnCol - kingCol) === 1 &&
            opponentPiece.dataset.color !== king.dataset.color) {
            checkingPiece = piecePosition.querySelector("img")
            return true;
        }

        return false;
    }


    function rookCanAttack(opponentPiece, piecePosition, king) {
        const opponentRookRow = parseInt(piecePosition.dataset.row);
        const opponentRookCol = parseInt(piecePosition.dataset.column);
        const kingRow = parseInt(king.closest(".block").dataset.row);
        const kingCol = parseInt(king.closest(".block").dataset.column);

        if(opponentPiece.dataset.color !== king.dataset.color && 
            (opponentRookRow === kingRow || opponentRookCol === kingCol)) {

            if(opponentRookRow === kingRow) {
                return !isPathBlocked(opponentRookRow, opponentRookCol, kingRow, kingCol, "horizontal", piecePosition.querySelector("img"));
            }
            if(opponentRookCol === kingCol) {
                return !isPathBlocked(opponentRookRow, opponentRookCol, kingRow, kingCol, "vertical");
            }
        }
        return false;
    }

    function isPathBlocked(startRow, startCol, endRow, endCol, direction, piecePosition) {
        const stepRow = direction === "horizontal" ? 0 : startRow < endRow ? 1 : -1;
        const stepCol = direction === "vertical" ? 0 : startCol < endCol ? 1 : -1;
        let row = startRow + stepRow;
        let col = startCol + stepCol;

        while (row !== endRow || col !== endCol) {
            const targetSquare = document.querySelector(`[data-row="${row}"][data-column="${col}"]`);
            if(targetSquare && targetSquare.children.length > 0) {
                checkingPiece = piecePosition;
                return true;
            }
            row += stepRow;
            col += stepCol;
        }
        return false;
    }

    function knightCanAttack(opponentPiece, piecePosition, king) {
        const opponentKnightRow = parseInt(piecePosition.dataset.row);
        const opponentKnightCol = parseInt(piecePosition.dataset.column);
        const kingRow = parseInt(king.closest(".block").dataset.row);
        const kingCol = parseInt(king.closest(".block").dataset.column);
        const rowDiff = Math.abs(opponentKnightRow - kingRow);
        const colDiff = Math.abs(opponentKnightCol - kingCol);

        if(opponentPiece.dataset.color !== king.dataset.color && ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            checkingPiece = piecePosition.querySelector("img");
            return true;
        }

        return false;
    }

    function bishopCanAttack(opponentPiece, piecePosition, king) {
        const opponentBishopRow = parseInt(piecePosition.dataset.row);
        const opponentBishopCol = parseInt(piecePosition.dataset.column);
        const kingRow = parseInt(king.closest(".block").dataset.row);
        const kingCol = parseInt(king.closest(".block").dataset.column);
    
        if (kingRow === opponentBishopRow && kingCol === opponentBishopCol) {
            return false;
        }
    
        if (opponentPiece.dataset.color !== king.dataset.color && 
            Math.abs(opponentBishopRow - kingRow) === Math.abs(opponentBishopCol - kingCol)) {         
            
            const pathBlocked = isDiagonalPathBlocked(opponentBishopRow, opponentBishopCol, kingRow, kingCol, piecePosition);
            checkingPiece = piecePosition.querySelector("img");
            
            return !pathBlocked;
        }
    
        return false;
    }
    
    function isDiagonalPathBlocked(startRow, startCol, endRow, endCol, piecePosition) {
        const directionVertical = startRow < endRow ? 1 : -1;
        const directionHorizontal = startCol < endCol ? 1 : -1;
    
        let row = startRow + directionVertical;
        let col = startCol + directionHorizontal;
    
        while (row !== endRow && col !== endCol) {
            const targetSquare = document.querySelector(`[data-row="${row}"][data-column="${col}"]`);
            if (targetSquare && targetSquare.children.length > 0) {
                checkingPiece = piecePosition;
                return true;
            }
            row += directionVertical;
            col += directionHorizontal;
        }
    
        return false;
    }
    

    function queenCanAttack(opponentPiece, piecePosition, king) {
        if(rookCanAttack(opponentPiece, piecePosition, king) || bishopCanAttack(opponentPiece, piecePosition, king)) {
            checkingPiece = piecePosition.querySelector("img");
            return true;
        }
        return false;
    }

    function kingCanAttack(opponentPiece, piecePosition, king) {
        const opponentKingRow = parseInt(piecePosition.dataset.row);
        const opponentKingCol = parseInt(piecePosition.dataset.column);
        const kingRow = parseInt(king.closest(".block").dataset.row);
        const kingCol = parseInt(king.closest(".block").dataset.column);

        if(opponentPiece.dataset.color !== king.dataset.color && Math.abs(opponentKingRow - kingRow) <= 1 && Math.abs(opponentKingCol - kingCol) <= 1) {
            checkingPiece = piecePosition.querySelector("img");
            return true;
        }
        return false;
    }

    function capturePiece(takenSquare) {
        const takenPiece = takenSquare.querySelector("img");
        if (takenPiece) {
            checkExposeKing();
            takenSquare.removeChild(takenPiece);
        }
    }

    function checkExposeKing() {
        return true;
    }

    function isKingMove(selectedPiece, movedSquare) {
        if (selectedPiece.dataset.piece === "king") {
            const isKingInNewPositionSafe = !isSquareAttacked(movedSquare, selectedPiece.dataset.color);
            return isKingInNewPositionSafe;
        }
        return false;
    }

    function canCaptureAttackingPiece(movedSquare) {
        if (!checkingPiece || !movedSquare.contains(checkingPiece)) {
            return false;
        }
    
        const attackingPieceType = selectedPiece.dataset.piece;
        let isCaptureMoveCorrect = false;
        let pawn = false;
    
        switch (attackingPieceType) {
            case "pawn":
                isCaptureMoveCorrect = pawnMoveChecker(selectedPiece, movedSquare, selectedPiece.dataset.color);
                pawn = true;
                break;
            case "rook":
                isCaptureMoveCorrect = rookMoveChecker(selectedPiece, movedSquare);
                break;
            case "knight":
                isCaptureMoveCorrect = knightMoveChecker(selectedPiece, movedSquare);
                break;
            case "bishop":
                isCaptureMoveCorrect = bishopMoveChecker(selectedPiece, movedSquare);
                break;
            case "queen":
                isCaptureMoveCorrect = queenMoveChecker(selectedPiece, movedSquare);
                break;
            case "king":
                isCaptureMoveCorrect = kingMoveChecker(selectedPiece, movedSquare);
                break;
        }
    
        if (isCaptureMoveCorrect) {    
            if (pawn === true) {
                const previousSquare = selectedPiece.closest(".block");
                const player = selectedPiece.dataset.color;
    
                if (pawnDiagonalCapture(selectedPiece, movedSquare, previousSquare, player)) {
                    checkingPiece = null;
                    return true;
                }
    
                movePawnToSquare(selectedPiece, movedSquare);
                isCapture = true;
                checkingPiece = null;
                previousMoveWasCheck = false;
                moves++;
                selectedPiece = null;
                new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3').play();
                return true;
            } else {
                isCapture = true;
                capturePiece(checkingPiece);
                checkingPiece = null;
                return true;
            }
        }
    
        return false;
    }

    function movePawnToSquare(selectedPiece, movedSquare) {
        movedSquare.appendChild(selectedPiece);
    }
    
    function isSquareAttacked(square, playerColor) {
        const opponentColor = playerColor === "white" ? "black" : "white";

        for (const opponentPiece of document.querySelectorAll(`[data-color="${opponentColor}"]`)) {
            const pieceType = opponentPiece.dataset.piece;
            const piecePosition = opponentPiece.closest(".block");

            if (isPieceCheckingKing(pieceType, opponentPiece, piecePosition, square)) {
                return true;
            }
        }
        return false;
    }
})
