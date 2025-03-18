// ゲーム状態
let gameState = {
  round: 1,
  players: [
    { name: "あなた", money: 100, eliminated: false },
    { name: "CPU1", money: 100, eliminated: false },
    { name: "CPU2", money: 100, eliminated: false }
  ],
};
// ゲームデータ
const actions = [
  {"name": "蕎麦屋で食事", "min_cost": 10, "max_cost": 15, "pic_pass": "./images/soba.png", "log-text": "蕎麦を食べた"},
  {"name": "茶屋で一服", "min_cost": 8, "max_cost": 12, "pic_pass": "./images/chaya.png", "log-text": "茶屋で休憩した"},
  {"name": "博打に興じる", "min_cost": 5, "max_cost": 25, "pic_pass": "./images/saikoro.png", "log-text": "博打にチャレンジ！"},
  {"name": "歌舞伎鑑賞", "min_cost": 15, "max_cost": 20, "pic_pass": "./images/kabuki.png", "log-text": "歌舞伎を鑑賞した"},
  {"name": "町で買い物", "min_cost": 10, "max_cost": 25, "pic_pass": "./images/city.png", "log-text": "街をぶらついた"},
  {"name": "何もしない", "min_cost": 0, "max_cost": 0, "pic_pass": "./images/none.png", "log-text": "何もしなかった"}
];
// DOM要素の参照を取得
const actionButtons = document.querySelectorAll('.action-btn');
const playerMoneyDisplay = document.getElementById('playerMoney');
const cpu1MoneyDisplay = document.getElementById('cpu1Money');
const cpu2MoneyDisplay = document.getElementById('cpu2Money');
const roundCounter = document.getElementById('top-roundcounter');
const modalEffect = document.getElementById('modal-effect');
const effectPic = document.getElementById('effect-pic');
const playerLogText = document.getElementById('player-log-text');
const cpu1LogText = document.getElementById('cpu1-log-text');
const cpu2LogText = document.getElementById('cpu2-log-text');

// 各アクションボタンにクリックイベントリスナーを追加
actionButtons.forEach((button, index) => {
  button.addEventListener('click', () => handlePlayerAction(index));
});

// プレイヤーのアクション処理関数
function handlePlayerAction(actionIndex) {
  const playerAction = actions[actionIndex];
  
  // 1. プレイヤーの支出額を計算（min_costからmax_costの間のランダムな整数）
  const playerCost = calculateRandomCost(playerAction.min_cost, playerAction.max_cost);
  
  // 2. CPUの選択処理
  const cpu1Choice = chooseCPUAction(1);
  const cpu2Choice = chooseCPUAction(2);
  
  // CPU選択アクションの参照を取得
  const cpu1Action = actions[cpu1Choice];
  const cpu2Action = actions[cpu2Choice];
  
  // 3. CPUの支出額を計算
  const cpu1Cost = calculateRandomCost(cpu1Action.min_cost, cpu1Action.max_cost);
  const cpu2Cost = calculateRandomCost(cpu2Action.min_cost, cpu2Action.max_cost);
  
  // 4. 支払い可能かチェックして資金を更新
  const playerCanPay = gameState.players[0].money >= playerCost;
  const cpu1CanPay = gameState.players[1].money >= cpu1Cost;
  const cpu2CanPay = gameState.players[2].money >= cpu2Cost;
  
  // 資金を更新
  if (playerCanPay) {
    gameState.players[0].money -= playerCost;
  } else {
    gameOver(0, playerCost);
    return;
  }
  
  if (cpu1CanPay) {
    gameState.players[1].money -= cpu1Cost;
  } else {
    gameOver(1, cpu1Cost);
    return;
  }
  
  if (cpu2CanPay) {
    gameState.players[2].money -= cpu2Cost;
  } else {
    gameOver(2, cpu2Cost);
    return;
  }
  
  // 画面の残金表示を更新
  updateMoneyDisplay();
  
  // 5. エフェクトモーダルを表示
  modalEffect.style.display = 'block';
  effectPic.innerHTML = `<img src="${playerAction.pic_pass}" class="fade-in" alt="${playerAction.name}">`;
  
  // 6. 0.5秒後にログテキストを表示
  setTimeout(() => {
    playerLogText.textContent = `あなた: ${playerAction.log_text} (-${playerCost}銭) 残り: ${gameState.players[0].money}銭`;
    cpu1LogText.textContent = `CPU1: ${cpu1Action.log_text} (-${cpu1Cost}銭) 残り: ${gameState.players[1].money}銭`;
    cpu2LogText.textContent = `CPU2: ${cpu2Action.log_text} (-${cpu2Cost}銭) 残り: ${gameState.players[2].money}銭`;
  }, 500);
  
  // 7. モーダルクリックイベントリスナーを追加
  const handleModalClick = () => {
    modalEffect.style.display = 'none';
    effectPic.innerHTML = '';
    playerLogText.textContent = '';
    cpu1LogText.textContent = '';
    cpu2LogText.textContent = '';
    
    // ラウンドを進める
    gameState.round++;
    
    // ラウンド表示を更新
    if (gameState.round <= 6) {
      roundCounter.textContent = `${gameState.round}/6 ラウンド`;
    } else {
      finishGame();
    }
    
    // クリックイベントリスナーを削除
    modalEffect.removeEventListener('click', handleModalClick);
  };
  
  modalEffect.addEventListener('click', handleModalClick);
}

