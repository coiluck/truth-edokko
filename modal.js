const modal = document.getElementById("modal-explain");
const modalCover = document.getElementById("modal-explain-cover");
const modalButton = document.getElementById("modal-explain-btn");
const topExplain = document.getElementById("top-explain");

// モーダルを表示
function showModal() {
  modal.classList.remove("fade-out");
  modal.classList.add("fade-in");
  modal.style.display = "block";
  console.log("表示します: 説明");
}

// モーダルを非表示
function hideModal() {
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  console.log("消去します: 説明");

  // アニメーション終了後にdisplayをnoneに設定
  setTimeout(function() { 
    modal.style.display = "none"; 
  }, 500);
}

// イベントリスナーの追加
topExplain.addEventListener('click', showModal);
modalButton.addEventListener('click', hideModal);
modalCover.addEventListener('click', hideModal);
