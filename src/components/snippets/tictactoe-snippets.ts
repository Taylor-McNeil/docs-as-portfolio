export const buildBoardCode = `public class TicTacToe {
    public static void main(String[] args) {
        
        char[][] gameBoard = {
            {'_','|','_','|','_'},
            {'_','|','_','|','_'},
            {' ','|',' ','|',' '}
        };
        
        printBoard(gameBoard);
    }
    
    public static void printBoard(char[][] gameBoard) {
        for (char[] row : gameBoard) {
            for (char c : row) {
                System.out.print(c);
            }
            System.out.println();
        }
    }
}`;

export const updateBoardCode = `public static void updateBoard(int position, int player, char[][] gameBoard) {
    
    char character;
    
    if (player == 1) {
        character = 'X';
    } else {
        character = 'O';
    }
    
    switch (position) {
        case 1:
            gameBoard[0][0] = character;
            printBoard(gameBoard);
            break;
        case 2:
            gameBoard[0][2] = character;
            printBoard(gameBoard);
            break;
        case 3:
            gameBoard[0][4] = character;
            printBoard(gameBoard);
            break;
        case 4:
            gameBoard[1][0] = character;
            printBoard(gameBoard);
            break;
        case 5:
            gameBoard[1][2] = character;
            printBoard(gameBoard);
            break;
        case 6:
            gameBoard[1][4] = character;
            printBoard(gameBoard);
            break;
        case 7:
            gameBoard[2][0] = character;
            printBoard(gameBoard);
            break;
        case 8:
            gameBoard[2][2] = character;
            printBoard(gameBoard);
            break;
        case 9:
            gameBoard[2][4] = character;
            printBoard(gameBoard);
            break;
        default:
            break;
    }
}`;

export const testUpdateBoardCode = `updateBoard(5, 1, gameBoard); // Player X in center
updateBoard(1, 2, gameBoard); // Computer O in top-left
updateBoard(7, 1, gameBoard); // Player X in bottom-left`;

export const playerInputCode = `import java.util.Scanner;

public class TicTacToe {
    
    // Static Scanner for reuse across methods
    static Scanner input = new Scanner(System.in);
    
    public static void main(String[] args) {
        char[][] gameBoard = {
            {'_','|','_','|','_'},
            {'_','|','_','|','_'},
            {' ','|',' ','|',' '}
        };
        
        playerMove(gameBoard);
    }
    
    public static void playerMove(char[][] gameBoard) {
        System.out.println("Please make a move. (1-9)");
        int move = input.nextInt();
        updateBoard(move, 1, gameBoard);
    }
}`;

export const validateMovesCode = `public static void playerMove(char[][] gameBoard) {
    boolean validMove = false;
    
    while (!validMove) {
        System.out.println("Please make a move. (1-9)");
        int move = input.nextInt();
        validMove = isValidMove(move, gameBoard);
        if (validMove) {
            updateBoard(move, 1, gameBoard);
        }
    }
}

public static boolean isValidMove(int move, char[][] gameBoard) {
    switch (move) {
        case 1:
            return gameBoard[0][0] == '_';
        case 2:
            return gameBoard[0][2] == '_';
        case 3:
            return gameBoard[0][4] == '_';
        case 4:
            return gameBoard[1][0] == '_';
        case 5:
            return gameBoard[1][2] == '_';
        case 6:
            return gameBoard[1][4] == '_';
        case 7:
            return gameBoard[2][0] == ' ';
        case 8:
            return gameBoard[2][2] == ' ';
        case 9:
            return gameBoard[2][4] == ' ';
        default:
            return false;
    }
}`;

export const computerMoveCode = `import java.util.Random;

public static void computerMove(char[][] gameBoard) {
    Random rand = new Random();
    boolean validMove = false;
    
    while (!validMove) {
        int move = rand.nextInt(9) + 1; // Random number 1-9
        validMove = isValidMove(move, gameBoard);
        if (validMove) {
            System.out.println("Computer chose position: " + move);
            updateBoard(move, 2, gameBoard);
        }
    }
}`;

