let grid_hidden,new_row;
let row_number,box_number; // column first then row
let game_over = false;
let seconds = 0, minutes = 0, timer_stop = false;
let whose_turn = "black"; // black plays first, then white
let enemy = { // blue = white, red = black cause I'm colorblind now
	black_pawn: "white",
	black_queen: "white",
	black: "white",
	white_pawn: "black",
	white_queen: "black",
	white: "black"
}
let kill_count = { // Todo
	white: 0,
	black: 0
}
let can_kill = false;

function loading() {
	size(10,10) // Input grid size here
	grid_reset()
	updateTimer()
}

function size(new_value_one,new_value_two) {
	// Checking if screen is PC or mobile
	if (screen.width>screen.height) {
		number_of_rows = new_value_one
		number_of_boxes = new_value_two
	} else {
		number_of_rows = new_value_two
		number_of_boxes = new_value_one
	}
}

function grid_reset() {
	seconds = 0
	minutes = 0
	game_over = false;
	timer_stop = true;
	grid_generated = false;
	grid_html = document.getElementsByClassName("grid")[0]
	for (var i = grid_html.getElementsByClassName("rows").length - 1; i >= 0; i--) {
		remove_row = grid_html.getElementsByClassName("rows")[i]
		remove_row.remove()
	}
	grid_shown = new Array(number_of_rows)
	grid_hidden = new Array(number_of_rows)
	for (var i = 0; i < grid_shown.length; i++) {
		grid_shown[i] = new Array(number_of_boxes)
		grid_hidden[i] = new Array(number_of_boxes)

		new_row = document.createElement('tr');
		new_row.className = "rows"
		new_row.Name = i
		for (var j = 0; j < grid_shown.length; j++) {
			let new_box = document.createElement('td');
			new_row.appendChild(new_box);
			new_box.Name = j
			new_box.addEventListener("click", play)
			new_box.addEventListener("contextmenu", right_click)
			grid_hidden[i][j] = "empty"
			if ((j+i)%2==0) {
				new_box.className = "box even" // Adds a colour change
				if (i<3) {
					new_box.style.backgroundImage = "url(Pictures/white_pawn.png)"
					grid_hidden[i][j] = "white_pawn"
					new_box.classList.add("occupied")
				}
				if (i>6) {
					new_box.style.backgroundImage = "url(Pictures/black_pawn.png)"
					grid_hidden[i][j] = "black_pawn"
					new_box.classList.add("occupied")
				}
			} else {
				new_box.className = "box"
			}
		}
		grid_html.appendChild(new_row);
	}
}

function grid_generation(start_row,start_box) {
	// Starting the timer
	timer_stop = false
	grid_generated = true
}

function updateTimer() { // Basic timeout function, calls itself every second
	if (!timer_stop) {
		seconds ++
	}
   
     setTimeout(updateTimer, 1000)
     if (seconds==60) {
     	seconds=0
     	minutes+=1
     }
     if ((minutes==59)&&(seconds==59)) {
     	stop_timer = true //  Todo: Fix the timer end, doesn't work
     }
     if (seconds<10) {
    	document.getElementsByClassName('timer')[0].innerText = "Timer: " + minutes + ":0" + seconds
     } else {
    	document.getElementsByClassName('timer')[0].innerText = "Timer: " + minutes + ":" + seconds
    }
     if ((seconds==0)&&(minutes==0)) {
    	document.getElementsByClassName('timer')[0].innerText = "Game didn't start yet, click on a box to play."
     }
}

function right_click(e) {
	/* Put the context menu stuff here */
	//e.preventDefault()
}

