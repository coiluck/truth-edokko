const modal = document.getElementById("modal-explain")

document.getElementById("top-explain").addEventListener('click', function() {
  modal.style.display = "block";
  console.log("表示します: 説明");
});
document.getElementById("modal-explain-btn").addEventListener('click', function() {
  modal.style.display = "none";
  console.log("消去します: 説明");
});