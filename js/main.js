'use strict'
const HAPPY = '😄'
const SAD = '😟'
const COOL = '😎'
const FLAG = '🚩'
const MINE = '💣'
const LIVE = '💖'
const HINT = '💡'

var gBoard;
var gBoardPositions;
var gLevel;
var gGame;
var gTimeInterval;
var gFlagCounter;
var gLivesCounter;
var gHintsCounter;
var gHintMode;

//-----Frequently used html elements-----//
const elTimer = document.querySelector('.timer')
const elResetBtn = document.querySelector('.restart-btn')
const elMinesLeft = document.querySelector('.mines-counter')
const elLives = document.querySelector('.lives')
const elHints = document.querySelector('.hints')

//-----Functions-----//

// this function sets the basic settings. it also render the board on load 
// and when restart button is clicked
function initGame() {

    setNewGame()
    createLevel()
    renderBoard()
    clearInterval(gTimeInterval)
    elResetBtn.innerText = HAPPY
    elTimer.innerText = 'Time Passed: 0'
    elMinesLeft.innerText = `Mines Left: ${gFlagCounter}`
    gLivesCounter = 3
    elLives.innerText = `LIVES: ${LIVE.repeat(gLivesCounter)}`
    gHintsCounter = 3
    gHintMode = false
    elHints.innerText = `(OFF) Hints: ${HINT.repeat(gHintsCounter)}`


    console.log(gGame);
    console.log(gLevel);

}

// this function creates new board and sets new random mines based on user left mouse click
function startGame(cell) {

    if (!gGame.isOn) {
        gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)

        setRandomMines(gLevel.MINES, cell)
        gBoardPositions = createPositions()
        for (var i = 0; i < gBoardPositions.length; i++) {
            setNeighbors(gBoardPositions[i])
        }
        setColors()
        console.log(gGame);
        console.log(gBoard);

        gGame.isOn = true
        setTimer()
    }
}

// this function implement new game structure
function setNewGame() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        timer: 0
    }
}

// this function creates new level and sets the mine counter
function createLevel() {

    gLevel = {
        SIZE: 0,
        MINES: 0
    }
    setDifficulty()
    gFlagCounter = gLevel.MINES

}

// this function build a new board structure
function buildBoard(size) {

    var tempBoard = []

    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            var tempCell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            row.push(tempCell)
        }
        tempBoard.push(row)
    }

    return tempBoard
}

