const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#3b82f6', '#f97316'];
const SHAPES = ['●', '■', '▲', '★', '♦'];

export function launchConfetti(count = 40) {
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.fontSize = `${12 + Math.random() * 14}px`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4500);
}
