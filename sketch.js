var board = [];
// Hold positions of each square location to use for checkers, chosenSquares etc..
var positions = [[], [], [], [], [], [], [], []];
var sqSize;

var turn = "W";
var choosing = true; // if you are choosing a checker of not

// Also used in check rules function
// Holds the chosen one
var curPos = {
  i: 0,
  j: 0,
};
// Holds the possible future position of the chosen one
// When every you press on an open tile and you have already chosen this is used in check rules
var futurePos = {
  i: 0,
  j: 0,
};

// isDoubleJumping is only really used in the checkRules function as a way to stop normal diagonal moves
// also used to stop selecting different checkers
var isDoubleJumping = false;
// heldPos is used to force the player to finish a double jump by automatically selecting the checker
var heldPos = {
  i: 0,
  j: 0,
};

// Get Image for the kings
var Crown;
function preload() {
  Crown = loadImage("Images/Crown.png");

  WinnerDisp = document.getElementById("WinText");
  GameOverBox = document.getElementById("GameOverBox");
}


var PlayAgainButton;
function setup() {
  // initilize the canvas position to the canvas container div
  let canvas = createCanvas(700, 700);
  canvas.parent("canvascontainer");
  imageMode(CENTER);
  
  // Commenting noStroke out also gives a nice art style
  noStroke();

  // Create the standard draughts/checker setup
  board = SetupBoard(board);

  // just resets the game
  PlayAgainButton = select("#PlayAgain");
  PlayAgainButton.mousePressed(PlayAgain);
}

function draw() {
  DrawBoard();

  // Used to determine win conditions, counts the number of specific color checkers in board
  var BlackCheckerNUM = 0;
  var WhiteCheckerNUM = 0;
  let canMove = false; // Will stay false if there are no available moves for the team

  // FillColor is used to make room for highlighting the squares
  // Might not be entirely necessary, but it cleans the code up a bit
  let fillColor = 0;

  
  // turnKing is mostly used in tandem with checking for normal checkers but there are some exceptions
  // probably a better way to do this but it might make up for it in readability
  let turnKing;
  if (turn == "W") {
    turnKing = "KW";
  } else if (turn == "B") {
    turnKing = "KB";
  };

  // Update the checkers
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {

      let BoardIndex = board[i][j];

      // used to check if there is a winner yet
      if (BoardIndex == "B" || BoardIndex == "KB") {
        BlackCheckerNUM++;
      };
      if (BoardIndex == "W" || BoardIndex == "KW") {
        WhiteCheckerNUM++;
      };
      
      // Create the Checkers themselves
      if (BoardIndex != "") {
        let blackColor = 43;
        let whiteColor = 243;
      
        // Define colors depending on the checker
        if (BoardIndex == "B" || BoardIndex == "KB") {
          fillColor = blackColor;
        } else if (BoardIndex == "W" || BoardIndex == "KW") {
          fillColor = whiteColor;
        };

        // Highlight the square underneath if selected
        if (curPos.i == i && curPos.j == j) {
          fill(254, 255, 1, 50);
          rect(positions[i][j].x, positions[i][j].y, sqSize, sqSize);
        };

        // Getting positions for chekers is similar to the DrawBoard function's squares
        let cirSize = sqSize - 10;
        let x = sqSize * j + sqSize / 2;
        let y = sqSize * i + sqSize / 2;

        // Draw the checkers
        fill(fillColor);
        ellipse(x, y, cirSize, cirSize);
        // Draw the crowns
        if (BoardIndex == "KW" || BoardIndex == "KB") {
          tint(255, 100);
          image(Crown, x, y, cirSize-25, cirSize-25);
        };    
      };

      // If the checker is sipping tea with the enemy + it's a peon = make it a king
      if (i == 0 && BoardIndex == "W") {
        board[i][j] = "KW";
      };
      if (i == 7 && BoardIndex == "B") {
        board[i][j] = "KB";
      };


      
      
      if (board[i][j] == turn || board[i][j] == turnKing) {
        // just because findMoves function takes a dictionary instead of an x and y position
        let checkerPos = {
          i: i,
          j: j,
        };
        
        // Make sure to account for kings
        let foo;
        if (board[i][j] == turnKing) {
          foo = findMoves(checkerPos, turn, true, false, false);
        } else {
          foo = findMoves(checkerPos, turn, false, false, false);
        }
        
        // if there are any possible moves for any checkers of one color on the board then the game must go on!
        if (foo.length != 0) {
          canMove = true;
        }
      }


      // Positions are noted according to the board array and square locations not the ellipses themselves
      let boundX = (mouseX > positions[i][j].x && mouseX < positions[i][j].x + sqSize);
      let boundY = (mouseY > positions[i][j].y && mouseY < positions[i][j].y + sqSize);

      // Change mouse cursor when hovering over the board
      if (boundX && boundY)  {
        cursor(HAND);
      }
    };
  };
  
  // One side wins if either there are no checkers of the opposing team or they cant make any valid moves
  if (BlackCheckerNUM == 0 || (canMove == false && turn == "B")) {
    console.log("White Wins!!");

    GameOverBox.style.display = "revert";
    WinnerDisp.innerHTML = "White Wins!";

    noLoop();
  };
  if (WhiteCheckerNUM == 0 || (canMove == false && turn == "W")) {
    console.log("Black Wins!!");
    WinnerDisp.innerHTML = "Black Wins!";

    GameOverBox.style.display = "revert";
    noLoop();
  };
};

