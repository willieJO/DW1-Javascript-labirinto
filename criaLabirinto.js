class MazeBuilder {

  constructor(width, height) {

    this.width = width;
    this.height = height;
  
    this.cols = 2 * this.width + 1;
    this.rows = 2 * this.height + 1;
  
    this.maze = this.initArray([]);
  
    $.each(this.maze, (r, row) => {
      $.each(row, (c, cell) => {
        switch(r)
        {
          case 0:
          case this.rows - 1:
            this.maze[r][c] = ["wall"];
            break;
  
          default:
            if((r % 2) == 1) {
              if((c == 0) || (c == this.cols - 1)) {
                this.maze[r][c] = ["wall"];
              }
            } else if(c % 2 == 0) {
              this.maze[r][c] = ["wall"];
            }
  
        }
      });
  
      if(r == 0) {
        let doorPos = this.posToSpace(this.rand(1, this.width));
        this.maze[r][doorPos] = ["door", "exit"];
      }
  
      if(r == this.rows - 1) {
        let doorPos = this.posToSpace(this.rand(1, this.width));
        this.maze[r][doorPos] = ["door", "entrance"];
      }
  
    });
  
    this.partition(1, this.height - 1, 1, this.width - 1);
  
  }

  initArray(value) {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(value));
  }

  rand(min, max) {
    return min + Math.floor(Math.random() * (1 + max - min));
  }

  rand(min, max) {
    return min + Math.floor(Math.random() * (1 + max - min));
  }
  
  posToSpace(x) {
    return 2 * (x-1) + 1;
  }
  
  posToWall(x) {
    return 2 * x;
  }
  
  inBounds(r, c) {
    if((typeof this.maze[r] === "undefined") || (typeof this.maze[r][c] === "undefined")) {
      return false; 
    }
    return true;
  }
  
  shuffle(array) {
    return $.map(array, (value, index) => {
      const j = Math.floor(Math.random() * (index + 1));
      [array[index], array[j]] = [array[j], array[index]];
      return array[index];
    });
  }

  partition(r1, r2, c1, c2) {
    
    let horiz, vert, x, y, start, end;

    if((r2 < r1) || (c2 < c1)) {
      return false;
    }

    if(r1 == r2) {
      horiz = r1;
    } else {
      x = r1+1;
      y = r2-1;
      start = Math.round(x + (y-x) / 4);
      end = Math.round(x + 3*(y-x) / 4);
      horiz = this.rand(start, end);
    }

    if(c1 == c2) {
      vert = c1;
    } else {
      x = c1 + 1;
      y = c2 - 1;
      start = Math.round(x + (y - x) / 3);
      end = Math.round(x + 2 * (y - x) / 3);
      vert = this.rand(start, end);
    }

    for(let i = this.posToWall(r1)-1; i <= this.posToWall(r2)+1; i++) {
      for(let j = this.posToWall(c1)-1; j <= this.posToWall(c2)+1; j++) {
        if((i == this.posToWall(horiz)) || (j == this.posToWall(vert))) {
          this.maze[i][j] = ["wall"];
        }
      }
    }

    let gaps = this.shuffle([true, true, true, false]);

    if(gaps[0]) {
      let gapPosition = this.rand(c1, vert);
      this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
    }

    if(gaps[1]) {
      let gapPosition = this.rand(vert+1, c2+1);
      this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
    }

    if(gaps[2]) {
      let gapPosition = this.rand(r1, horiz);
      this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
    }

    if(gaps[3]) {
      let gapPosition = this.rand(horiz+1, r2+1);
      this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
    }


    this.partition(r1, horiz-1, c1, vert-1);
    this.partition(horiz+1, r2, c1, vert-1);
    this.partition(r1, horiz-1, vert+1, c2);
    this.partition(horiz+1, r2, vert+1, c2);

  }

  isGap(...cells) {
    let allGaps = true;
    $.each(cells, (index, cell) => {
      let [row, col] = cell;
      if(this.maze[row][col].length > 0) {
        if(!this.maze[row][col].includes("door")) {
          allGaps = false;
          return false; 
        }
      }
    });
    return allGaps;
  }

  countSteps(array, r, c, val, stop) {

    if(!this.inBounds(r, c)) {
      return false; 
    }

    if(array[r][c] <= val) {
      return false; 
    }

    if(!this.isGap([r, c])) {
      return false; 
    }

    array[r][c] = val;

    if(this.maze[r][c].includes(stop)) {
      return true; 
    }

    this.countSteps(array, r-1, c, val+1, stop);
    this.countSteps(array, r, c+1, val+1, stop);
    this.countSteps(array, r+1, c, val+1, stop);
    this.countSteps(array, r, c-1, val+1, stop);

  }

  display(id) {
    this.parentDiv = $("#" + id);
  
    if(!this.parentDiv.length) {
      alert("Cannot initialise maze - no element found with id \"" + id + "\"");
      return false;
    }
  
    this.parentDiv.empty();
  
    const container = $("<div/>", {
      id: "maze",
      "data-steps": this.totalSteps
    });
  
    $.each(this.maze, (i, row) => {
      let rowDiv = $("<div/>");
      $.each(row, (j, cell) => {
        let cellDiv = $("<div/>");
        if(cell) {
          cellDiv.addClass(cell.join(" "));
        }
        rowDiv.append(cellDiv);
      });
      container.append(rowDiv);
    });
  
    this.parentDiv.append(container);
  
    return true;
  }

}