export const isGameOverCode = `public static boolean isGameOver(char[][] gameBoard) {
    
    // Check horizontal wins
    if (gameBoard[0][0] == gameBoard[0][2] && 
        gameBoard[0][2] == gameBoard[0][4] && 
        gameBoard[0][0] != '_') {
        printWinner(gameBoard[0][0]);
        return true;
    }
    
    if (gameBoard[1][0] == gameBoard[1][2] && 
        gameBoard[1][2] == gameBoard[1][4] && 
        gameBoard[1][0] != '_') {
        printWinner(gameBoard[1][0]);
        return true;
    }
    
    if (gameBoard[2][0] == gameBoard[2][2] && 
        gameBoard[2][2] == gameBoard[2][4] && 
        gameBoard[2][0] != ' ') {
        printWinner(gameBoard[2][0]);
        return true;
    }
    
    // Check vertical wins
    if (gameBoard[0][0] == gameBoard[1][0] && 
        gameBoard[1][0] == gameBoard[2][0] && 
        gameBoard[0][0] != '_' && gameBoard[0][0] != ' ') {
        printWinner(gameBoard[0][0]);
        return true;
    }
    
    if (gameBoard[0][2] == gameBoard[1][2] && 
        gameBoard[1][2] == gameBoard[2][2] && 
        gameBoard[0][2] != '_' && gameBoard[0][2] != ' ') {
        printWinner(gameBoard[0][2]);
        return true;
    }
    
    if (gameBoard[0][4] == gameBoard[1][4] && 
        gameBoard[1][4] == gameBoard[2][4] && 
        gameBoard[0][4] != '_' && gameBoard[0][4] != ' ') {
        printWinner(gameBoard[0][4]);
        return true;
    }
    
    // Check diagonal wins
    if (gameBoard[0][0] == gameBoard[1][2] && 
        gameBoard[1][2] == gameBoard[2][4] && 
        gameBoard[0][0] != '_' && gameBoard[0][0] != ' ') {
        printWinner(gameBoard[0][0]);
        return true;
    }
    
    if (gameBoard[0][4] == gameBoard[1][2] && 
        gameBoard[1][2] == gameBoard[2][0] && 
        gameBoard[0][4] != '_' && gameBoard[0][4] != ' ') {
        printWinner(gameBoard[0][4]);
        return true;
    }
    
    // Check for tie (board full)
    if (isBoardFull(gameBoard)) {
        System.out.println("It's a tie!");
        return true;
    }
    
    return false;
}

public static void printWinner(char winner) {
    if (winner == 'X') {
        System.out.println("Player wins!");
    } else {
        System.out.println("Computer wins!");
    }
}

public static boolean isBoardFull(char[][] gameBoard) {
    for (int i = 0; i < gameBoard.length; i++) {
        for (int j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] == '_' || gameBoard[i][j] == ' ') {
                return false;
            }
        }
    }
    return true;
}`;

export const gameLoopCode = `public static void main(String[] args) {
    boolean playAgain = true;
    
    while (playAgain) {
        char[][] gameBoard = {
            {'_','|','_','|','_'},
            {'_','|','_','|','_'},
            {' ','|',' ','|',' '}
        };
        
        System.out.println("Welcome to Tic Tac Toe!");
        printBoard(gameBoard);
        
        boolean gameOver = false;
        
        while (!gameOver) {
            // Player's turn
            playerMove(gameBoard);
            gameOver = isGameOver(gameBoard);
            if (gameOver) break;
            
            // Computer's turn
            computerMove(gameBoard);
            gameOver = isGameOver(gameBoard);
        }
        
        System.out.println("Would you like to play again? (y/n)");
        char response = input.next().charAt(0);
        playAgain = (response == 'y' || response == 'Y');
    }
    
    System.out.println("Thanks for playing!");
    input.close();
}`;

// Retrospective code snippets
export const cleanBoardCode = `// Clean data model
private static char[][] board = new char[3][3];

// Visuals handled separately
private static void printBoard() {
    System.out.println("-------");
    for (int i = 0; i < 3; i++) {
        System.out.print("|");
        for (int j = 0; j < 3; j++) {
            char c = (board[i][j] == 0) ? ' ' : board[i][j];
            System.out.print(c + "|");
        }
        System.out.println("\\n-------");
    }
}`;

export const robustInputCode = `private static int getPlayerInput() {
    while (true) {
        String line = input.nextLine().trim().toLowerCase();
        
        if (line.equals("help")) {
            System.out.println("Commands: 1-9 (move), score, help");
            continue;
        }
        if (line.equals("score")) {
            System.out.println("Player: " + playerScore + " | Computer: " + computerScore);
            continue;
        }
        
        try {
            int move = Integer.parseInt(line);
            if (move >= 1 && move <= 9) return move;
            System.out.println("Please enter a number between 1-9.");
        } catch (NumberFormatException e) {
            System.out.println("Invalid input. Enter 1-9 or 'help'.");
        }
    }
}`;

export const coordinateMathCode = `// Position 1-9 maps to row/col
// (position - 1) / 3 = row
// (position - 1) % 3 = column

private static boolean isValidMove(int position) {
    int row = (position - 1) / 3;
    int col = (position - 1) % 3;
    return board[row][col] == ' ';
}

private static void updateBoard(int position, char symbol) {
    int row = (position - 1) / 3;
    int col = (position - 1) % 3;
    board[row][col] = symbol;
}`;