function DrawBoard() {
  let sqColor = 0;

  // Used for remembering the positions of the squares
  let row = 0;
  let col = 0;

  // Board is 8 by 8
  sqSize = width / 8;
  for (let i = 0; i < height; i += sqSize) {
    for (let j = 0; j < width; j += sqSize) {
      // Alternate Colors
      if (sqColor % 2 == 0) {
        fill(234, 187, 142);
      } else {
        fill(128, 64, 35);
      };

      // Draw squares
      rect(j, i, sqSize, sqSize);
      sqColor++;

      // Remember position of the square
      positions[col][row] = createVector(j, i);
      row++;
    };
    // Alternate the square color once the row is over so that row 1 of col 1 is a different color than row 1 of col 2
    // gives the checkerboard the iconic diagonal lines
    sqColor++;

    // Begin the next column in held positions array
    col++;
    row = 0;
  };
};

function mousePressed() {
  // check all locations and compare them to the mouse position
  // x/y positions of the tiles are noted inside of DrawBoard function
  
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      
      // Positions are noted according to the board array and square locations not the ellipses themselves
      let boundX = (mouseX > positions[i][j].x && mouseX < positions[i][j].x + sqSize);
      let boundY = (mouseY > positions[i][j].y && mouseY < positions[i][j].y + sqSize);

      // Do stuff to the square you are pressing with the mouse
      if (boundX && boundY) {
        // assign kings to their colors
        let turnKing;
        if (turn == "W") {
          turnKing = "KW";
        } else if (turn == "B") {
          turnKing = "KB";
        };

        // future position is where you pressed in case that was not obvious enough
        futurePos.i = i;
        futurePos.j = j;
        if ((board[i][j] == turn || board[i][j] == turnKing) && !isDoubleJumping) {
          // If you press on your own checker change the chosen checker
          curPos.i = i;
          curPos.j = j;
          choosing = false;
        };

        // only check to see if you have made a valid move if you have pressed on an empty tile and have a chosen checker
        // empty tile part is not necessary as it just wont be a valid move but it saves on some performance so why not
        if (!choosing && board[i][j] == "") { 
          let out = []; // holds all of the move the checker can make
          // determine if the checker you are trying to make a move for is a king or not
          let checkerType = board[curPos.i][curPos.j];
          if (!choosing && board[i][j] == "") {
            // get all move the checker can make into an array
            if (checkerType == turnKing) {
              out = findMoves(curPos, turn, true, false, false);
            } else {
              out = findMoves(curPos, turn, false, false, false);
            };
            console.log(out);
          };

          for (let k = 0; k < out.length; k++) {
            if (futurePos.i == out[k].i && futurePos.j == out[k].j) {
              
              // move current checker and delete jumped checker if possible
              if (checkerType != turnKing) {
                board[futurePos.i][futurePos.j] = turn;
              } else {
                board[futurePos.i][futurePos.j] = turnKing;
              };

              board[curPos.i][curPos.j] = "";
              if (out[k].jump != false) {
                board[out[k].jump[0]][out[k].jump[1]] = "";
              };

              // if you cant double jump then change turns, make sure IsDoubleJumping is off and go back to choosing checkers
              if (out[k].canDouble != true) {
                turn = ChangeTurn(turn);
                choosing = true;
                isDoubleJumping = false;

                if (turn == "B") {
                  console.log("Black's Turn");
                } else {
                  console.log("White's Turn");
                };
              } else {
                //isDoubleJumping bool is only really used in the checkRules function as a way to stop normal diagonal moves
                isDoubleJumping = true;
                // Set the chosen checker and finish the choosing process automatically
                curPos.i = i;
                curPos.j = j;
                choosing = false;
              };
            };
          };
        };
      };
    };
  };
};


