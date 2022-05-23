/*
  A Cell Class that Represents a grid in the maze
  The Maze is Represented Using a 2D Array of Cells
*/

class Cell {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.visited = false;
    this.searched = false;
    this.previous = null;
  }
}

/* Define Maze Properties */

let maze;
let height;
let width;
let cell_size;
let path_found;

/* Variables Storing Inputs From the User */

let input_height;
let input_width;
let text_height;
let text_width;
let button_generate;

let pathfind_menu;
let button_pathfind;

/* Starting Point and Ending Point in the Maze */

let start_x;
let start_y;
let end_x;
let end_y;

/* Colors */

let blue;
let red;
let pink;

function setup() {
  height = 20;
  width = 20;
  start_x = 0;
  start_y = height - 1;
  end_x = 10;
  end_y = 10;
  
  cell_size = 20;
  
  path_found = false;
  
  blue = color('blue');
  red = color('rgb(255,0,0)');
  pink = color('rgb(255,192,203)');
    
  input_text();
  create_maze();
  
  createCanvas(width * cell_size, height * cell_size);
}

function draw() {
  background(255);
  draw_maze();
  
  if (path_found) {
    draw_path();
  }
}

/*
  This function draw text boxes, buttons, etc. that accept user inputs.
*/

function input_text() {
  input_width = createInput();
  input_width.position(width * cell_size + cell_size, 65);
  
  text_width = createElement('h3', 'Enter Width');
  text_width.position(width * cell_size + cell_size, 28);
  
  text_height = createElement('h3', 'Enter Height');
  text_height.position(width * cell_size + cell_size, 80);
  
  input_height = createInput();
  input_height.position(width * cell_size + cell_size, 117);
  
  button_generate = createButton('Generate Maze');
  button_generate.position(width * cell_size + cell_size, 145);
  button_generate.mousePressed(resize_maze);
  
  pathfind_menu = createSelect();
  pathfind_menu.position(width * cell_size + cell_size, 190);
  pathfind_menu.option('Breadth-First Search');
  pathfind_menu.option('Depth-First Search');
  
  button_pathfind = createButton('Find Path!');
  button_pathfind.position(width * cell_size + cell_size, 215);
  button_pathfind.mousePressed(find_path);
}

function find_path() {
  clear_search_history();
  if (pathfind_menu.value() == 'Breadth-First Search') {
    find_path_bfs();
  } else if (pathfind_menu.value() == 'Depth-First Search') {
    find_path_dfs();
  }
  path_found = true;
}

/* 
  Resize the Maze
*/

function resize_maze() {
  height = input_height.value();
  width = input_width.value();
  print(height + " : " + width);
  
  if (height == "" || width == "") {
    height = 15;
    width = 15;
  }
  
  text_width.position(width * cell_size + cell_size, 28);
  text_height.position(width * cell_size + cell_size, 80);
  input_width.position(width * cell_size + cell_size, 65);
  input_height.position(width * cell_size + cell_size, 117);
  button_generate.position(width * cell_size + cell_size, 145);
  start_x = 0;
  start_y = 0;
  end_x = width - 1;
  end_y = height - 1;
  
  create_maze();
  
  resizeCanvas(width * cell_size, height * cell_size);
}


/*
  Draw the Maze based on the 2D array representation.
*/

function draw_maze() {
  line(0, 0, width * cell_size, 0);
  line(0, 0, 0, height * cell_size);
  
  noStroke();
  fill(0, 0, 255, 100);
  rect(start_x * cell_size, start_y * cell_size, cell_size, cell_size);
  
  fill(255, 0, 0, 100);
  rect(end_x * cell_size, end_y * cell_size, cell_size, cell_size);
  stroke(0, 0, 0);
  
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      if (maze[i][j].searched) {
        if (!(i == start_x && j == start_y) && !(i == end_x && j == end_y)) {
          noStroke();
          fill(255, 192, 103, 100);
          rect(i * cell_size, j * cell_size, cell_size, cell_size)
          stroke(0, 0, 0);
        }
        
      }
      
      if (maze[i][j].right == false) {
        line((i + 1) * cell_size, j * cell_size, (i + 1) * cell_size, j * cell_size + cell_size)
      }

      if (maze[i][j].down == false) {
        line(i * cell_size, (j + 1) * cell_size, i * cell_size + cell_size, (j + 1) * cell_size);
      }
    }
  }
}

/*
  This function creates a random maze using randomized DFS algorithm.
*/