export const fullCodeAfterValidation = `import java.util.Scanner;

public class TicTacToe {
    
    static Scanner input = new Scanner(System.in);
    
    public static void main(String[] args) {
        char[][] gameBoard = {
            {'_','|','_','|','_'},
            {'_','|','_','|','_'},
            {' ','|',' ','|',' '}
        };
        
        printBoard(gameBoard);
        playerMove(gameBoard);
    }
    
    public static void printBoard(char[][] gameBoard) {
        for (char[] row : gameBoard) {
            for (char c : row) {
                System.out.print(c);
            }
            System.out.println();
        }
    }
    
    public static void updateBoard(int position, int player, char[][] gameBoard) {
        
        char character;
        
        if (player == 1) {
            character = 'X';
        } else {
            character = 'O';
        }
        
        switch (position) {
            case 1:
                gameBoard[0][0] = character;
                printBoard(gameBoard);
                break;
            case 2:
                gameBoard[0][2] = character;
                printBoard(gameBoard);
                break;
            case 3:
                gameBoard[0][4] = character;
                printBoard(gameBoard);
                break;
            case 4:
                gameBoard[1][0] = character;
                printBoard(gameBoard);
                break;
            case 5:
                gameBoard[1][2] = character;
                printBoard(gameBoard);
                break;
            case 6:
                gameBoard[1][4] = character;
                printBoard(gameBoard);
                break;
            case 7:
                gameBoard[2][0] = character;
                printBoard(gameBoard);
                break;
            case 8:
                gameBoard[2][2] = character;
                printBoard(gameBoard);
                break;
            case 9:
                gameBoard[2][4] = character;
                printBoard(gameBoard);
                break;
            default:
                break;
        }
    }
    
    public static void playerMove(char[][] gameBoard) {
        boolean validMove = false;
        
        while (!validMove) {
            System.out.println("Please make a move. (1-9)");
            int move = input.nextInt();
            validMove = isValidMove(move, gameBoard);
            if (validMove) {
                updateBoard(move, 1, gameBoard);
            } else {
                System.out.println("Invalid move. Try again.");
            }
        }
    }
    
    public static boolean isValidMove(int move, char[][] gameBoard) {
        switch (move) {
            case 1:
                return gameBoard[0][0] == '_';
            case 2:
                return gameBoard[0][2] == '_';
            case 3:
                return gameBoard[0][4] == '_';
            case 4:
                return gameBoard[1][0] == '_';
            case 5:
                return gameBoard[1][2] == '_';
            case 6:
                return gameBoard[1][4] == '_';
            case 7:
                return gameBoard[2][0] == ' ';
            case 8:
                return gameBoard[2][2] == ' ';
            case 9:
                return gameBoard[2][4] == ' ';
            default:
                return false;
        }
    }
}`;