function findMoves(curPos, turn, king, ghost, recursion, reversing) {

  // each possible turn is pushed into this array
  // moves array is returned at the end and then looped through in the mousepressed function
  // to check if the tile you pressed on is a valid move
  let moves = [];


  // INC is there to easily change between both colors
  // black needs to check downwards and white needs to check upwards
  // kings will use recursion gain the movement power of the other team thus giving them the power of the chosen one
  let INC = 0;

  // INCx is there as a place holder incase the checker is a ghost, meaning that it came from a king checker
  // INCx inverts the INC so that in recursion you can decrement while keeping the same team
  // let INCx = turn;
  // if (isKing) {
  //  INCx = ChangeTurn(turn);
  // }

 
  // Change the y direction of the jump depending on the color of the checker
  if (turn == "B") {
    INC = 1;
  } else if (turn == "W") {
    INC = -1;
  };
  

  
  // if the king is useing the opposite teams moves then you still need too keep the same team as to allow jumps op opposite teams to the king
  let opTurn = turn;
  if (!recursion) {
    opTurn = ChangeTurn(turn);
  };
  
  // this makes the code cleaner and easier to read even if it is only used once
  let opKingType;
  if (opTurn == "W") {
    opKingType = "KW"
  } else if (opTurn == "B") {
    opKingType = "KB"
  };

  // declared here for readability
  let DiagRight = curPos.j+1;
  let DiagLeft = curPos.j-1;

  // Make a normal diagonal move
  // isdoublejumping is declared after you begin the first jump of a doublejump
  if (!isDoubleJumping && !ghost && (curPos.i+INC >= 0 && curPos.i+INC < board.length)) { // if there is a double jump and a normal move then the double jump is forced
    if (board[curPos.i+INC][DiagLeft] == "") { // Left
      let move = {
        i: curPos.i+INC,
        j: curPos.j-1,
        jump: false,
        canDouble: false,
      };
      moves.push(move);
    };
    if (board[curPos.i+INC][DiagRight] == "") { // Right
      let move = {
        i: curPos.i+INC,
        j: curPos.j+1,
        jump: false,
        canDouble: false,
      };
      moves.push(move);
    };
  };

  
  // If checking the future positions makes you go outside of the board array then stop 'cause thats real bad
  if (curPos.i+INC*2 < board.length && curPos.i+INC*2 >= 0 ) {
    // boolean vals
    // check to see if you have an enemy checker adjacent
    let jumpRight = ((board[curPos.i+INC][DiagRight] == opTurn) || (board[curPos.i+INC][DiagRight] == opKingType));
    let jumpLeft = ((board[curPos.i+INC][DiagLeft] == opTurn) || (board[curPos.i+INC][DiagLeft] == opKingType));

    let diagonal;
    
    for (let i = 0; i < 2; i++) {
      let adjacentCheckers;
      // switch from left to right
      let Dir;
      if (i == 0) {
        Dir = -1;
        adjacentCheckers = jumpLeft;
        diagonal = DiagLeft
      } else {
        Dir = 1;
        adjacentCheckers = jumpRight;
        diagonal = DiagRight;
      }

      
      

      // check for jumps
      if (curPos.j+(2*Dir) >= 0) { // check to make sure that the move wont leave the board array
        if (board[curPos.i+INC*2][curPos.j+(2*Dir)] == "" && adjacentCheckers) { // if you have an open landing spot and an enemy checker adjacent
          let move = {
            i: curPos.i+INC*2,
            j: curPos.j+(2*Dir),
            canDouble: false,
            jump: [curPos.i+INC, diagonal],
          };


          // if you are not already checking for double jumps then go ahead and check
          if (!ghost) {
            let opposite = ChangeTurn(turn);
            // this is extremely messy but I cant be bothered to put the time in to fixing it right now when it already works
            if (reversing) {
              move.canDouble = (findMoves(move, turn, true, true, true) || findMoves(move, opposite, false, true, false));
            } else if (king) {
              move.canDouble = (findMoves(move, turn, false, true, false) || findMoves(move, opposite, true, true, true));
            } else {
              move.canDouble = findMoves(move, turn, false, true, false);
            }
          } else {
            return true; // just returns a boolean because you only need to know if it is possible
          };
          moves.push(move);
        };
      };
    }
  }; 

  // if none of the checks above returned true then you cant double jump
  if (ghost) {
    return false;
  };

  // if the checker is a king them use the same function but for the other color
  // to allow jumps of the opposite team as well thought {recursion} has to be true in the function
  // this just stops opTurn from declaring above this next time basically
  if (king) {
    let kingMoves = findMoves(curPos, opTurn, false, false, true, true);
    for (let i = 0; i < kingMoves.length; i++) {
      moves.push(kingMoves[i]);
    };
  };

  // looped through in mousepressed function to check if the tile you are pressing on is a valid move
  return moves;
};