// min_costからmax_costまでのランダムな整数を生成する関数
function calculateRandomCost(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// CPUの行動選択関数
function chooseCPUAction(cpuIndex) {
  const cpu = gameState.players[cpuIndex];
  
  // 支払い可能なアクションの配列を作成
  const availableActions = [];
  for (let i = 0; i < actions.length; i++) {
    if (actions[i].max_cost <= cpu.money) {
      availableActions.push(i);
    }
  }
  
  // 適切な選択肢がある場合はランダムに選択
  if (availableActions.length > 0) {
    return availableActions[Math.floor(Math.random() * availableActions.length)];
  }
  
  // 残金が最も多いか判断
  const hasMostMoney = gameState.players.every((player, index) => 
    index === cpuIndex || player.eliminated || player.money <= cpu.money
  );
  
  // 残金最多なら「茶屋で一服」、そうでなければ「何もしない」を選択
  // インデックスを確実に返す
  const teaHouseIndex = actions.findIndex(action => action.name === "茶屋で一服");
  const doNothingIndex = actions.findIndex(action => action.name === "何もしない");
  
  if (hasMostMoney && actions[teaHouseIndex].max_cost <= cpu.money) {
    return teaHouseIndex;
  } else {
    return doNothingIndex; // 「何もしない」は常に選択可能（コスト0）
  }
}

// 画面の残金表示を更新する関数
function updateMoneyDisplay() {
  playerMoneyDisplay.textContent = gameState.players[0].money;
  cpu1MoneyDisplay.textContent = gameState.players[1].money;
  cpu2MoneyDisplay.textContent = gameState.players[2].money;
}

// ゲームオーバー処理関数
function gameOver(loserIndex, attemptedCost) {
  let message = '';
  if (loserIndex === 0) {
    message = `あなたは${attemptedCost}銭支払おうとしましたが、残金${gameState.players[0].money}銭では足りませんでした。Fakeな江戸っ子ですね...`;
  } else {
    message = `${gameState.players[loserIndex].name}は${attemptedCost}銭支払おうとしましたが、残金${gameState.players[loserIndex].money}銭では足りませんでした。`;
  }
  
  // プレイヤーを脱落状態にする
  gameState.players[loserIndex].eliminated = true;
  
  alert(message);
  
  // 最終スコアを表示
  const finalScores = gameState.players.map(player => `${player.name}: ${player.money}銭`).join('\n');
  alert(`ゲーム終了！\n最終スコア:\n${finalScores}`);
  
  // ゲームをリセット
  resetGame();
}

// ゲーム終了処理関数
function finishGame() {
  // 最も残金が少ない人を特定
  let minMoney = Infinity;
  let winnerIndex = -1;
  
  gameState.players.forEach((player, index) => {
    if (!player.eliminated && player.money < minMoney) {
      minMoney = player.money;
      winnerIndex = index;
    }
  });
  
  let message = '';
  if (winnerIndex === 0) {
    message = `おめでとう！あなたは残金${minMoney}銭で真の江戸っ子の称号を獲得しました！`;
  } else {
    message = `${gameState.players[winnerIndex].name}が残金${minMoney}銭で真の江戸っ子の称号を獲得しました！`;
  }
  
  alert(message);
  
  // 最終スコアを表示
  const finalScores = gameState.players.map(player => `${player.name}: ${player.money}銭`).join('\n');
  alert(`ゲーム終了！\n最終スコア:\n${finalScores}`);
  
  // ゲームをリセット
  resetGame();
}

// ゲームをリセットする関数
function resetGame() {
  gameState = {
    round: 1,
    players: [
      { name: "あなた", money: 100, eliminated: false },
      { name: "CPU1", money: 100, eliminated: false },
      { name: "CPU2", money: 100, eliminated: false }
    ],
  };
  
  // 画面表示を更新
  updateMoneyDisplay();
  roundCounter.textContent = "1/6 ラウンド";
}