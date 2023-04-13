var Position = function(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype.toString = function() {
  return this.x + ":" + this.y;
};

var Mazing = function(id) {

  this.mazeContainer = document.getElementById(id);

  this.mazeScore = document.createElement("div");
  this.mazeScore.id = "maze_score";
  
  

  this.maze = [];
  this.heroPos = {};
  this.childMode = false;

  this.utter = null;

  for(i=0; i < this.mazeContainer.children.length; i++) {
    for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
      var el =  this.mazeContainer.children[i].children[j];
      this.maze[new Position(i, j)] = el;
      if(el.classList.contains("entrance")) {
        this.heroPos = new Position(i, j);
        this.maze[this.heroPos].classList.add("hero");
      }
    }
  }

  var mazeOutputDiv = document.createElement("div");
  mazeOutputDiv.id = "maze_output";

  mazeOutputDiv.appendChild(this.mazeScore);

  mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";

  this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);

  this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
  document.addEventListener("keydown", this.keyPressHandler, false);
};

Mazing.prototype.gameOver = function() {
  clearInterval(intervalo)
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.mazeContainer.classList.add("finished");
};

Mazing.prototype.gameWin = function() {
  clearInterval(intervalo)
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.mazeContainer.classList.add("win");
};

Mazing.prototype.heroWins = function() {
  this.maze[this.heroPos].classList.remove("door");
  this.gameWin();
};

Mazing.prototype.tryMoveHero = function(pos) {

  if("object" !== typeof this.maze[pos]) {
    return;
  }

  var nextStep = this.maze[pos].className;



  if(nextStep.match(/sentinel/)) {
    this.gameOver();
    return;
  }

  if(nextStep.match(/wall/)) {
    return;
  }

  if(nextStep.match(/exit/)) {
      this.heroWins();
  }

  this.maze[this.heroPos].classList.remove("hero");
  this.maze[pos].classList.add("hero");
  this.heroPos = pos;


  if(nextStep.match(/nubbin/)) {
    this.gameOver();
    return;
  }

  if(nextStep.match(/key/)) {
    this.gameOver();
    return;
  }

  if(nextStep.match(/exit/)) {
    return;
  }


};

Mazing.prototype.mazeKeyPressHandler = function(e) {

  var tryPos = new Position(this.heroPos.x, this.heroPos.y);

  switch(e.key)
  {
    case "ArrowLeft":
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;

    case "ArrowUp":
      tryPos.x--;
      break;

    case "ArrowRight":
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;

    case "ArrowDown":
      tryPos.x++;
      break;

    default:
      return;

  }

  this.tryMoveHero(tryPos);

  e.preventDefault();
};