// Just the normal checker board setup
// This is more readable and better for testing than using a for loop
function SetupBoard(board) {

  board = [
    ["", "B", "", "B", "", "B", "", "B"],
    ["B", "", "B", "", "B", "", "B", ""],
    ["", "B", "", "B", "", "B", "", "B"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["W", "", "W", "", "W", "", "W", ""],
    ["", "W", "", "W", "", "W", "", "W"],
    ["W", "", "W", "", "W", "", "W", ""],
  ];

  // Empty board used for testing purposes
  // board = [
  //   ["", "", "", "", "", "", "", ""],
  //   ["", "", "B", "", "B", "", "", ""],
  //   ["", "", "", "", "", "KW", "", ""],
  //   ["", "", "", "", "", "", "W", ""],
  //   ["", "", "", "", "", "KW", "", ""],
  //   ["", "", "B", "", "B", "", "", ""],
  //   ["", "", "", "", "", "", "", ""],
  //   ["", "", "W", "", "W", "", "", ""],
  // ];
  return board;
};


// Called when play again button is pressed which is declared in setup
function PlayAgain() {

  // get rid of the displays, reset board and reset winner for the next game
  WinnerDisp.innerHTML = "";
  GameOverBox.style.display = "none";

  // Make sure that everything is reset for the next game
  board = SetupBoard(board);
  turn = "W";
  curPos = {
    i: 0,
    j: 0,
  };
  heldPos = {
    i: 0,
    j: 0,
  };
  futurePos = {
    i: 0,
    j: 0,
  };

  // NoLoop() is called right after the winner is determined
  loop();
}

// what do you think this is lol.
function ChangeTurn(turn) {
  if (turn == "W") {
    return "B";
  } else if (turn == "B") {
    return "W";
  } else {
    return undefined;
  };
};