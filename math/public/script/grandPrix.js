// public/script/game.js

// Variáveis de estado
let current = 0;
let goal = 0;
let score = 0;
let timeLeft = 0; // Tempo acumulado
let savedNumber = 1; // Número salvo inicial
const targetScoreToWin = 100; // Pontos necessários para vencer

// Arrays e intervalos
let circles = []; // Bolinhas que estão na tela
let timerInterval;
let spawnInterval;
let animationId;

// Elementos do DOM
const currentElem = document.getElementById('current');
const goalElem = document.getElementById('goal');
const scoreElem = document.getElementById('score');
const timeLeftElem = document.getElementById('timeLeft');
const savedNumberElem = document.getElementById('saved-number');
const container = document.getElementById('floating-circles-container');

// Adiciona container para o menu no final do jogo
const miniMenu = document.createElement('div');
miniMenu.id = 'mini-menu';
miniMenu.style.display = 'none';
miniMenu.style.position = 'fixed';
miniMenu.style.top = '50%';
miniMenu.style.left = '50%';
miniMenu.style.transform = 'translate(-50%, -50%)';
miniMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
miniMenu.style.color = 'white';
miniMenu.style.padding = '30px';
miniMenu.style.borderRadius = '10px';
miniMenu.style.textAlign = 'center';
miniMenu.style.fontSize = '1.5em';
miniMenu.innerHTML = `
  <p></p>
  <p>Score 🏆<span id="final-time"></span></p>
  <p>•••••••••••••••••••••••••••••••</p>
  <button id="play-again" style="background-color:rgb(47, 171, 233); color: white; font-size: 1.2em; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; transition: transform 0.2s ease-in-out;">Play Again</button>
  <button id="return" style="background-color: #ff4d4d; color: white; font-size: 1.2em; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; transition: transform 0.2s ease-in-out;">Return</button>
`;

document.body.appendChild(miniMenu);

const playAgainBtn = document.getElementById('play-again');
const returnBtn = document.getElementById('return');
const finalTimeElem = document.getElementById('final-time');

// Listeners para os botões do mini-menu
playAgainBtn.addEventListener('click', () => {
  miniMenu.style.display = 'none';
  initGame();
});

returnBtn.addEventListener('click', () => {
  const playerName = new URLSearchParams(window.location.search).get('playerName') || 'Jogador Anônimo';
  window.location.href = `/index?playerName=${playerName}`;
});

// Adiciona efeito de hover aos botões
playAgainBtn.addEventListener('mouseover', () => {
  playAgainBtn.style.transform = 'scale(1.1)';
});
playAgainBtn.addEventListener('mouseout', () => {
  playAgainBtn.style.transform = 'scale(1)';
});

returnBtn.addEventListener('mouseover', () => {
  returnBtn.style.transform = 'scale(1.1)';
});
returnBtn.addEventListener('mouseout', () => {
  returnBtn.style.transform = 'scale(1)';
});

/**
 * Inicializa o jogo
 */
function initGame() {
  score = 0;
  timeLeft = 0;
  current = 0;
  savedNumber = 1;
  goal = getRandomInt(1, 100);
  updateUI();

  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationId);

  timerInterval = setInterval(() => {
    timeLeft += 0.1;
    timeLeft = Math.round(timeLeft * 100) / 100;
    timeLeftElem.textContent = timeLeft;
    if (score >= 1000) {
      gameOver();
    }
  }, 100);

  spawnInterval = setInterval(spawnCircle, 1000); // Starts ball spawning again

  animationId = requestAnimationFrame(updateCircles);
}

/**
 * Atualiza a UI
 */
function updateUI() {
  currentElem.textContent = current;
  goalElem.textContent = goal;
  scoreElem.textContent = score;
  timeLeftElem.textContent = timeLeft;
  savedNumberElem.textContent = savedNumber; // Atualiza o número salvo na UI
}

/**
 * Terminar jogo
 */
function gameOver() {
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationId);

  circles.forEach((c) => {
    if (c.element.parentNode) {
      c.element.remove();
    }
  });
  circles = [];

  const playerName = new URLSearchParams(window.location.search).get('playerName') || 'Jogador Anônimo';

  // Envia os dados de pontuação
  fetch('/save-score-grandPrix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, timeLeft }),
  })
    .then((response) => {
      if (response.ok) {
        // Exibe o mini-menu com o tempo final
        finalTimeElem.textContent = timeLeft;
        miniMenu.style.display = 'block';
      } else {
        console.error('Resposta do servidor:', response.status, response.statusText);
        throw new Error('Erro ao salvar pontuação.');
      }
    })
    .catch((error) => {
      console.error('Erro ao salvar pontuação:', error);
      alert('Erro ao salvar pontuação. Retornando ao login.');
      window.location.href = '/login';
    });
}

/**
 * Retorna um inteiro aleatório entre min e max (inclusivo)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera uma nova bolinha no centro do container e define movimento aleatório
 */
