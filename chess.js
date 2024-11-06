document.addEventListener("DOMContentLoaded", function() {
    // Declare Variables
    let validation;
    let gameOver;
    let sectionBoardInnerHtml = "";
    let lastBackgroundRow = "darkBackground";
    let selectedPiece = null;

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
        const filled = i <= 16 || i > 48 ? true : false;

        backgroundClass = (row + col) % 2 === 0 ? "lightBackgound" : "darkBackground";
        sectionBoardInnerHtml += `<div class="block ${backgroundClass}" data-column="${(col) + 1}" data-row="${(row) + 1}" data-square="${i}" data-filled="${filled}"></div>`;
    }
    document.getElementById("sectionBoard").innerHTML = sectionBoardInnerHtml;

    function resetWhitePieces() {
        const whiteRook = document.querySelectorAll(`[data-square="1"], [data-square="8"]`);
        const whiteKnight = document.querySelectorAll(`[data-square="2"], [data-square="7"]`);
        const whiteBishop = document.querySelectorAll(`[data-square="3"], [data-square="6"]`);
        const whiteQueen = document.querySelector(`[data-square="4"]`);
        const whiteKing = document.querySelector(`[data-square="5"]`);

        for(let i = 9; i <= 16; i++) {
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/whitePawn.svg" alt="Pawn" data-piece="pawn">`;
        }

        whiteRook.forEach(rook => {
            rook.innerHTML = `
                <img src="assets/whiteRook.svg" alt="Rook" data-piece="rook">
            `;
        });

        whiteKnight.forEach(knight => {
            knight.innerHTML = `
                <img src="assets/whiteKnight.svg" alt="Knight" data-piece="knight">
            `;
        });

        whiteBishop.forEach(bishop => {
            bishop.innerHTML = `
                <img src="assets/whiteBishop.svg" alt="Bishop" data-piece="bishop">
            `;
        });

        whiteQueen.innerHTML = `<img src="assets/whiteQueen.svg" alt="Queen" data-piece="queen">`;
        whiteKing.innerHTML = `<img src="assets/whiteKing.svg" alt="King" data-piece="king">`;
    }

    function resetBlackPieces() {
        const blackRook = document.querySelectorAll(`[data-square="64"], [data-square="57"]`);
        const blackKnight = document.querySelectorAll(`[data-square="63"], [data-square="58"]`);
        const blackBishop = document.querySelectorAll(`[data-square="62"], [data-square="59"]`);
        const blackQueen = document.querySelector(`[data-square="61"]`);
        const blackKing = document.querySelector(`[data-square="60"]`);

        for(let i = 49; i <= 56; i++) {
            document.querySelector(`[data-square="${i}"]`).innerHTML = `<img src="assets/blackPawn.svg" alt="Pawn" data-piece="pawn">`;
        }

        blackRook.forEach(rook => {
            rook.innerHTML = `
                <img src="assets/blackRook.svg" alt="Rook" data-piece="rook">
            `;
        });

        blackKnight.forEach(knight => {
            knight.innerHTML = `
                <img src="assets/blackKnight.svg" alt="Knight" data-piece="knight">
            `;
        });

        blackBishop.forEach(bishop => {
            bishop.innerHTML = `
                <img src="assets/blackBishop.svg" alt="Bishop" data-piece="bishop">
            `;
        });

        blackQueen.innerHTML = `<img src="assets/blackQueen.svg" alt="Queen" data-piece="queen">`;
        blackKing.innerHTML = `<img src="assets/blackKing.svg" alt="King" data-piece="king">`;
    }
    resetWhitePieces();
    resetBlackPieces();

    document.querySelectorAll(`[data-piece]`).forEach(element => {
        element.addEventListener("click", function pieceClick(event) {
            if (selectedPiece !== null) {
                selectedPiece.classList.remove("selected");
            }

            selectedPiece = event.target;
            selectedPiece.classList.add("selected");

            event.stopPropagation();

            document.querySelectorAll("[data-square]").forEach(square => {
                square.addEventListener("click", function squareClick() {
                    try {
                        switch(selectedPiece.dataset.piece) {
                            case "pawn":
                                pawnMoveChecker()
                                break;
                        }
                    } catch(error) {
                        return;
                    }

                    square.appendChild(selectedPiece);
                    selectedPiece.classList.remove("selected");
                    selectedPiece = null; 

                    document.querySelectorAll("[data-square]").forEach(square => {
                        square.removeEventListener("click", squareClick);
                    });
                });
            });
        });
    });

    function pawnMoveChecker() {

    }
})
