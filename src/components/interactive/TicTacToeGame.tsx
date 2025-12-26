"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Cell = "X" | "O" | null;
type GameState = "playing" | "player_win" | "computer_win" | "tie";

interface Message {
  text: string;
  type: "system" | "player" | "computer" | "result";
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to Tic Tac Toe!", type: "system" },
    { text: "You are X. Computer is O.", type: "system" },
    { text: "", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback((text: string, type: Message["type"]) => {
    setMessages((prev) => [...prev, { text, type }]);
  }, []);

  const renderBoard = useCallback(() => {
    const getCell = (i: number) => board[i] || (i + 1).toString();
    return [
      "",
      ` ${getCell(0)} | ${getCell(1)} | ${getCell(2)}`,
      "───┼───┼───",
      ` ${getCell(3)} | ${getCell(4)} | ${getCell(5)}`,
      "───┼───┼───",
      ` ${getCell(6)} | ${getCell(7)} | ${getCell(8)}`,
      "",
    ];
  }, [board]);

  const checkWin = useCallback((cells: Cell[], symbol: Cell): boolean => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6], // diagonals
    ];
    return lines.some(
      ([a, b, c]) => cells[a] === symbol && cells[b] === symbol && cells[c] === symbol
    );
  }, []);

  const isBoardFull = useCallback((cells: Cell[]): boolean => {
    return cells.every((cell) => cell !== null);
  }, []);

  const computerMove = useCallback((currentBoard: Cell[]) => {
    const emptyCells = currentBoard
      .map((cell, i) => (cell === null ? i : null))
      .filter((i): i is number => i !== null);

    if (emptyCells.length === 0) return;

    const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = [...currentBoard];
    newBoard[move] = "O";

    setTimeout(() => {
      setBoard(newBoard);
      addMessage(`Computer chose position ${move + 1}`, "computer");

      if (checkWin(newBoard, "O")) {
        setGameState("computer_win");
        setComputerScore((s) => s + 1);
        addMessage("Computer wins!", "result");
        addMessage("Type 'play' to play again.", "system");
      } else if (isBoardFull(newBoard)) {
        setGameState("tie");
        addMessage("It's a tie!", "result");
        addMessage("Type 'play' to play again.", "system");
      } else {
        addMessage("Please make a move (1-9):", "system");
      }
      setIsComputerThinking(false);
    }, 600);
  }, [addMessage, checkWin, isBoardFull]);

  const handlePlayerMove = useCallback((move: number) => {
    if (board[move] !== null) {
      addMessage("That spot is already taken!", "system");
      return;
    }

    const newBoard = [...board];
    newBoard[move] = "X";
    setBoard(newBoard);
    addMessage(`You chose position ${move + 1}`, "player");

    if (checkWin(newBoard, "X")) {
      setGameState("player_win");
      setPlayerScore((s) => s + 1);
      addMessage("You win!", "result");
      addMessage("Type 'play' to play again.", "system");
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameState("tie");
      addMessage("It's a tie!", "result");
      addMessage("Type 'play' to play again.", "system");
      return;
    }

    setIsComputerThinking(true);
    addMessage("Computer is thinking...", "system");
    computerMove(newBoard);
  }, [board, addMessage, checkWin, isBoardFull, computerMove]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setGameState("playing");
    setMessages([
      { text: "Welcome to Tic Tac Toe!", type: "system" },
      { text: "You are X. Computer is O.", type: "system" },
      { text: "", type: "system" },
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    setInput("");

    if (!trimmed) return;

    if (trimmed === "play" || trimmed === "reset") {
      resetGame();
      return;
    }

    if (trimmed === "score") {
      addMessage(`Player: ${playerScore} | Computer: ${computerScore}`, "system");
      return;
    }

    if (trimmed === "help") {
      addMessage("Commands: 1-9 (move), play (new game), score, help", "system");
      return;
    }

    if (gameState !== "playing") {
      addMessage("Game over! Type 'play' to start a new game.", "system");
      return;
    }

    if (isComputerThinking) {
      addMessage("Wait for the computer to move!", "system");
      return;
    }

    const move = parseInt(trimmed);
    if (isNaN(move) || move < 1 || move > 9) {
      addMessage("Invalid input. Enter a number 1-9.", "system");
      return;
    }

    handlePlayerMove(move - 1);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className="bg-surface-terminal border border-border rounded-lg overflow-hidden font-mono text-sm cursor-text"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-card/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-foreground-muted ml-2">TicTacToe.java</span>
        <span className="text-xs text-foreground-muted ml-auto">
          Player: {playerScore} | Computer: {computerScore}
        </span>
      </div>

      {/* Terminal Output */}
      <div className="h-80 overflow-y-auto p-4 space-y-1">
        {/* Board */}
        <div className="text-foreground-terminal">
          {renderBoard().map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line.split("").map((char, j) => {
                if (char === "X") {
                  return <span key={j} className="text-accent-success font-bold">{char}</span>;
                }
                if (char === "O") {
                  return <span key={j} className="text-accent font-bold">{char}</span>;
                }
                return <span key={j}>{char}</span>;
              })}
            </div>
          ))}
        </div>

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.type === "result"
                ? "text-accent-success font-bold"
                : msg.type === "player"
                ? "text-method-get"
                : msg.type === "computer"
                ? "text-accent"
                : "text-foreground-muted"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-accent-success">{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground-terminal"
            placeholder={gameState === "playing" ? "Enter move (1-9)..." : "Type 'play' to restart..."}
            autoFocus
          />
          <span className="animate-pulse text-foreground-terminal">█</span>
        </div>
      </form>
    </div>
  );
}