function play(e) {
	// Checking if grid is good to play on
	if (game_over) {
		if (game_win) { // Todo: make better game over screen & add game end check
			alert("The game is over, you won")
		} else {
			alert("The game is over, you lost")
		}
		return
	}
	if (!grid_generated) {
		grid_generation()
	}
	// Fetching box
	box_selected = e.target
	// Checking if the player wants to move a pawn before fetching row and box number (to know where the player clicked before) 
	if (box_selected.classList.contains("option_available")) {
		// pawn_moving and temp is old info, box_selected and box_number is new info
		pawn_moving = document.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number]
		// kill variables are not defined here because they remain the same regardless of which pawn the user chooses
		temp_row = row_number
		temp_box = box_number
		box_number = box_selected.Name
		row_number = box_selected.parentElement.Name
		if (box_selected.classList.contains("kill")) {
			pawn_moving = document.getElementsByClassName("rows")[kill_row_start].getElementsByClassName("box")[kill_box_start]
			box_selected.style.backgroundImage = pawn_moving.style.backgroundImage // using info from the click before
			console.log(box_selected,pawn_moving)
			grid_hidden[kill_row_start/2+kill_row_end/2][kill_box_start/2+kill_box_end/2] = "empty" // Should remove the pawn that got killed
			temp_box = document.getElementsByClassName("rows")[kill_row_start/2+kill_row_end/2].getElementsByClassName("box")[kill_box_start/2+kill_box_end/2] // remove on the HTML too
			temp_box.style.backgroundImage = "";
			grid_hidden[kill_row_end][kill_box_end] = grid_hidden[kill_row_start][kill_box_start]
			grid_hidden[kill_row_start][kill_box_start] = "empty"
			for (var i = grid_html.getElementsByClassName("option_available").length - 1; i >= 0; i--) {
				// Removing all possible targets
				grid_html.getElementsByClassName("option_available")[i].classList.remove("kill")
			}
			can_kill = kill_check()
			if (can_kill) { // play again for double kill
				setTimeout(play, 2000, e)
			} else {	
				if (whose_turn=="black") {
					whose_turn = "white"
				} else {
					whose_turn = "black"
				}
			}
		} else {
			box_selected.style.backgroundImage = pawn_moving.style.backgroundImage // using info from the click before
			console.log(box_selected,pawn_moving)
			grid_hidden[row_number][box_number] = grid_hidden[temp_row][temp_box]
			grid_hidden[temp_row][temp_box] = "empty"
			// Changing whose turn it is, turn over
			if (whose_turn=="black") {
				whose_turn = "white"
			} else {
				whose_turn = "black"
			}
		}
		pawn_moving.style.backgroundImage = ""
		pawn_moving.classList.remove("occupied","box_selected")
		box_selected.classList.add("occupied")
		for (var i = grid_html.getElementsByClassName("option_available").length - 1; i >= 0; i--) {
			// Removing all possible targets
			grid_html.getElementsByClassName("option_available")[i].classList.remove("option_available","kill")
		}
	} else {
		for (var i = grid_html.getElementsByClassName("option_available").length - 1; i >= 0; i--) {
			// Removing all possible move targets
			grid_html.getElementsByClassName("option_available")[i].classList.remove("option_available","kill")
		}
		// Fetching row and box numbers
		box_number = box_selected.Name
		row_number = box_selected.parentElement.Name
		can_kill = kill_check()
		if ((box_selected.classList.contains("occupied"))&&(grid_hidden[row_number][box_number].includes(whose_turn))) {
			// Then, we check if we can catch a pawn from the opposing team
			if (can_kill) { 
				// Keep this empty?
			} else { // If no kill available, then try to move around
				if (grid_html.getElementsByClassName("box_selected")[0]!=undefined) {
					grid_html.getElementsByClassName("box_selected")[0].classList.remove("box_selected")
				}
				document.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number].classList.add("box_selected")
				// Colour the options available
				// First, we check those directly adjacent
				if (grid_hidden[row_number+1]!=undefined) {
					console.log(grid_hidden[row_number][box_number])
					if (grid_hidden[row_number][box_number]!="black_pawn") {
						if (grid_hidden[row_number+1][box_number+1]=="empty") { // Bottom right
							document.getElementsByClassName("rows")[row_number+1].getElementsByClassName("box")[box_number+1].classList.add("option_available")
						}
						if (grid_hidden[row_number+1][box_number-1]=="empty") { // Bottom left
							document.getElementsByClassName("rows")[row_number+1].getElementsByClassName("box")[box_number-1].classList.add("option_available")
						}
					}
				}
				if (grid_hidden[row_number-1]!=undefined) {
					if (grid_hidden[row_number][box_number]!="white_pawn") {
						if (grid_hidden[row_number-1][box_number+1]=="empty") { // Top right
							document.getElementsByClassName("rows")[row_number-1].getElementsByClassName("box")[box_number+1].classList.add("option_available")
						}
						if (grid_hidden[row_number-1][box_number-1]=="empty") { // Top left
							document.getElementsByClassName("rows")[row_number-1].getElementsByClassName("box")[box_number-1].classList.add("option_available")
						}
					}
				}
			}
		}
	}
}


