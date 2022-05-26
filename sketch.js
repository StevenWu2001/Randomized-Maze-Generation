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

let states;
let maze;
let height;
let width;
let cell_size;
let path_found;
let stack;
let path;
let animating;

let MAX_FRAME;
let MIN_FRAME;

/* UI Variables */

let input_height;
let input_width;
let text_height;
let text_width;
let text_maxframe;
let text_minframe;
let text_fps;

let button_generate;
let button_animate;

let pathfind_menu;
let button_pathfind;

let slider_frame;

/* Starting Point and Ending Point in the Maze */

let start_x;
let start_y;
let end_x;
let end_y;
let set_start = true;

/* Colors */

let blue;
let red;
let pink;

function setup() {
  height = 20;
  width = 20;
  start_x = -1;
  start_y = -1;
  end_x = -1;
  end_y = -1;
  
  stack = [];
  path = [];
  
  cell_size = 20;
  
  path_found = false;
  animating = false;

  MIN_FRAME = 1;
  MAX_FRAME = 60;
  
  blue = color('blue');
  red = color('rgb(255,0,0)');
  pink = color('rgb(255,192,203)');
    
  input_text();
  frameRate(MAX_FRAME / 2);
  
  var canvas = createCanvas(width * cell_size, height * cell_size);
  create_maze();
  print(maze);
  generate_maze_whole();
}

function draw() {
  background(255);
  frameRate(slider_frame.value());
  if (animating) {
    generate_maze_next();
  }

  draw_maze();

  if (start_x != -1 && end_x != -1) {
    find_path_dfs();
    path_found = true;
  }

  if (path_found) {
    draw_path();
  }
}

function draw_rect(color, x, y) {
  fill(color);
  rect(x * cell_size, y * cell_size, cell_size, cell_size);
}

function generate_maze_next() {
  if (stack.length > 0) {
    current = stack.pop();
    current.visited = true;
    
    draw_rect(blue, current.x, current.y);
    
    nexts = find_next(current);
    
    if (nexts != null) {
      index = Math.floor(Math.random() * options.length)
      next = options[index];
      for (var i = 0; i < options.length; i++) {
        draw_rect(red, options[i].x, options[i].y);
      }
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

function mouseClicked() {
  if (mouseX < width * cell_size && mouseY < height * cell_size) {
    if (set_start) {
      start_x = parseInt(mouseX / cell_size);
      start_y = parseInt(mouseY / cell_size);
      set_start = false;
    } else {
      end_x = parseInt(mouseX / cell_size);
      end_y = parseInt(mouseY / cell_size);
      
      if (end_x == start_x && end_y == start_y) {
        end_x = -1;
        end_y = -1;
      }
      set_start = true;
    }
  }
}

/*
  This function draw text boxes, buttons, etc. that accept user inputs.
*/

function input_text() {
  input_width = createInput();
  
  text_width = createElement('h3', 'Enter Width');
  
  text_height = createElement('h3', 'Enter Height');
  
  input_height = createInput();
  
  button_generate = createButton('Generate Maze');
  button_generate.mousePressed(resize_maze);

  button_animate = createButton('Animate Maze Generation');
  button_animate.mousePressed(animate_maze);
  
  text_fps = createElement('h3', 'Animation Speed (fps)');
  
  slider_frame = createSlider(1, 60, 30, 1);
  
  text_maxframe = createElement('h5', MAX_FRAME);

  text_minframe = createElement('h5', MIN_FRAME);
  
  position_elements();
}

function animate_maze() {
  resize_maze();
  create_maze();
  animating = true;
}

/* 
  Resize the Maze
*/

function resize_maze() {
  start_x = -1;
  start_y = -1;
  end_x = -1;
  end_y = -1;
  path_found = false;

  height = input_height.value();
  width = input_width.value();
  
  if (height == "" || width == "") {
    height = 20;
    width = 20;
  }
  
  position_elements();

  create_maze();
  generate_maze_whole();

  resizeCanvas(width * cell_size, height * cell_size);
}

function position_elements() {
  text_width.position(width * cell_size + cell_size, 0);
  text_height.position(width * cell_size + cell_size, 52);
  input_width.position(width * cell_size + cell_size, 42);
  input_height.position(width * cell_size + cell_size, 94);
  button_generate.position(width * cell_size + cell_size, 127);
  
  button_animate.position(width * cell_size + cell_size + 120, 127);

  text_fps.position(width * cell_size + cell_size, 152);

  slider_frame.position(width * cell_size + cell_size, 198);

  text_maxframe.position(width * cell_size + cell_size + 140, 196);

  text_minframe.position(width * cell_size + cell_size, 196);
}

/*
  Draw the Maze based on the 2D array representation.
*/

function draw_maze() {
  line(0, 0, width * cell_size, 0);
  line(0, 0, 0, height * cell_size);
  
  if (start_x != -1) {
    noStroke();
    fill(0, 0, 255, 100);
    rect(start_x * cell_size, start_y * cell_size, cell_size, cell_size);
    stroke(0, 0, 0);
  }

  if (end_x != -1) {
    noStroke();
    fill(255, 0, 0, 100);
    rect(end_x * cell_size, end_y * cell_size, cell_size, cell_size);
    stroke(0, 0, 0);
  }
  
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      
      if (!maze[i][j].visited) {
        noStroke();
        fill(255, 192, 103, 100);
        rect(i * cell_size, j * cell_size, cell_size, cell_size)
        stroke(0, 0, 0);
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

function generate_maze_whole() {
  while (stack.length > 0) {
    
    current = stack.pop();
    current.visited = true;
    
    nexts = find_next(current);
    
    if (nexts != null) {
      index = Math.floor(Math.random() * options.length)
      next = options[index];
      stack.push(current);
    
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
  
  start = maze[parseInt(width / 2)][parseInt(height / 2)];
  stack.push(start);
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

  
  return options;
}

/*
  This function finds a path between the starting and ending point using DFS
*/

function find_path_dfs() {
  clear_search_history();
  start = maze[start_x][start_y];
  path.push(start);
  
  while (path.length > 0) {
    current = path.pop();
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
        path.push(maze[x][y]);
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
    line(c.x * cell_size + cell_size/ 2, c.y * cell_size + cell_size / 2, prev.x * cell_size + cell_size / 2, prev.y * cell_size + cell_size / 2);
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