export const completeCode = `import java.util.Random;
import java.util.Scanner;

public class TicTacToe {
    
    static Scanner input = new Scanner(System.in);
    
    public static void main(String[] args) {
        boolean playAgain = true;
        
        while (playAgain) {
            char[][] gameBoard = {
                {'_','|','_','|','_'},
                {'_','|','_','|','_'},
                {' ','|',' ','|',' '}
            };
            
            System.out.println("Welcome to Tic Tac Toe!");
            printBoard(gameBoard);
            
            boolean gameOver = false;
            
            while (!gameOver) {
                // Player's turn
                playerMove(gameBoard);
                gameOver = isGameOver(gameBoard);
                if (gameOver) break;
                
                // Computer's turn
                computerMove(gameBoard);
                gameOver = isGameOver(gameBoard);
            }
            
            System.out.println("Would you like to play again? (y/n)");
            char response = input.next().charAt(0);
            playAgain = (response == 'y' || response == 'Y');
        }
        
        System.out.println("Thanks for playing!");
        input.close();
    }
    
    public static void printBoard(char[][] gameBoard) {
        for (char[] row : gameBoard) {
            for (char c : row) {
                System.out.print(c);
            }
            System.out.println();
        }
    }
    
    public static void updateBoard(int position, int player, char[][] gameBoard) {
        
        char character;
        
        if (player == 1) {
            character = 'X';
        } else {
            character = 'O';
        }
        
        switch (position) {
            case 1:
                gameBoard[0][0] = character;
                printBoard(gameBoard);
                break;
            case 2:
                gameBoard[0][2] = character;
                printBoard(gameBoard);
                break;
            case 3:
                gameBoard[0][4] = character;
                printBoard(gameBoard);
                break;
            case 4:
                gameBoard[1][0] = character;
                printBoard(gameBoard);
                break;
            case 5:
                gameBoard[1][2] = character;
                printBoard(gameBoard);
                break;
            case 6:
                gameBoard[1][4] = character;
                printBoard(gameBoard);
                break;
            case 7:
                gameBoard[2][0] = character;
                printBoard(gameBoard);
                break;
            case 8:
                gameBoard[2][2] = character;
                printBoard(gameBoard);
                break;
            case 9:
                gameBoard[2][4] = character;
                printBoard(gameBoard);
                break;
            default:
                break;
        }
    }
    
    public static void playerMove(char[][] gameBoard) {
        boolean validMove = false;
        
        while (!validMove) {
            System.out.println("Please make a move. (1-9)");
            int move = input.nextInt();
            validMove = isValidMove(move, gameBoard);
            if (validMove) {
                updateBoard(move, 1, gameBoard);
            } else {
                System.out.println("Invalid move. Try again.");
            }
        }
    }
    
    public static boolean isValidMove(int move, char[][] gameBoard) {
        switch (move) {
            case 1:
                return gameBoard[0][0] == '_';
            case 2:
                return gameBoard[0][2] == '_';
            case 3:
                return gameBoard[0][4] == '_';
            case 4:
                return gameBoard[1][0] == '_';
            case 5:
                return gameBoard[1][2] == '_';
            case 6:
                return gameBoard[1][4] == '_';
            case 7:
                return gameBoard[2][0] == ' ';
            case 8:
                return gameBoard[2][2] == ' ';
            case 9:
                return gameBoard[2][4] == ' ';
            default:
                return false;
        }
    }
    
    public static void computerMove(char[][] gameBoard) {
        Random rand = new Random();
        boolean validMove = false;
        
        while (!validMove) {
            int move = rand.nextInt(9) + 1;
            validMove = isValidMove(move, gameBoard);
            if (validMove) {
                System.out.println("Computer chose position: " + move);
                updateBoard(move, 2, gameBoard);
            }
        }
    }
    
    public static boolean isGameOver(char[][] gameBoard) {
        
        // Check horizontal wins
        if (gameBoard[0][0] == gameBoard[0][2] && 
            gameBoard[0][2] == gameBoard[0][4] && 
            gameBoard[0][0] != '_') {
            printWinner(gameBoard[0][0]);
            return true;
        }
        
        if (gameBoard[1][0] == gameBoard[1][2] && 
            gameBoard[1][2] == gameBoard[1][4] && 
            gameBoard[1][0] != '_') {
            printWinner(gameBoard[1][0]);
            return true;
        }
        
        if (gameBoard[2][0] == gameBoard[2][2] && 
            gameBoard[2][2] == gameBoard[2][4] && 
            gameBoard[2][0] != ' ') {
            printWinner(gameBoard[2][0]);
            return true;
        }
        
        // Check vertical wins
        if (gameBoard[0][0] == gameBoard[1][0] && 
            gameBoard[1][0] == gameBoard[2][0] && 
            gameBoard[0][0] != '_' && gameBoard[0][0] != ' ') {
            printWinner(gameBoard[0][0]);
            return true;
        }
        
        if (gameBoard[0][2] == gameBoard[1][2] && 
            gameBoard[1][2] == gameBoard[2][2] && 
            gameBoard[0][2] != '_' && gameBoard[0][2] != ' ') {
            printWinner(gameBoard[0][2]);
            return true;
        }
        
        if (gameBoard[0][4] == gameBoard[1][4] && 
            gameBoard[1][4] == gameBoard[2][4] && 
            gameBoard[0][4] != '_' && gameBoard[0][4] != ' ') {
            printWinner(gameBoard[0][4]);
            return true;
        }
        
        // Check diagonal wins
        if (gameBoard[0][0] == gameBoard[1][2] && 
            gameBoard[1][2] == gameBoard[2][4] && 
            gameBoard[0][0] != '_' && gameBoard[0][0] != ' ') {
            printWinner(gameBoard[0][0]);
            return true;
        }
        
        if (gameBoard[0][4] == gameBoard[1][2] && 
            gameBoard[1][2] == gameBoard[2][0] && 
            gameBoard[0][4] != '_' && gameBoard[0][4] != ' ') {
            printWinner(gameBoard[0][4]);
            return true;
        }
        
        // Check for tie (board full)
        if (isBoardFull(gameBoard)) {
            System.out.println("It's a tie!");
            return true;
        }
        
        return false;
    }
    
    public static void printWinner(char winner) {
        if (winner == 'X') {
            System.out.println("Player wins!");
        } else {
            System.out.println("Computer wins!");
        }
    }
    
    public static boolean isBoardFull(char[][] gameBoard) {
        for (int i = 0; i < gameBoard.length; i++) {
            for (int j = 0; j < gameBoard[i].length; j++) {
                if (gameBoard[i][j] == '_' || gameBoard[i][j] == ' ') {
                    return false;
                }
            }
        }
        return true;
    }
}`;