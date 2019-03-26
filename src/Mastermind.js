// Author: Marguerite Williams
// Date: 3/26/19
// Class: CS 386
// Description: React implementation of the classic mastermind game.

import React, { Component } from 'react';
import './Mastermind.css';

const red = require('./images/redCircle.png');
const blue = require('./images/blueCircle.png');
const green = require('./images/greenCircle.png');
const purple = require('./images/purpleCircle.png');
const teal = require('./images/tealCircle.png');
const magenta = require('./images/magentaCircle.png');
const emptyCircle = require('./images/emptyCircle.png');
const white = require('./images/whiteCircle.png');

const NUM_ROWS = 6;

let uniqueSeed = 0;
function nextUniqueKey() {
    return uniqueSeed += 1;
}


class Popup extends React.Component {
    render() {
        return (
            <div className='popup'>
                <div className='popup_inner'>
                    <p>{this.props.text}</p>
                    <button onClick={this.props.closePopup}>Close</button>
                </div>
            </div>
        );
    }
}


class FeedBackCell extends Component {
    render () {
        return (
            <td style={{verticalAlign: "bottom"}}>
                <tbody className="feedback_table">
                    <tr>
                        <td>
                            <img className="small_circle"
                                 src={this.props.feedbackarray[this.props.rowIdx][0].color}
                                 alt={this.props.feedbackarray[this.props.rowIdx][0].colorName}
                            />
                        </td>
                        <td>
                            <img className="small_circle"
                                 src={this.props.feedbackarray[this.props.rowIdx][1].color}
                                 alt={this.props.feedbackarray[this.props.rowIdx][1].colorName}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <img className="small_circle"
                                 src={this.props.feedbackarray[this.props.rowIdx][2].color}
                                 alt={this.props.feedbackarray[this.props.rowIdx][2].colorName}
                            />
                        </td>
                        <td>
                            <img className="small_circle"
                                 src={this.props.feedbackarray[this.props.rowIdx][3].color}
                                 alt={this.props.feedbackarray[this.props.rowIdx][3].colorName}
                            />
                        </td>
                    </tr>
                </tbody>
            </td>
        );
    }
}


class Cell extends Component {
    render() {
        return (
            <td
                key={nextUniqueKey()}
                style={{verticalAlign: "bottom", height: "50px"}}
                onClick={() =>
                    this.props.handleClick(this.props.rowIdx, this.props.colIdx)
                }
            >
                <img
                    className="large_circle"
                    src={this.props.cell['color']}
                    alt={this.props.cell['colorName']}
                />
            </td>
        )
    }
}


class MasterMindTableRow extends Component {
    render() {
        return (
            <tr style={{height: "50px"}}>
            {
                <React.Fragment>
                    {this.props.row.map((cell, idx) =>
                        <Cell
                            key={nextUniqueKey()}
                            cell={cell}
                            rowIdx={this.props.idx}
                            colIdx={idx}
                            handleClick={this.props.handleClick}
                        />
                    )}
                    <FeedBackCell
                        rowIdx={this.props.idx}
                        feedbackarray={this.props.feedbackarray}
                    />
                </React.Fragment>
            }
            </tr>
        )
    }
}


// Class to display main board
class Mastermind extends Component {

    constructor(props) {
        super(props);

        this.state = this.initialState;

        this.handleClick = this.handleClick.bind(this);
        this.reset = this.reset.bind(this);
    }

    get initialState() {

        let winningColors = [];
        while(winningColors.length < 4){
            let r = Math.floor(Math.random()*5) + 1;
            winningColors.push(r);
            // uncomment this line for unique winning colors.
            // if(winningColors.indexOf(r) === -1) winningColors.push(r);
        }

        let winningRow = [
            this.paletteColors[winningColors[0]],
            this.paletteColors[winningColors[1]],
            this.paletteColors[winningColors[2]],
            this.paletteColors[winningColors[3]]
        ];

        let row = [
            this.nonFilledCircle,
            this.nonFilledCircle,
            this.nonFilledCircle,
            this.nonFilledCircle
        ];

        // Feedback row needs to look at the first row and
        // cross reference it with the goal state.
        let rowFeedback = [
            this.emptyCircle,
            this.emptyCircle,
            this.emptyCircle,
            this.emptyCircle
        ];

        return {
            statusCircle: {color: emptyCircle, colorName: 'Empty circle'},
            currentRow: 0,
            feedbackArray: [rowFeedback],
            mastermindArray: [row],
            winningRow: winningRow,
            showPopup: false,
            haveAWinner: false,
            gameOver: false
        };

    }

