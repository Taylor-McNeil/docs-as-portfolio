import { TicTacToeGame } from "@/components/interactive/TicTacToeGame";

export default function TestGame() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>
      <TicTacToeGame />
    </div>
  );
}