let kill_row_start,kill_box_start; // New variables to not forget which place can lead to a kill, DO NOT replace it with temp_box and temp_row
let kill_row_end,kill_box_end; // Start = pawn that moves, end = arrival point
function kill_check() { // Recursion, checks all available kills -> later // Todo: Edit the function to play one by one
	for (kill_row_start = 0; kill_row_start < grid_hidden.length; kill_row_start++) {
		for (kill_box_start = 0; kill_box_start < grid_hidden[kill_row_start].length; kill_box_start++) {
			if (grid_hidden[kill_row_start][kill_box_start].includes(whose_turn)) {
				if (grid_hidden[kill_row_start+2]!=undefined) { // Todo: Add an override for backkills
					if ((grid_hidden[kill_row_start+2][kill_box_start+2]=="empty")&&(enemy[grid_hidden[kill_row_start+1][kill_box_start+1]]==whose_turn)) { // Bottom right, checks if box taken by an enemy and if it can catch it
						kill_row_end = kill_row_start+2
						kill_box_end = kill_box_start+2
						document.getElementsByClassName("rows")[kill_row_end].getElementsByClassName("box")[kill_box_end].classList.add("option_available","kill")
						//kill_check(kill_row_start+2,kill_box_start+2)
					}
					if ((grid_hidden[kill_row_start+2][kill_box_start-2]=="empty")&&(enemy[grid_hidden[kill_row_start+1][kill_box_start-1]]==whose_turn)) { // Bottom left						kill_row_end = kill_row_start+2
						kill_row_end = kill_row_start+2
						kill_box_end = kill_box_start-2
						document.getElementsByClassName("rows")[kill_row_end].getElementsByClassName("box")[kill_box_end].classList.add("option_available","kill")
						//kill_check(kill_row_start+2,kill_box_start-2)
					}
				}
				if (grid_hidden[kill_row_start-2]!=undefined) {
					if ((grid_hidden[kill_row_start-2][kill_box_start+2]=="empty")&&(enemy[grid_hidden[kill_row_start-1][kill_box_start+1]]==whose_turn)) { // Top right
						kill_row_end = kill_row_start-2
						kill_box_end = kill_box_start+2
						document.getElementsByClassName("rows")[kill_row_end].getElementsByClassName("box")[kill_box_end].classList.add("option_available","kill")
						//kill_check(kill_row_start-2,kill_box_start+2)
					}
					if ((grid_hidden[kill_row_start-2][kill_box_start-2]=="empty")&&(enemy[grid_hidden[kill_row_start-1][kill_box_start-1]]==whose_turn)) { // Top left
						kill_row_end = kill_row_start-2
						kill_box_end = kill_box_start-2
						document.getElementsByClassName("rows")[kill_row_end].getElementsByClassName("box")[kill_box_end].classList.add("option_available","kill")
						//kill_check(kill_row_start-2,kill_box_start-2)
					}
				}
			}
			if (document.getElementsByClassName("kill")[0]!=undefined) {
				return true
			}
		}
	}
}