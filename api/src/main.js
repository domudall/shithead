require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const Deck = require("card-deck");
const { pusher } = require("./pusher/client");
const { cards } = require("./game/cards");

const games = {};

app.use(cors());

app.get("/status", (req, res) => {
  const gameID = req.query.gameID;
  if (typeof gameID === "undefined" || gameID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Game ID required"]
    });
  }

  const game = games[gameID];

  if (game.started === false) {
    return res.status(400).json({
      success: false,
      errors: ["Game has not started"]
    });
  }

  res.json(game.state);
});

app.get("/play", (req, res) => {
  const gameID = req.query.gameID;
  if (typeof gameID === "undefined" || gameID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Game ID required"]
    });
  }

  const game = games[gameID];

  if (game.started === false) {
    return res.status(400).json({
      success: false,
      errors: ["Game has not started"]
    });
  }

  const cardID = req.query.cardID;
  if (typeof cardID === "undefined" || cardID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Card ID required"]
    });
  }

  const playerID = req.query.playerID;
  if (typeof playerID === "undefined" || playerID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Player ID required"]
    });
  }

  const currentPlayer = game.state.players[game.state.turn];
  if (currentPlayer.id !== playerID) {
    return res.status(400).json({
      success: false,
      errors: ["It is not your turn!"]
    });
  }

  const selectedCard = currentPlayer.hand[cardID];
  if (typeof selectedCard === "undefined") {
    return res.status(400).json({
      success: false,
      errors: ["Selected card doesn't exist"]
    });
  }

  let response = playCard(game, selectedCard);
  console.log(response);

  pusher.trigger(`game-${gameID}`, "card-played", {
    // playerName: playerName,
    card: "no"
  });

  res.json({ success: true });
});

app.get("/join", (req, res) => {
  const gameID = req.query.gameID;
  if (typeof gameID === "undefined" || gameID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Game ID required"]
    });
  }

  const game = games[gameID];

  const playerName = req.query.playerName;
  if (typeof playerName === "undefined" || playerName === "") {
    return res.status(400).json({
      success: false,
      errors: ["Player name required"]
    });
  }

  if (typeof game === "undefined") {
    return res.status(400).json({
      success: false,
      errors: ["Game does not exist"]
    });
  }

  if (game.started === true) {
    return res.status(400).json({
      success: false,
      errors: ["Game has started"]
    });
  }

  const player = createPlayer(playerName);
  game.players.push(player);
  pusher.trigger(`game-${gameID}`, "player-joined", {
    playerName: playerName,
    message: `${playerName} has joined the game!`
  });

  res.json({ success: true, playerID: player.id });
});

app.get("/start", (req, res) => {
  const gameID = req.query.gameID;
  if (typeof gameID === "undefined" || gameID === "") {
    return res.status(400).json({
      success: false,
      errors: ["Game ID required"]
    });
  }

  const game = games[gameID];
  if (typeof game === "undefined") {
    return res.status(400).json({
      success: false,
      errors: ["Game does not exist"]
    });
  }

  if (game.started === true) {
    return res.status(400).json({
      success: false,
      errors: ["Game has started"]
    });
  }

  if (game.players.length < 2) {
    return res.status(400).json({
      success: false,
      errors: ["Not enough players to start game"]
    });
  }

  pusher.trigger(`game-${gameID}`, "game-start", {});

  setupGame(game);

  res.json({ success: true, gameID: gameID });
});

app.get("/create", (req, res) => {
  const playerName = req.query.playerName;
  if (typeof playerName === "undefined" || playerName === "") {
    return res.status(400).json({
      success: false,
      errors: ["Player name required"]
    });
  }

  const player = createPlayer(playerName);

  const gameID = generateID("G");

  const game = {
    id: gameID,
    mainDeck: new Deck([].concat(cards)).shuffle(),
    burnDeck: new Deck([]),
    pickupDeck: new Deck([]),
    players: [player],
    state: {},
    started: false
  };

  games[gameID] = game;

  res.json({ success: true, gameID: gameID, playerID: player.id });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const generateID = prefix => {
  if (prefix !== "") {
    prefix += "_";
  }

  return (
    prefix +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

const createPlayer = playerName => {
  return {
    playerName: playerName,
    id: generateID("P")
  };
};

const setupGame = game => {
  // State container
  game.state = {
    players: {},
    turn: 0
  };

  // Mix up the play order
  const players = shuffle(game.players);

  // Give everyone 3 hidden cards, 3 top cards, and 3 cards in their hand
  players.forEach((player, index) => {
    let bottom = game.mainDeck.draw(3);
    let top = game.mainDeck.draw(3);
    let hand = game.mainDeck.draw(3);

    game.state.players[index] = {
      id: player.id,
      bottom: bottom,
      top: top,
      hand: hand
    };
  });

  game.pickupDeck.addToTop(game.mainDeck.draw());
  game.started = true;
};

const shuffle = array => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const playCard = (game, card) => {
  const topCard = game.pickupDeck.top();
  console.log("top card", topCard);
  console.log("played card", card);

  switch (card.value) {
    // Regular cards
    case (3, 4, 5, 6):
      if (topCard.value <= card.value || topCard.value === 7) {
        game.pickupDeck.addToTop(card);
        return { valid: true, anotherGo: false };
      }
    case (9, 11, 12, 13, 14):
      if (topCard.value <= card.value && topCard.value !== 7) {
        game.pickupDeck.addToTop(card);
        return { valid: true, anotherGo: false };
      }

    // Magic cards
    case 2:
      game.pickupDeck.addToTop(card);
      return { valid: true, anotherGo: false };
    case 7:
      if (topCard.value <= card.value) {
        game.pickupDeck.addToTop(card);
        return { valid: true, anotherGo: false };
      }
    case 8:
      card.value = topCard.value;
      game.pickupDeck.addToTop(card);
      return { valid: true, anotherGo: false };
    case 10:
      game.pickupDeck = new Deck();
      return { valid: true, anotherGo: true };
    default:
      return { valid: false, anotherGo: false };
  }
};
