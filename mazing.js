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

  this.mazeMessage = document.createElement("div");
  this.mazeMessage.id = "maze_message";

  this.heroScore = this.mazeContainer.getAttribute("data-steps") - 2;

  this.maze = [];
  this.heroPos = {};
  this.heroHasKey = false;
  this.childMode = false;

  this.utter = null;

  for(i=0; i < this.mazeContainer.children.length; i++) {
    for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
      var el =  this.mazeContainer.children[i].children[j];
      this.maze[new Position(i, j)] = el;
      if(el.classList.contains("entrance")) {
        /* place hero on entrance square */
        this.heroPos = new Position(i, j);
        this.maze[this.heroPos].classList.add("hero");
      }
    }
  }

  var mazeOutputDiv = document.createElement("div");
  mazeOutputDiv.id = "maze_output";

  mazeOutputDiv.appendChild(this.mazeScore);
  mazeOutputDiv.appendChild(this.mazeMessage);

  mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
  

  this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);

  /* activate control keys */

  this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
  document.addEventListener("keydown", this.keyPressHandler, false);
};

Mazing.prototype.enableSpeech = function() {
  this.utter = new SpeechSynthesisUtterance()
  this.setMessage(this.mazeMessage.innerText);
};

Mazing.prototype.setMessage = function(text) {

  /* display message on screen */
  this.mazeMessage.innerHTML = text;
  this.mazeScore.innerHTML = this.heroScore;

  if(this.utter && text.match(/^\w/)) {
    /* speak message aloud */
    this.utter.text = text;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utter);
  }

};

Mazing.prototype.heroTakeTreasure = function() {
  this.maze[this.heroPos].classList.remove("nubbin");
  this.heroScore += 10;
  this.setMessage("yay, treasure!");
};

Mazing.prototype.heroTakeKey = function() {
  this.maze[this.heroPos].classList.remove("key");
  this.heroHasKey = true;
  this.heroScore += 20;
  this.mazeScore.classList.add("has-key");
  this.setMessage("you now have the key!");
};

Mazing.prototype.gameOver = function(text) {
  /* de-activate control keys */
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.setMessage(text);
  this.mazeContainer.classList.add("finished");
};

Mazing.prototype.heroWins = function() {
  this.mazeScore.classList.remove("has-key");
  this.maze[this.heroPos].classList.remove("door");
  this.heroScore += 50;
  this.gameOver("you finished !!!");
};

Mazing.prototype.tryMoveHero = function(pos) {

  if("object" !== typeof this.maze[pos]) {
    return;
  }

  var nextStep = this.maze[pos].className;

  /* before moving */

  if(nextStep.match(/sentinel/)) {
    /* ran into a moster - lose points */
    this.heroScore = Math.max(this.heroScore - 5, 0);

    if(!this.childMode && (this.heroScore <= 0)) {
      /* game over */
      this.gameOver("sorry, you didn't make it.");
    } else {
      this.setMessage("ow, that hurt!");
    }

    return;
  }

  if(nextStep.match(/wall/)) {
    return;
  }

  if(nextStep.match(/exit/)) {
      this.heroWins();
  }

  /* move hero one step */

  this.maze[this.heroPos].classList.remove("hero");
  this.maze[pos].classList.add("hero");
  this.heroPos = pos;

  /* check what was stepped on */

  if(nextStep.match(/nubbin/)) {
    this.heroTakeTreasure();
    return;
  }

  if(nextStep.match(/key/)) {
    this.heroTakeKey();
    return;
  }

  if(nextStep.match(/exit/)) {
    return;
  }

  if((this.heroScore >= 1) && !this.childMode) {

    this.heroScore--;

    if(this.heroScore <= 0) {
      /* game over */
      this.gameOver("sorry, you didn't make it");
      return;
    }

  }

  this.setMessage("...");

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

Mazing.prototype.setChildMode = function() {
  this.childMode = true;
  this.heroScore = 0;
  this.setMessage("collect all the treasure");
};