function create_maze() {
  maze = new Array(width);
  for (var i = 0; i < width; i++) {
    maze[i] = new Array(height);
  }

  for (i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      maze[i][j] = new Cell(i, j);
    }
  }
  
  stack = [];
  start = maze[0][0];
  stack.push(start);
  
  while (stack.length > 0) {
    
    current = stack.pop();
    current.visited = true;
    //print("Current: " + current.x + " " + current.y);
    
    next = find_next(current);
    
    if (next != null) {
      stack.push(current);
      //print("Next: " + next.x + " " + next.y + "\n");
    
      if (current.x == next.x) {
        if (next.y < current.y) {
          next.down = true;
          current.up = true;
        } else {
          next.up = true;
          current.down = true;
        }
      } else {
        if (next.x < current.x) {
          current.left = true;
          next.right = true;
        } else {
          current.right = true;
          next.left = true;
        }
      }
      stack.push(next); 
    }   
  }
}

/*
  A helper function that returns a random unvisited neighbor of the given cell. 
  Returns null if no such neighbor exists.
*/

function find_next(cell) {
  options = [];
  
  dx = [0, 0, 1, -1];
  dy = [1, -1, 0, 0];
  
  for (var i = 0; i < dx.length; i++) {
    x = cell.x + dx[i];
    y = cell.y + dy[i];
    
    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }
    
    if (!maze[x][y].visited) {
      options.push(maze[x][y]);
      //print("Unvisited: " + x + " " + y);
    }
  }
  
  if (options.length == 0) {
    return null;
  }

  
  index = Math.floor(Math.random() * options.length)
  //print("Choose: " + options[index].x + " " + options[index].y);
  return options[index];
}

/*
  This function finds a path between the starting and ending point using DFS
*/

function find_path_dfs() {
  stack = [];
  start = maze[start_x][start_y];
  stack.push(start);
  
  while (stack.length > 0) {
    current = stack.pop();
    current.searched = true;
    
    //print(current.x + " " + current.y);
    if (current.x == end_x && current.y == end_y) {
      break;
    }
    
    dx = [0, 0, 1, -1];
    dy = [1, -1, 0, 0];
  
    for (var i = 0; i < dx.length; i++) {
      x = current.x + dx[i];
      y = current.y + dy[i];

      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      if (x == current.x) {
        if (y < current.y) {
          if (!current.up) {
            continue;
          }
        } else {
          if (!current.down) {
            continue;
          }
        }
      } else {
        if (x < current.x) {
          if (!current.left) {
            continue
          } 
        } else {
          if (!current.right) {
            continue;
          }
        }
      }
        
      if (!maze[x][y].searched) {
        maze[x][y].searched = true;
        maze[x][y].previous = current;
        stack.push(maze[x][y]);
      }
    } 
  } 
}
  
function find_path_bfs() {
  queue = [];
  start = maze[start_x][start_y];
  queue.push(start);
  
  while (queue.length > 0) {
    current = queue.shift();
    current.searched = true;
    
    //print(current.x + " " + current.y);
    if (current.x == end_x && current.y == end_y) {
      break;
    }
    
    dx = [0, 0, 1, -1];
    dy = [1, -1, 0, 0];
  
    for (var i = 0; i < dx.length; i++) {
      x = current.x + dx[i];
      y = current.y + dy[i];

      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      if (x == current.x) {
        if (y < current.y) {
          if (!current.up) {
            continue;
          }
        } else {
          if (!current.down) {
            continue;
          }
        }
      } else {
        if (x < current.x) {
          if (!current.left) {
            continue
          } 
        } else {
          if (!current.right) {
            continue;
          }
        }
      }
        
      if (!maze[x][y].searched) {
        maze[x][y].searched = true;
        maze[x][y].previous = current;
        queue.push(maze[x][y]);
      }
    } 
  } 
}

function draw_path() {
  c = maze[end_x][end_y];
  strokeWeight(4);
  while (true) {
    prev = c.previous;
    line(c.x * cell_size + cell_size / 2, c.y * cell_size + cell_size / 2, prev.x * cell_size + cell_size / 2, prev.y * cell_size + cell_size / 2);
    if (prev.x == start_x && prev.y == start_y) {
      break;
    }
    
    c = c.previous;
  }
  strokeWeight(1);
}
  
function clear_search_history() {
  for (i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      maze[i][j].searched = false;
      maze[i][j].previous = null;
    }
  }
}