    togglePopup() {
        this.setState({
            showPopup: !this.state.showPopup
        });
    }

    paletteColors = [
        {color: red, colorName: 'Red'},
        {color: green, colorName: 'Green'},
        {color: teal, colorName: 'Teal'},
        {color: magenta, colorName: 'Magenta'},
        {color: blue, colorName: 'Blue'},
        {color: purple, colorName: 'Purple'}
    ];

    emptyCircle = {
        color: white,
        colorName: 'whiteCircle'
    };

    nonFilledCircle = {
        color: emptyCircle,
        colorName: 'Empty circle'
    };


    // Find out which circle was chosen and set the color to the same as selected color
    // handleClick(idx, row, feedback) {
    handleClick(rowIdx, colIdx) {
        if(this.state.haveAWinner === true || rowIdx !== 0) {
            return;
        }
        let gameover = false;

        let newBoard = JSON.parse(JSON.stringify(this.state.mastermindArray));
        newBoard[rowIdx][colIdx] = this.state.statusCircle;

        let newFeedback = JSON.parse(JSON.stringify(this.state.feedbackArray));
        let won = false;

        // if all circles on the bottom row are filled,
        if(this.doWeHaveACompleteRow(newBoard, rowIdx)) {
            let feedbackResult = this.calculateFeedback(newBoard, rowIdx, newFeedback);

            newFeedback = feedbackResult[0];
            won = feedbackResult[1];
            if (won || this.state.currentRow === NUM_ROWS - 1) {
                gameover = true;
            }

            if(!gameover && this.state.currentRow !== NUM_ROWS - 1) {
                this.createNewRow(newBoard);

                let nextFeedback = [
                    this.emptyCircle,
                    this.emptyCircle,
                    this.emptyCircle,
                    this.emptyCircle
                ];

                newFeedback.unshift(nextFeedback);
            }
        }

        this.setState({
            mastermindArray: newBoard,
            feedbackArray: newFeedback,
            haveAWinner: won,
            gameOver: gameover
        });
    }

    calculateFeedback(newBoard, rowIdx, newFeedback) {
        let won = false;
        let correctColorPositionCount = 0;
        let correctColorWrongPositionCount = 0;
        let feedbacktracker = [false, false, false, false];

        for (let i = 0; i < 4; i++) {
            if (newBoard[rowIdx][i].colorName === this.state.winningRow[i].colorName) {
                feedbacktracker[i] = true;
                correctColorPositionCount += 1;
            }
        }

        for (let i = 0; i < 4; i++) {
            let currentColor = newBoard[rowIdx][i].colorName;
            for (let j = 0; j < 4; j++) {
                if (!feedbacktracker[j] && i !== j) {
                    if (currentColor === this.state.winningRow[j].colorName) {
                        correctColorWrongPositionCount += 1;
                        feedbacktracker[j] = true;
                        break;
                    }
                }
            }
        }

        if(correctColorPositionCount > 0) {
            // fill first part of circles with green for correct colors and positions
            for (let i = 0; i < correctColorPositionCount; i++) {
                newFeedback[rowIdx][i].colorName = 'Green';
                newFeedback[rowIdx][i].color = green;
            }
        }

        if(correctColorWrongPositionCount > 0) {

            // fill remaining appropriately with correct color wrong positions
            for (let i = correctColorPositionCount; i < correctColorPositionCount + correctColorWrongPositionCount; i++) {
                newFeedback[rowIdx][i] = this.nonFilledCircle;
            }
        }

        this.setState({feedbackArray: newFeedback});

        if (correctColorPositionCount === 4) {
            console.log("We have a winner!");
            won = true;
        }

        return [newFeedback, won];
    }

    createNewRow(newBoard) {
        console.log("Creating New Row");

        let newRow = [
            this.nonFilledCircle,
            this.nonFilledCircle,
            this.nonFilledCircle,
            this.nonFilledCircle
        ];

        let rowNum = JSON.parse(JSON.stringify(this.state.currentRow));
        rowNum += 1;
        this.setState({currentRow: rowNum});

        newBoard.unshift(newRow);
    }

