
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const wavesEL = document.getElementById("wave");

const KEYS = {};

const personagem = new Image();
personagem.src = "https://i.pinimg.com/736x/72/6a/7e/726a7e4a8684c0b0ed5fcbb0c7677530.jpg";

const jogador = {
    x: 208,
    y: 545,
    width: 64,
    height: 80,
    speed: 300
};

let tiros = [];
let blocos = [];

let score = 0;
let lives = 3;
let wave = 1;

let pausado = false;
let gameOver = false;

let ultimoTiro = 0;
let ultimoBloco = 0;
let tempoAnterior = 0;

const cores = [
    "#F5A6C5",
    "#F0EB67",
    "#9BEBD9",
    "#D89BEB",
    "#C1FF63"
];

function atualizarHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    wavesEL.textContent = wave;
}

document.addEventListener("keydown", (e) => {
    const tecla = e.key.toLowerCase();

    KEYS[tecla] = true;

    if (e.code === "Space") {
        KEYS.space = true;
        e.preventDefault();
    }

    if (["arrowleft", "arrowright"].includes(tecla)) {
        e.preventDefault();
    }

    if (tecla === "p" && !gameOver) {
        pausado = !pausado;
    }

    if (tecla === "enter" && gameOver) {
        reiniciar();
    }
});

document.addEventListener("keyup", (e) => {
    KEYS[e.key.toLowerCase()] = false;

    if (e.code === "Space") {
        KEYS.space = false;
    }
});

function desenharFundo() {
    ctx.fillStyle = "#25243b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < 30; i++) {
        const x = (i * 97) % canvas.width;
        const y = (i * 137) % canvas.height;

        ctx.fillRect(x, y, 2, 2);
    }
}

function desenharPersonagem() {
    if (personagem.complete && personagem.naturalWidth > 0) {
        ctx.drawImage(
            personagem,
            jogador.x,
            jogador.y,
            jogador.width,
            jogador.height
        );
    } else {
        ctx.fillStyle = "#F5A6C5";
        ctx.fillRect(
            jogador.x,
            jogador.y,
            jogador.width,
            jogador.height
        );
    }
}

function movimentarJogador(delta) {
    if (KEYS["arrowleft"] || KEYS["a"]) {
        jogador.x -= jogador.speed * delta;
    }

    if (KEYS["arrowright"] || KEYS["d"]) {
        jogador.x += jogador.speed * delta;
    }

    jogador.x = Math.max(
        0,
        Math.min(canvas.width - jogador.width, jogador.x)
    );
}

function atirar(tempo) {
    if (KEYS.space && tempo - ultimoTiro > 300) {
        tiros.push({
            x: jogador.x + jogador.width / 2 - 3,
            y: jogador.y,
            width: 6,
            height: 16,
            speed: 500
        });

        ultimoTiro = tempo;
    }
}

function criarBlocos(tempo) {
    const intervalo = Math.max(350, 1300 - wave * 100);

    if (tempo - ultimoBloco > intervalo) {
        const tamanho = 30 + Math.random() * 20;

        blocos.push({
            x: Math.random() * (canvas.width - tamanho),
            y: -tamanho,
            width: tamanho,
            height: tamanho,
            speed: 90 + wave * 15,
            color: cores[Math.floor(Math.random() * cores.length)]
        });

        ultimoBloco = tempo;
    }
}

function desenharTiros(delta) {
    ctx.fillStyle = "#FFF06B";

    for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];

        tiro.y -= tiro.speed * delta;

        ctx.fillRect(
            tiro.x,
            tiro.y,
            tiro.width,
            tiro.height
        );

        if (tiro.y + tiro.height < 0) {
            tiros.splice(i, 1);
        }
    }
}

function desenharBlocos(delta) {
    for (let i = blocos.length - 1; i >= 0; i--) {
        const bloco = blocos[i];

        bloco.y += bloco.speed * delta;

        ctx.fillStyle = bloco.color;
        ctx.fillRect(
            bloco.x,
            bloco.y,
            bloco.width,
            bloco.height
        );

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            bloco.x,
            bloco.y,
            bloco.width,
            bloco.height
        );

        if (bloco.y >= canvas.height) {
            blocos.splice(i, 1);
            lives--;

            atualizarHUD();

            if (lives <= 0) {
                gameOver = true;
            }
        }
    }
}

function verificarColisoes() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];

        for (let j = blocos.length - 1; j >= 0; j--) {
            const bloco = blocos[j];

            const colidiu =
                tiro.x < bloco.x + bloco.width &&
                tiro.x + tiro.width > bloco.x &&
                tiro.y < bloco.y + bloco.height &&
                tiro.y + tiro.height > bloco.y;

            if (colidiu) {
                tiros.splice(i, 1);
                blocos.splice(j, 1);

                score += 10;

                const novaOnda = Math.floor(score / 100) + 1;

                if (novaOnda > wave) {
                    wave = novaOnda;
                }

                atualizarHUD();
                break;
            }
        }
    }
}

function desenharMensagem(titulo, subtitulo) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    ctx.fillStyle = "#F5A6C5";
    ctx.font = "bold 32px Nunito";
    ctx.fillText(titulo, canvas.width / 2, 280);

    ctx.fillStyle = "#ffffff";
    ctx.font = "17px Nunito";
    ctx.fillText(subtitulo, canvas.width / 2, 325);
}

function reiniciar() {
    jogador.x = 208;

    tiros = [];
    blocos = [];

    score = 0;
    lives = 3;
    wave = 1;

    pausado = false;
    gameOver = false;

    ultimoTiro = 0;
    ultimoBloco = 0;

    atualizarHUD();
}

function jogo(tempo) {
    const delta = Math.min(
        (tempo - tempoAnterior) / 1000,
        0.05
    );

    tempoAnterior = tempo;

    desenharFundo();

    if (gameOver) {
        desenharMensagem(
            "Fim de jogo!",
            "Pressione ENTER para jogar novamente"
        );

        requestAnimationFrame(jogo);
        return;
    }

    if (pausado) {
        desenharMensagem(
            "Pausado",
            "Pressione P para continuar"
        );

        requestAnimationFrame(jogo);
        return;
    }

    movimentarJogador(delta);

    atirar(tempo);
    criarBlocos(tempo);

    desenharTiros(delta);
    desenharBlocos(delta);

    verificarColisoes();

    desenharPersonagem();

    requestAnimationFrame(jogo);
}

atualizarHUD();
requestAnimationFrame(jogo);

