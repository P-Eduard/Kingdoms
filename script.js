$(document).ready(function()
{
    
    class Map
    {
        constructor() // Initial map before any settings.
        {
            this.grid = [[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]];
            this.mapWidth = this.grid[0].length;
            this.mapHeight = this.grid.length;
            this.totalArea = 16;
            this.kingdomList = [];
            this.initializeKindoms();
            this.addClick();
        }

        initializeKindoms() // Setup the kindoms.
        {
            for (let i = 0; i < 4; i++)
            {
                const newKingdom = new Kingdom(i);
                this.kingdomList.push(newKingdom);
            }

        }

        logKingdoms() // Log the kingsomd to the console.
        {
            this.kingdomList.forEach(el => {console.log(el)});
        }

        logLands()
        {
            this.kingdomList.forEach(el => {console.log(JSON.stringify(el.lands))});
        }


        resizeMap(grid) // Change the map variables.
        {
            this.grid = grid.concat();
            this.mapWidth = this.grid[0].length;
            this.mapHeight = this.grid.length;
            this.totalArea = this.mapWidth*this.mapHeight;
            this.kingdomList = [];
            this.initializeKindoms();
            this.setGrid();
        }

        setGrid() // Resize the html grid.
        {
            $('#gridContainer').empty();
            $('#gridContainer').width(70*this.mapWidth);
            $('#gridContainer').height(70*this.mapHeight)
            for (let i = 0; i < this.mapHeight; i++)
                for (let j = 0; j < this.mapWidth; j++)
                    $('#gridContainer').append(`<div id="${i}-${j}" class="grid-box border rounded m-1"></div>`);
            if(this.mapHeight <= 7) this.smallGrid();
            this.addClick();
        }

        smallGrid() // If there's less than 5x5 double the size.
        {
            const childElements = $("#gridContainer").children();
            childElements.addClass("small-grid");
            $('#gridContainer').width(110*this.mapWidth);
            $('#gridContainer').height(110*this.mapHeight)
        }
        
        updateOptionLands() // Keep track of where each kingdom can expand.
        {
            let newOptionLands = [[],[],[],[]];
            for (let i = 0; i < this.mapHeight; i++)
                for (let j = 0; j < this.mapHeight; j++)
                    if(this.grid[i][j] !== 0)
                    {
                        if(this.grid[i-1][j] !== undefined && !this.lands[this.grid[i][j]-1].includes([i-1,j]) && ! newOptionLands[this.grid[i][j]-1].includes([i-1,j]))newOptionLands[this.grid[i][j]-1].push([i-1,j]);
                        if(this.grid[i-1][j] !== undefined && !this.lands[this.grid[i][j]-1].includes([i,j+1]) && ! newOptionLands[this.grid[i][j]-1].includes([i,j+1]))newOptionLands[this.grid[i][j]-1].push([i,j+1]);
                        if(this.grid[i-1][j] !== undefined && !this.lands[this.grid[i][j]-1].includes([i+1,j]) && ! newOptionLands[this.grid[i][j]-1].includes([i+1,j]))newOptionLands[this.grid[i][j]-1].push([i+1,j]);
                        if(this.grid[i-1][j] !== undefined && !this.lands[this.grid[i][j]-1].includes([i,j-1]) && ! newOptionLands[this.grid[i][j]-1].includes([i,j-1]))newOptionLands[this.grid[i][j]-1].push([i,j-1]);
                    }
            this.optionLands = newOptionLands;
        }
        
        addClick() // Add click event listeners.
        {
            const mapItem = this;
            $(".grid-box").on("click", function()
            {
                const [boxRow, boxCol] = this.id.split('-').map(numStr => parseInt(numStr, 10)), neighbors = mapItem.getNeighbors(mapItem.grid, boxRow, boxCol);
                if (neighbors.length >= 2)
                    return;
                else if (neighbors.length === 1)
                {
                    if(mapItem.grid[boxRow][boxCol] === -1)
                    {
                        mapItem.grid[boxRow][boxCol] = neighbors[0];
                        mapItem.kingdomList[mapItem.grid[boxRow][boxCol]].addLand([boxRow, boxCol]);
                    }
                    else
                    {
                        mapItem.kingdomList[mapItem.grid[boxRow][boxCol]].removeLand([boxRow, boxCol]);
                        mapItem.grid[boxRow][boxCol] = -1;
                    }
                    // With 1 neighbor you can toggle between 0 and that neighbor.
                }
                else
                {
                    let other = mapItem.grid[boxRow][boxCol];
                    mapItem.grid[boxRow][boxCol] += 1;
                    if(mapItem.grid[boxRow][boxCol] > 3) mapItem.grid[boxRow][boxCol] = -1;
                    if(mapItem.grid[boxRow][boxCol] !== -1)mapItem.kingdomList[mapItem.grid[boxRow][boxCol]].addLand([boxRow, boxCol]);
                    if(other !== -1)mapItem.kingdomList[other].removeLand([boxRow, boxCol]);
                    // With no neighbors you can switch to any value.
                }
                $(`#${boxRow}-${boxCol}`).removeClass("k0 k1 k2 k3");
                if(mapItem.grid[boxRow][boxCol] !== -1)$(`#${boxRow}-${boxCol}`).addClass(`k${mapItem.grid[boxRow][boxCol]}`);
                // console.log("Kingdoms: ");
                // mapItem.logKingdoms();
            });
        }

        getNeighbors(mapGrid, boxRow, boxCol) // Return the neighbors for the box you ckick.
        {
            let neighbors = [];
            if (boxRow - 1 >= 0 && mapGrid[boxRow - 1][boxCol] !== -1 && !neighbors.includes(mapGrid[boxRow - 1][boxCol]))
                neighbors.push(mapGrid[boxRow - 1][boxCol]); // Top
            if (boxCol + 1 < mapGrid[boxRow].length && mapGrid[boxRow][boxCol + 1] !== -1 && !neighbors.includes(mapGrid[boxRow][boxCol + 1]))
                neighbors.push(mapGrid[boxRow][boxCol + 1]); // Right
            if (boxRow + 1 < mapGrid.length && mapGrid[boxRow + 1][boxCol] !== -1 && !neighbors.includes(mapGrid[boxRow + 1][boxCol]))
                neighbors.push(mapGrid[boxRow + 1][boxCol]); // Bottom
            if (boxCol - 1 >= 0 && mapGrid[boxRow][boxCol - 1] !== -1 && !neighbors.includes(mapGrid[boxRow][boxCol - 1]))
            neighbors.push(mapGrid[boxRow][boxCol - 1]); // Left
            return neighbors;
        }

        updateOptionLands() // Make each kingdom update their expansion options.
        {
            this.kingdomList.forEach(el =>
            {
                el.updateOptionLands(this.mapHeight, this.mapWidth);
            });
        }

        turn() // What happens each turn.
        {
            let choiceLand = [], exp = [], war = [], remove = [], changeAdd = [], changeRemove = [];

            // Set where each set has a chance of expanding.
            
            this.updateOptionLands();

            // Choose one of the options of expansion.

            for (let ikd = 0; ikd < this.kingdomList.length; ikd++) // Index kingdom
            {
                choiceLand.push([]);
                for (let ist = 0; ist < this.kingdomList[ikd].lands.length; ist++) // Index set of lands
                {
                    choiceLand[ikd].push(this.kingdomList[ikd].optionLands[ist][Math.floor(Math.random() * this.kingdomList[ikd].optionLands[ist].length)]);
                }
            }
            // console.log("choiceland", choiceLand);

            // Rearrange the chosen lands and note if any results in a conflict.

            for (let kd1 = 0; kd1 < choiceLand.length; kd1++) // Each kingdom
            {
                for (let is1 = 0; is1 < choiceLand[kd1].length; is1++) // Each set of each kindom
                {
                    for (const expLand of exp) // Check if another land of the same kingdom targetted the same territory
                    {
                        if ((expLand[0] === choiceLand[kd1][is1][0]) && (expLand[1] === choiceLand[kd1][is1][1]))
                            if(expLand[2][0] === kd1)expLand.push([kd1, is1]);
                    }

                    if(!coordsInArray(exp, choiceLand[kd1][is1])) // If it wasn't checked already
                    {
                        let ownedBy = this.grid[choiceLand[kd1][is1][0]][choiceLand[kd1][is1][1]]; // Store who owns the land      === -1 ? -1 : kd1
                        exp.push([...choiceLand[kd1][is1], ownedBy, [kd1, is1]]); // Check the land for conflict
                        for (let kd2 = 0; kd2 < choiceLand.length; kd2++) // Every other kingdom
                        {
                            if(kd1 !== kd2) // If it's not checking a kingdom with itself
                            for (let is2 = 0; is2 < choiceLand[kd2].length; is2++) // Every set of every other kingdom
                            {
                                if(choiceLand[kd1][is1][0] === choiceLand[kd2][is2][0] && choiceLand[kd1][is1][1] === choiceLand[kd2][is2][1])
                                {
                                    exp[exp.length-1].push([kd2, is2]);
                                }
                            }
                        }
                    }
                }
            }

            // Check if any of the chosen lands already belong to a set.

            for (let ic = 0; ic < exp.length; ic++) // Index conflict
            {
                if(exp[ic][2] !== -1) // if the conflict isn't neutral
                for (let set = 0; set < this.kingdomList[exp[ic][2]].lands.length; set++) // Each set of lands of the targetted kingdom exp[ic][2] 
                {
                    if(coordsInArray(this.kingdomList[exp[ic][2]].lands[set], exp[ic]))
                    {
                        war.push([...exp[ic].slice(0,3), [exp[ic][2], set], ...exp[ic].slice(3)]);
                        remove.push(ic);
                    }
                }
            }

            // If any do belong to a set, remopve them from the regular conflict.

            if(remove.length > 0)
            exp = exp.filter((item, index) => !remove.includes(index));

            // console.log("exp", exp);
            // console.log("war", war);

            // Resolve the neutral conflicts.

            for (let iex = 0; iex < exp.length; iex++)
            {
                let conflict = [0,0,0,0], power = 0; // Save each different kingdom's power on the land to be conquered.
                for (let il = 3; il < exp[iex].length; il++)
                {
                    conflict[exp[iex][il][0]] += this.kingdomList[exp[iex][il][0]].lands[exp[iex][il][1]].length;
                    power += this.kingdomList[exp[iex][il][0]].lands[exp[iex][il][1]].length;
                }
                // $(`#${exp[iex][0]}-${exp[iex][1]}`).removeClass("k0 k1 k2 k3");
                let winner = Math.floor(Math.random() * power) +1;
                if(winner <= conflict[0])
                {
                    changeAdd.push([exp[iex][0],exp[iex][1],0]);
                    // this.kingdomList[0].addLand([exp[iex][0],exp[iex][1]]);
                    this.grid[exp[iex][0]][exp[iex][1]] = 0;
                    // $(`#${exp[iex][0]}-${exp[iex][1]}`).addClass(`k0`);
                }
                else if(winner <= conflict[0]+conflict[1])
                {
                    changeAdd.push([exp[iex][0],exp[iex][1],1]);
                    // this.kingdomList[1].addLand([exp[iex][0],exp[iex][1]]);
                    this.grid[exp[iex][0]][exp[iex][1]] = 1;
                    // $(`#${exp[iex][0]}-${exp[iex][1]}`).addClass(`k1`);
                }
                else if(winner <= conflict[0]+conflict[1]+conflict[2])
                {
                    changeAdd.push([exp[iex][0],exp[iex][1],2]);
                    // this.kingdomList[2].addLand([exp[iex][0],exp[iex][1]]);
                    this.grid[exp[iex][0]][exp[iex][1]] = 2;
                    // $(`#${exp[iex][0]}-${exp[iex][1]}`).addClass(`k2`);
                }
                else
                {
                    changeAdd.push([exp[iex][0],exp[iex][1],3]);
                    // this.kingdomList[3].addLand([exp[iex][0],exp[iex][1]]);
                    this.grid[exp[iex][0]][exp[iex][1]] = 3;
                    // $(`#${exp[iex][0]}-${exp[iex][1]}`).addClass(`k3`);
                }
            }

            // Resolve war conflicts.

            for (let iw = 0; iw < war.length; iw++)
            {
                let conflict = [0,0,0,0], power = this.kingdomList[war[iw][3][0]].lands[war[iw][3][1]].length;
                conflict[war[iw][3][0]] += this.kingdomList[war[iw][3][0]].lands[war[iw][3][1]].length;
                for (let il = 4; il < war[iw].length; il++)
                {
                    conflict[war[iw][il][0]] += this.kingdomList[war[iw][il][0]].lands[war[iw][il][1]].length;
                    power += this.kingdomList[war[iw][il][0]].lands[war[iw][il][1]].length;
                }
                // $(`#${war[iw][0]}-${war[iw][1]}`).removeClass("k0 k1 k2 k3");
                let winner = Math.floor(Math.random() * power) +1;
                if(winner <= conflict[0])
                {
                    if(war[iw][3][0] !== 0)
                    {
                        changeRemove.push([war[iw][0],war[iw][1],war[iw][3][0]]);
                        changeAdd.push([war[iw][0],war[iw][1],0]);
                        // this.kingdomList[0].addLand([war[iw][0],war[iw][1]]);
                        this.grid[war[iw][0]][war[iw][1]] = 0;
                        // $(`#${war[iw][0]}-${war[iw][1]}`).addClass(`k0`);
                    }
                }
                else if(winner <= conflict[0]+conflict[1])
                {
                    if(war[iw][3][0] !== 1)
                    {
                        changeRemove.push([war[iw][0],war[iw][1],war[iw][3][0]]);
                        changeAdd.push([war[iw][0],war[iw][1],1]);
                        // this.kingdomList[1].addLand([war[iw][0],war[iw][1]]);
                        this.grid[war[iw][0]][war[iw][1]] = 1;
                        // $(`#${war[iw][0]}-${war[iw][1]}`).addClass(`k1`);
                    }
                }
                else if(winner <= conflict[0]+conflict[1]+conflict[2])
                {
                    if(war[iw][3][0] !== 2)
                    {
                        changeRemove.push([war[iw][0],war[iw][1],war[iw][3][0]]);
                        changeAdd.push([war[iw][0],war[iw][1],2]);
                        // this.kingdomList[2].addLand([war[iw][0],war[iw][1]]);
                        this.grid[war[iw][0]][war[iw][1]] = 2;
                        // $(`#${war[iw][0]}-${war[iw][1]}`).addClass(`k2`);
                    }
                }
                else
                {
                    if(war[iw][3][0] !== 3)
                    {
                        changeRemove.push([war[iw][0],war[iw][1],war[iw][3][0]]);
                        changeAdd.push([war[iw][0],war[iw][1],3]);
                        // this.kingdomList[3].addLand([war[iw][0],war[iw][1]]);
                        this.grid[war[iw][0]][war[iw][1]] = 3;
                        // $(`#${war[iw][0]}-${war[iw][1]}`).addClass(`k3`);
                    }
                }
            }

            // Enact changes.

            for (let i = 0; i < changeRemove.length; i++)
            {
                this.kingdomList[changeRemove[i][2]].removeLand([changeRemove[i][0],changeRemove[i][1]]);
                $(`#${changeRemove[i][0]}-${changeRemove[i][1]}`).removeClass("k0 k1 k2 k3");
            }

            for (let i = 0; i < changeAdd.length; i++)
            {
                this.kingdomList[changeAdd[i][2]].addLand([changeAdd[i][0],changeAdd[i][1]]);
                $(`#${changeAdd[i][0]}-${changeAdd[i][1]}`).addClass(`k${changeAdd[i][2]}`);
            }
            
            console.log("Kingdom lands: ");
            this.logLands();
        }
    }

    class Kingdom // The colored squares representing the kingdoms.
    {
        constructor(number)
        {
            this.kingdomNumber = number;
            this.lands = [];
            this.optionLands = [];
            this.logChanges = false;
        }
        // The lands and optionLands should look like this. 
        // Each first index is a set of isolated lands, every index inside that are the coordiantes of the lands.
        // [
        //     [
        //         [0,0],[0,1]
        //     ],
        //     [
        //         [1,2]
        //     ]
        // ]

        checkAdjacent(coords, check) // Check if a position is adjacent to an array in lands.
        {
            let ok = false;
            this.lands[check].forEach(el =>
            {
                if(el[0] === coords[0]) if(el[1] === coords[1]+1 || el[1] === coords[1]-1) ok = true;
                if(el[1] === coords[1]) if(el[0] === coords[0]+1 || el[0] === coords[0]-1) ok = true;
            });
            return ok;
        }

        addLand(coords) // Add land to the kingdom, isolated or adjacent to existing land.
        {
            if(coords[0] === -1)return;
            if(this.lands.length === 0)this.lands.push([coords]); // It's still empty, just add the first land.
            else // Check the sets of lands and add to the adjacent one or a new one.
            {
                let added = false, i, j;
                for (i = 0; i < this.lands.length; i++)
                    if(this.checkAdjacent(coords, i))
                    {
                        this.lands[i].push(coords.slice());
                        added = true;
                        break;
                    }
                if(added && i < this.lands.length)
                    for (j = i+1; j < this.lands.length; j++)
                        if(this.checkAdjacent(coords, j))
                            this.mergeLands(i, j);
                if(!added)this.lands.push([coords]);
            }
            if(this.logChanges)console.log(`Added ${coords} to ${this.kingdomNumber}.`);
        }

        removeLand(coords) // Remove land from an array.
        {
            let ix = false;
            for (let i = 0; i < this.lands.length; i++)
                for (let j = 0; j < this.lands[i].length; j++)
                    if(this.lands[i][j][0] === coords[0] && this.lands[i][j][1] === coords[1])
                    {
                        this.lands[i].splice(j,1);
                        if(this.lands[i].length === 0)
                        {
                            this.lands.splice(i,1)
                            break;
                        }
                        ix = i;
                        break
                    }
            if(ix !== false)this.splitLands(ix);
            if(this.logChanges)console.log(`Removed ${coords} from ${this.kingdomNumber}.`);
        }

        mergeLands(i1, i2) // Found 2 sets of lands that should merge.
        {
            this.lands[i1].push(...this.lands[i2]);
            this.lands.splice(i2, 1);
            if(this.logChanges)console.log(`Merged lands in ${this.kingdomNumber}`);
        }

        splitLands(ix) // Lost a land, check for a split.
        {
            let base = this.lands[ix].slice(1), firstSection = this.lands[ix].slice(0,1), secondSection = [], i, ok;
            base.forEach(el =>
            {

                for (i = 0; i < firstSection.length; i++)
                {
                    ok = false;
                    if(firstSection[i][0] === el[0]) if(firstSection[i][1] === el[1]+1 || firstSection[i][1] === el[1]-1) ok = true;
                    if(firstSection[i][1] === el[1]) if(firstSection[i][0] === el[0]+1 || firstSection[i][0] === el[0]-1) ok = true;
                    if(ok)
                    {
                        firstSection.push(el.concat());
                        break;
                    }
                }
                if(!ok) secondSection.push(el.concat());
            });
            if(secondSection.length > 0)
            {
                this.lands.splice(ix, 1);
                this.lands.push(firstSection);
                this.lands.push(secondSection);
                this.splitLands(this.lands.length-1);
            }
            if(this.logChanges)console.log(`Caused a split in ${this.kingdomNumber}`);
        }

        updateOptionLands(maxRow, maxCol) // Where the kingdom has a chance to expand for each set of lands.
        {
            this.optionLands = [];
            this.lands.forEach(landSet =>
            {
                let canAdd = [];
                for (const check of landSet)
                {
                    if(check[0]-1 >= 0)
                        if(!coordsInArray(landSet,[check[0]-1,check[1]]))
                            if(!coordsInArray(canAdd,[check[0]-1,check[1]]))
                                canAdd.push([check[0]-1,check[1]]);
                    if(check[1]+1 < maxCol)
                        if(!coordsInArray(landSet,[check[0],check[1]+1]))
                            if(!coordsInArray(canAdd,[check[0],check[1]+1]))
                                canAdd.push([check[0],check[1]+1]);
                    if(check[0]+1 < maxRow)
                        if(!coordsInArray(landSet,[check[0]+1,check[1]]))
                            if(!coordsInArray(canAdd,[check[0]+1,check[1]]))
                                canAdd.push([check[0]+1,check[1]]);
                    if(check[1]-1 >= 0)
                        if(!coordsInArray(landSet,[check[0],check[1]-1]))
                            if(!coordsInArray(canAdd,[check[0],check[1]-1]))
                                canAdd.push([check[0],check[1]-1]);
                }
                if(canAdd.length !== 0)this.optionLands.push([...canAdd]);
            });
        }
    }

    const map = new Map(), updateGrid = (gridHeight, gridWidth) => // Resize the grid.
    {
        let newGrid = [];
        for (let i = 0; i < gridHeight; i++)
        {
            newGrid.push([]);
            for (let j = 0; j < gridWidth; j++)
            {
                newGrid[i].push(-1);
            }
        }
        map.resizeMap(newGrid);
    }
    
    function coordsInArray(arr, coordinates)
    {
        for (const coord of arr)
            if (coord[0] === coordinates[0] && coord[1] === coordinates[1])
                return true;
        return false;
    }

    $('#widthRange').on("input", function() // Ajust the grid with the sliders.
    {
        const newWidth = $(this).val();
        updateGrid(map.mapHeight, newWidth);
    });

    $('#heightRange').on("input", function() // Ajust the grid with the sliders.
    {
        const newHeight = $(this).val();
        updateGrid(newHeight, map.mapWidth);
    });

    $('#startBtn').on("click", function()
    {
        map.turn();
    })
})