    doWeHaveACompleteRow(newBoard, rowIdx) {
        let empty = this.nonFilledCircle.colorName;
        console.log('doWeHaveACompleteRow rowIdx :', rowIdx);

        return !(newBoard[rowIdx][0].colorName === empty ||
            newBoard[rowIdx][1].colorName === empty ||
            newBoard[rowIdx][2].colorName === empty ||
            newBoard[rowIdx][3].colorName === empty);
    }

    componentDidMount() {

    }

    selectedPaletteCircle(circle) {
        console.log('selected a palette color', circle.colorName);
        this.setState({statusCircle: circle});
    }

    static getRandomIdx(low, high) {
            return Math.floor(Math.random() * (high - low + 1) + low);
    }

    paletteCircles() {
        return <table className="palette_circles">
            <tbody>
                <tr>
                    {
                        this.paletteColors.map((paletteElement, idx) =>
                            <td
                                key={idx}
                                onClick={() => this.selectedPaletteCircle(paletteElement)}>
                                <img className="large_circle" src={paletteElement.color} alt={paletteElement.colorName} />
                            </td>
                        )
                    }
                </tr>
            </tbody>
        </table>;
    }


    winningTable() {
        return <table className="winning_table">
            <tbody>
                <tr>
                    {this.state.winningRow.map((paletteElement, idx) =>
                    <td key={idx}>
                        <img className="small_circle" src={paletteElement.color} alt={paletteElement.colorName} />
                    </td>
                    )}
                </tr>
            </tbody>
        </table>;
    }

    statusRow() {
        let {
            color,
            colorName
        } = this.state.statusCircle;

        return <table className="status_circles">
            <tbody>
                <tr>
                    <td>
                        Selected Color:
                    </td>
                    <td>
                        <img className="large_circle" src={color} alt={colorName} />
                    </td>
                </tr>
            </tbody>
        </table>
    }


    reset() {
        let newState = this.initialState;
        // console.log('state = ', this.state);
        console.log('new state = ', newState);
        this.setState(newState);
    }


    topMessage() {
        if(!this.state.gameOver) {
            return <div style={{height: "50px", textAlign: "center", paddingBottom: "17px"}}>
                <h2>
                    Master Mind
                </h2>
                <p align="center">
                    <button onClick={this.togglePopup.bind(this)}>
                        How To Play
                    </button>

                </p>
                {this.state.showPopup ?
                    <Popup
                        text='
                                Select a color from the palette on the bottom and place it in the empty circles.
                                The idea of the game is for you, the the code-breaker, to guess the secret code
                                The code is a sequence of 4 colored pegs chosen from six colors available.
                                One guess comprises of filling a row with colors. After each guess you will get
                                feedback in the four smaller circles on the right. The number of pegs that are of
                                the right color and in the correct position show by a green circle, and the number
                                of pegs that are of the correct color but not in the correct position by a non-filled
                                circle.'
                        closePopup={this.togglePopup.bind(this)}
                    />
                    : null
                }
            </div>;

        } else if (this.state.haveAWinner) {
            return <div style={{height: "50px", align: "center"}}>
                <p align="center">You Won!</p>
                <p align="center">
                    <button onClick={this.reset}>
                        Reset?
                    </button>
                </p>
            </div>
        } else {
            return <div style={{height: "50px", align: "center"}}>
                <p align="center">You Lost. Game Over.</p>
                <p align="center">
                    <button onClick={this.reset}>
                        Reset?
                    </button>
                </p>
            </div>
        }
    }


    render() {
        return (
            <div className="Mastermind">
                {this.topMessage()}
                {this.statusRow()}
                {this.winningTable()}
                <div style={{height: ((NUM_ROWS - this.state.currentRow) * 58).toString() + "px"}}>&nbsp;</div>
                <table align="center" style={{ paddingTop: "25px"}}>
                    <tbody>
                        { this.state.mastermindArray.map((row, idx) =>
                            <MasterMindTableRow
                                key={nextUniqueKey()}
                                row={row}
                                idx={idx}
                                handleClick={this.handleClick}
                                feedbackarray={this.state.feedbackArray}
                            />)
                        }
                    </tbody>
                </table>
                {this.paletteCircles()}
            </div>
        );
    }
}

export default Mastermind;