function spawnCircle() {
  // Cria elemento
  const circleElem = document.createElement('div');
  circleElem.classList.add('floating-circle');

  // Escolhe aleatoriamente o tipo de operação
  const operationType = getRandomInt(1, 5);
  let value;

  switch (operationType) {
    case 1:
      circleElem.classList.add('circle-azul');
      value = getRandomInt(-1, 100);
      circleElem.dataset.operation = 'sum';
      break;
    case 2:
      circleElem.classList.add('circle-vermelho');
      value = getRandomInt(-1, 100);
      circleElem.dataset.operation = 'sub';
      break;
    case 3:
      circleElem.classList.add('circle-amarelo');
      value = getRandomInt(-1, 10);
      circleElem.dataset.operation = 'mul';
      if (value == 0) {
        value = getRandomInt(1, 10);
      }
      break;
    case 4:
      circleElem.classList.add('circle-roxo');
      value = getRandomInt(-1, 10);
      if (value == 0) {
        value = getRandomInt(1, 10);
      }
      circleElem.dataset.operation = 'div';
      break;
    case 5:
      circleElem.classList.add('circle-verde');
      value = 1;
      circleElem.dataset.operation = 'round';
      break;
  }

  circleElem.dataset.value = value;
  circleElem.textContent = value;

  // Posição inicial no centro do container
  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  circleElem.style.left = `${centerX - 25}px`;
  circleElem.style.top = `${centerY - 25}px`;

  // Direção e velocidade aleatórias
  const angle = Math.random() * 2 * Math.PI;
  const speed = Math.random() * 0.5 + 0.2;

  // Evento de clique para aplicar operação
  circleElem.addEventListener('click', () => {
    applyOperation(circleElem.dataset.operation, parseInt(circleElem.dataset.value));
    circleElem.remove();
    circles = circles.filter((c) => c.element !== circleElem);
  });

  // Evento para "roubar" o número com o botão do meio
  circleElem.addEventListener('mousedown', (event) => {
    if (event.button === 1) {
      stealNumber(circleElem);
      event.preventDefault(); // Evita comportamento padrão do mouse
    }
  });

  container.appendChild(circleElem);

  circles.push({
    element: circleElem,
    x: centerX - 25,
    y: centerY - 25,
    angle,
    speed,
  });
}

/**
 * "Roubando" o número da bolinha
 */
function stealNumber(circleElem) {
  const value = parseInt(circleElem.dataset.value);

  circleElem.textContent = savedNumber;
  circleElem.dataset.value = savedNumber;
  // Atualiza o número salvo
  savedNumber = value;

  updateUI();
}

/**
 * Aplica a operação ao current
 */
function applyOperation(operation, value) {
  score++;

  switch (operation) {
    case 'sum':
      current += value;
      break;
    case 'sub':
      current -= value;
      break;
    case 'mul':
      current *= value;
      break;
    case 'div':
      current = Math.round(current / value);
      break;
    case 'round':
      current = Math.round(current) + 1;
      break;
  }

  checkGoal();
  updateUI();
}

/**
 * Verifica se current atingiu goal
 */
function checkGoal() {
  if (current === goal) {
    score += 100; // Ganha 100 pontos
    current = 0; // Reseta current
    goal = getRandomInt(-100, 100); // Novo objetivo
    if (goal === 0) {
      goal = getRandomInt(1, 100); // Novo objetivo
    }
    updateSpawnRate();
  }
}

/**
 * Atualiza a taxa de geração de bolinhas com base na pontuação
 */
function updateSpawnRate() {
  clearInterval(spawnInterval); // Limpa o intervalo atual

  let spawnRate;
  if (score >= 500) {
    spawnRate = 300; // Taxa mais rápida para pontuação >= 500
  } else if (score >= 300) {
    spawnRate = 500; // Taxa média para pontuação >= 300
  } else if (score >= 100) {
    spawnRate = 700; // Taxa rápida para pontuação >= 100
  } else {
    spawnRate = 1000; // Taxa padrão
  }

  spawnInterval = setInterval(spawnCircle, spawnRate);
}

/**
 * Atualiza posição das bolinhas a cada frame
 */
function updateCircles() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    c.x += c.speed * Math.cos(c.angle);
    c.y += c.speed * Math.sin(c.angle);

    c.element.style.left = c.x + 'px';
    c.element.style.top = c.y + 'px';

    // Remove bolinhas que saem do container
    if (
      c.x < -50 ||
      c.x > containerWidth ||
      c.y < -50 ||
      c.y > containerHeight
    ) {
      if (c.element.parentNode) {
        c.element.remove();
      }
      circles.splice(i, 1);
      i--;
    }
  }

  animationId = requestAnimationFrame(updateCircles);
}

// Inicia o jogo quando a página carrega
window.addEventListener('load', () => {
  initGame();
});