// this function renders the board to the user 
function renderBoard() {

    const elBoard = document.querySelector('.board')
    var htmlStr = `<table><tbody>`

    for (var i = 0; i < gLevel.SIZE; i++) {
        var rowStr = '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cellStr = `<td onclick="cellClicked(this)" onmouseup="rightClick(event, this)"
             data-i="${i}" data-j="${j}" class="cell cell-${i}-${j}"
              oncontextmenu="event.preventDefault();"></td>`
            rowStr += cellStr
        }
        rowStr += '</tr>'
        htmlStr += rowStr
    }

    htmlStr += `</table></tbody>`
    elBoard.innerHTML = htmlStr
}

// this function set the difficulty based on radio check list
function setDifficulty() {

    const elRadio = document.getElementsByName('radio')

    if (elRadio[0].checked) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gFlagCounter = 2
    }
    if (elRadio[1].checked) {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        gFlagCounter = 12
    }
    if (elRadio[2].checked) {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        gFlagCounter = 30
    }
}

// this function gets number of mines and a specific cell coordinates
// and creates random mines array based on 1st degree cell's neighbors 
function setRandomMines(minesNumber, cell) {

    const tempCell = { i: +cell.i, j: +cell.j }
    var tempMines = []

    for (var i = tempCell.i - 1; i <= tempCell.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) { continue }
        for (var j = tempCell.j - 1; j <= tempCell.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) { continue }
            tempMines.push({ i: i, j: j })
        }
    }

    while (tempMines.length < minesNumber + 9) {

        const randomI = getRandomIntInclusive(0, gBoard.length - 1)
        const randomJ = getRandomIntInclusive(0, gBoard.length - 1)
        const newMine = {
            i: randomI,
            j: randomJ
        }

        const isFound = tempMines.some(element => {
            if (element.i === newMine.i && element.j === newMine.j) {
                return true
            }
            return false
        })
        if (!isFound) {
            tempMines.unshift(newMine)
        }
    }

    for (var i = 0; i < minesNumber; i++) {
        gBoard[tempMines[i].i][tempMines[i].j].isMine = true
    }
}

// this function creates an array of gBoard cells positions
function createPositions() {

    var cellPositions = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            cellPositions.push({
                i: i,
                j: j

            })
        }
    }
    return cellPositions
}

// this function get a cell as object and set its neighbors counter in the main gBoard
function setNeighbors(currCell) {

    const tempI = +currCell.i
    const tempJ = +currCell.j

    var mineCount = 0

    for (var i = tempI - 1; i <= tempI + 1; i++) {

        if (i < 0 || i >= gLevel.SIZE) { continue }

        for (var j = tempJ - 1; j <= tempJ + 1; j++) {

            if (j < 0 || j >= gLevel.SIZE) { continue }
            if (i == tempI && j == tempJ) { continue }
            if (gBoard[i][j].isMine) {
                mineCount++
            }
        }
    }
    gBoard[tempI][tempJ].minesAroundCount = mineCount


}

// this function sets the numbers color
function setColors() {

    for (var i = 0; i < gBoardPositions.length; i++) {

        const elCurrCell = document.querySelector(`.cell-${gBoardPositions[i].i}-${gBoardPositions[i].j}`)

        switch (gBoard[gBoardPositions[i].i][gBoardPositions[i].j].minesAroundCount) {
            case 0:
                if (gBoard[gBoardPositions[i].i][gBoardPositions[i].j].isMine) {
                    break
                } else {
                    elCurrCell.style.color = '#efefef'
                }
                break;
            case 1:
                elCurrCell.style.color = '#47b0d6'
                break;
            case 2:
                elCurrCell.style.color = '#16821f'
                break;
            case 3:
                elCurrCell.style.color = '#e3090d'
                break;
            case 4:
                elCurrCell.style.color = '#071e63'
                break;
            case 5:
                elCurrCell.style.color = '#7d0608'
                break;
            case 6:
                elCurrCell.style.color = '#14826c'
                break;
            case 7:
                elCurrCell.style.color = '#black'
                break;
            case 8:
                elCurrCell.style.color = 'gray'
                break;
        }
    }
}

//-----Left and Right mouse click functions-----//

// this function is called when the user left clicks on a specific cell 
function cellClicked(ev) {

    const cell = {
        i: ev.dataset.i,
        j: ev.dataset.j
    }

    if (gHintMode) {
        if (!gBoard[cell.i][cell.j].isShown) {
            useHint(cell)
            return
        }
    }

    startGame(cell)
    var currCellClicked = gBoard[cell.i][cell.j]

    if (currCellClicked.isMarked) {
        return
    }
    if (currCellClicked.isMine) {
        if (gLivesCounter === 1) {
            gLivesCounter--
            elLives.innerText = `LIVES: ${LIVE.repeat(gLivesCounter)}`
            showMines(ev)
            return
        } else {
            gLivesCounter--
            elLives.innerText = `LIVES: ${LIVE.repeat(gLivesCounter)}`
            ev.innerText = MINE
        }
    }
    checkifMine(cell)
}

// this function is called when the user right clicks the mouse
function rightClick(event, el) {

    const cellI = +el.dataset.i
    const cellJ = +el.dataset.j

    if (gHintMode) { return }

    if (event.button === 2) {
        const currgBoardPos = gBoard[cellI][cellJ]

        if (currgBoardPos.isShown) {
            console.log("nope");

        } else if (currgBoardPos.isMarked) {
            currgBoardPos.isMarked = false
            gFlagCounter++
            if (currgBoardPos.isMarked) {
                el.innerText = FLAG
            } else {
                el.innerText = ''
            }

        } else {
            currgBoardPos.isMarked = true
            gFlagCounter--
            if (currgBoardPos.isMarked) {
                el.innerText = FLAG
            } else {
                el.innerText = ''
            }

        }
        elMinesLeft.innerText = 'Mines left: ' + gFlagCounter

    }
    if (gFlagCounter === 0) {
        checkVictory()
    }

}

//-----More Functions-----//

// this is a recursive function that checks the relative specific cell
function checkifMine(cell) {

    const currCellI = +cell.i
    const currCellJ = +cell.j
    const currgBoardPos = gBoard[currCellI][currCellJ]

    const elCurrCell = document.querySelector(`.cell-${currCellI}-${currCellJ}`)

    if (!currgBoardPos.isMine) {
        if (currgBoardPos.isMarked) {
            return
        }

        currgBoardPos.isShown = true
        elCurrCell.classList.add('marked')

        if (currgBoardPos.minesAroundCount === 0) {
            elCurrCell.innerText = 0
            for (var i = currCellI - 1; i <= currCellI + 1; i++) {

                if (i < 0 || i >= gLevel.SIZE) {
                    continue
                }
                for (var j = currCellJ - 1; j <= currCellJ + 1; j++) {
                    if (j < 0 || j >= gLevel.SIZE) {
                        continue
                    }
                    if (gBoard[i][j].isShown) {
                        continue
                    }

                    const cellChan = {
                        i: i,
                        j: j
                    }
                    checkifMine(cellChan)
                }
            }
        }
        elCurrCell.innerText = currgBoardPos.minesAroundCount
    }
}

// this function shows all the mines when user lost
function showMines(cell) {
    cell.classList.add('red-marked')
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (gBoard[i][j].isMine) {
                elCell.innerText = MINE
            }
        }
    }
    loss()
}

// this function sets all loss settings 
function loss() {
    elResetBtn.innerText = SAD
    gGame.isOn = false
    clearInterval(gTimeInterval)
    var elCells = document.querySelectorAll(`.cell`)
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].removeAttribute('onclick')
        elCells[i].removeAttribute('onmouseup')
    }
}

// this function checks for victory
function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cellElement = gBoard[i][j]
            if (cellElement.isMine !== cellElement.isMarked) {
                console.log("not win yet");
                loss()
                return
            }
        }
    }
    elResetBtn.innerText = COOL
    gGame.isOn = false
    clearInterval(gTimeInterval)
    var elCells = document.querySelectorAll(`.cell`)
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].removeAttribute('onclick')
        elCells[i].removeAttribute('onmouseup')
    }
}

// this function sets the time that has passed from the moment the user start playing
function setTimer() {

    var startingTime = new Date().getTime()

    gTimeInterval = setInterval(function () {
        var now = new Date().getTime()
        var timeLeft = now - startingTime
        elTimer.innerText = `Time Passed: ${Math.floor(timeLeft / 1000)}`
    }, 1000)
}

// this function check if you have any hints left and actives what so called "Hint Mode"
function enterHintMode() {
    if (gGame.isOn) {
        if (gHintsCounter > 0) {
            if (gHintMode) {
                elHints.innerText = `(OFF) Hints: ${HINT.repeat(gHintsCounter)}`
                gHintMode = false
            } else {
                elHints.innerText = `(ON) Hints: ${HINT.repeat(gHintsCounter)}`
                gHintMode = true
            }
        } else {
            gHintMode = false
            elHints.innerText = `(OFF) Hints: `
            return
        }
    }
}

// this function let you use a hint while in Hint mode
function useHint(cell) {

    if (gHintsCounter === 0) { return }

    if (gHintMode) {
        showHint(cell)
        gHintsCounter--

    }

}

// this function shows the choosen cell its 1st degree relatives for 1s
function showHint(cell) {
    const tempI = +cell.i
    const tempJ = +cell.j

    var tempArr = []

    for (var i = tempI - 1; i <= tempI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) { continue }
        for (var j = tempJ - 1; j <= tempJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) { continue }
            if (gBoard[i][j].isShown) { continue }
            if (gBoard[i][j].isMarked) { continue }

            tempArr.push({
                i: i,
                j: j
            })
        }
    }

    for (var i = 0; i < tempArr.length; i++) {
        const elTempCell = document.querySelector(`.cell-${tempArr[i].i}-${tempArr[i].j}`)
        gBoard[tempArr[i].i][tempArr[i].j].isMarked = true
        elTempCell.innerText = (gBoard[tempArr[i].i][tempArr[i].j].isMine ? MINE : '')
    }

    setTimeout(() => {
        for (var i = 0; i < tempArr.length; i++) {
            const elTempCell = document.querySelector(`.cell-${tempArr[i].i}-${tempArr[i].j}`)
            gBoard[tempArr[i].i][tempArr[i].j].isMarked = false
            elTempCell.innerText = ''
            elHints.innerText = `(OFF) Hints: ${HINT.repeat(gHintsCounter)}`
            gHintMode = false
            if (gHintsCounter === 0) {
                gHintMode = false
                elHints.innerText = `(OFF) Hints: `
            }
        }
    }, 1000)


    return
}
