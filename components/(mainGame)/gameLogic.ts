export type Move = "ROCK" | "PAPER" | "SCISSORS" | null;

export const MOVES: { id: Move; beats: Move }[] = [
  { id: "ROCK", beats: "SCISSORS" },
  { id: "PAPER", beats: "ROCK" },
  { id: "SCISSORS", beats: "PAPER" },
];

// Helper to get a random move for testing/bots
export function getComputerMove(): Move {
  // Filter out nulls to ensure we pick a valid move
  const validMoves = MOVES.filter((m) => m.id !== null);
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex].id;
}

export function determineWinner(
  player: Move,
  opponent: Move,
): "win" | "lose" | "draw" {
  // 1. Handle Draw
  if (player === opponent) return "draw";

  // 2. Handle missing moves (safety check)
  if (!player || !opponent) return "draw";

  // 3. Find the player's move definition
  const moveDetail = MOVES.find((m) => m.id === player);

  // 4. Check if player's move beats opponent's move
  return moveDetail?.beats === opponent ? "win" : "lose";
}
