document.addEventListener("DOMContentLoaded", function() {
    // Declare Variables
    let validation;
    let gameOver;
    let sectionBoardInnerHtml = "";
    let lastBackgroundRow = "darkBackground";
    let selectedPiece = null;
    let moves = 0;
    const pawnStartingPosition = ["a", "b", "c", "d", "e", "f", "g", "h"];

    function resetValidation() {
        validation = [];
        for(let i = 0; i < 64; i++) {
            if(i % 8 === 0) {
                validation.push([i + 1]);
            } else {
                validation[validation.length - 1].push(i + 1);
            }
        }
        gameOver = false;
    }
    resetValidation();

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
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/whitePawn.svg" alt="Pawn" data-piece="pawn" data-color="white" data-startingPosition="${pawnStartingPosition[i - 9]}2">`;
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
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/blackPawn.svg" alt="Pawn" data-piece="pawn" data-color="black" data-startingposition="${pawnStartingPosition[i - 49]}7">`;
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
            if(event.target.dataset.color !== player) {
                return;
            }

            selectedPiece = event.target;
            selectedPiece.classList.add("selected");

            event.stopPropagation();

            document.querySelectorAll("[data-square]").forEach(square => {
                square.addEventListener("click", function squareClick() {
                    let isMoveCorrect = false;
                    try {
                        switch(selectedPiece.dataset.piece) {
                            case "pawn":
                                isMoveCorrect = pawnMoveChecker(selectedPiece, square, player);
                                break;
                            case "rook":
                                isMoveCorrect = rookMoveChecker(selectedPiece, square, player);
                                break;
                            case "knight":
                                isMoveCorrect = knightMoveChecker(selectedPiece, square, player);
                                break;
                            case "bishop":
                                isMoveCorrect = bishopMoveChecker(selectedPiece, square, player);
                                break;
                            case "queen":
                                isMoveCorrect = queenMoveChecker(selectedPiece, square, player);
                                break;
                            case "king":
                                isMoveCorrect = kingMoveChecker(selectedPiece, square, player);
                                break;
                        }

                        if(isMoveCorrect) {
                            square.appendChild(selectedPiece);
                            selectedPiece.classList.remove("selected");
                            selectedPiece = null;
                            moves++;

                            document.querySelectorAll("[data-square]").forEach(square => {
                                square.removeEventListener("click", squareClick);
                            });
                        }
                    } catch(error) {
                        return;
                    }
                });
            });
        });
    });

    function pawnMoveChecker(selectedPiece, movedSquare, player) {
        let playerPawn = player === "white" ? 1 : -1;
        const diagonalCheck = player === "white" ? 1 : -1;
        const previousSquare = selectedPiece.closest(".block");
        const previousSquareRow = parseInt(previousSquare.dataset.row);
        const previousSquareColumn = parseInt(previousSquare.dataset.column);
        const movedSquareRow = parseInt(movedSquare.dataset.row);
        const movedSquareColumn = parseInt(movedSquare.dataset.column);
        const checkLeftDiagonal = document.querySelector(`[data-row="${previousSquareRow + playerPawn}"][data-column="${previousSquareColumn + 1}"]`);
        const checkRightDiagonal = document.querySelector(`[data-row="${previousSquareRow + playerPawn}"][data-column="${previousSquareColumn - 1}"]`);

        if ((player === "white" && previousSquareRow === 2) || (player === "black" && previousSquareRow === 7)) {
            playerPawn = player === "white" ? 2 : -2;
            if (selectedPiece.dataset.color === "white" && 
                movedSquareRow <= previousSquareRow + playerPawn && 
                previousSquareColumn === movedSquareColumn) {
                return columnChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
            } else if(selectedPiece.dataset.color === "black" && 
                movedSquareRow >= previousSquareRow + playerPawn && 
                previousSquareColumn === movedSquareColumn) {
                    return columnChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
                }
        } else {
            if (selectedPiece.dataset.color === player && 
                movedSquareRow === previousSquareRow + playerPawn && 
                previousSquareColumn === movedSquareColumn) {
                    return columnChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player);
            }
        }

        if (selectedPiece.dataset.color === player) {
            if (movedSquare === checkLeftDiagonal && checkLeftDiagonal && checkLeftDiagonal.children.length > 0 && checkLeftDiagonal.querySelector("img").dataset.color !== player) {
                capturePiece(checkLeftDiagonal);
                return true;
            }
        
            if (movedSquare === checkRightDiagonal && checkRightDiagonal && checkRightDiagonal.children.length > 0 && checkRightDiagonal.dataset.color !== player) {
                capturePiece(checkRightDiagonal);
                return true;
            }
        }
        return false;
    }

    function rookMoveChecker(selectedPiece, movedSquare, player) {
        return true;
    }

    function knightMoveChecker(selectedPiece, movedSquare, player) {
        return true;
    }

    function bishopMoveChecker(selectedPiece, movedSquare, player) {
        return true;
    }

    function queenMoveChecker(selectedPiece, movedSquare, player) {
        return true;
    }

    function kingMoveChecker(selectedPiece, movedSquare, player) {
        return true;
    }

    function columnChecker(previousSquareRow, movedSquareRow, previousSquareColumn, player) {
        let step = player === "white" ? 1 : -1;

        for (let i = previousSquareRow + step; player === "white" ? i <= movedSquareRow : i >= movedSquareRow; i += step) {
            const targetSquare = document.querySelector(`[data-row="${i}"][data-column="${previousSquareColumn}"]`);
            console.log(targetSquare)
            if(targetSquare && targetSquare.children.length > 0) {
                return false;
            }
        }
        return true;
    }

    function capturePiece(takenPiece) {
        checkExposeKing();
        const parentElement = takenPiece.closest(".block");
        const takenPieceImg = takenPiece.querySelector("img");

        parentElement.removeChild(takenPieceImg);
    }

    function checkExposeKing() {
        return true;
    }
})
