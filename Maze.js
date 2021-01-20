


function depthfirst(squares, x, y)
{
    squares[y][x] = true;
    
    let nbs = searchNeighbours(squares, x, y)
    
    while (nbs.length > 0)
    {
        let r = Math.floor(Math.random() * nbs.length);
        let nb = nbs[r];

        let mx = (x + nb.x) / 2;
        let my = (y + nb.y) / 2;
        squares[my][mx] = true;
        depthfirst(squares, nb.x, nb.y);

        nbs = searchNeighbours(squares, x, y);
    }
}

function searchNeighbours(squares, x, y)
{
    let nbs = [];
    let W = squares[0].length;
    let H = squares.length;

    // LEFT
    if (x - 2 >= 0)
    {
        if (!squares[y][x - 2])
        {
            nbs.push({ x: x - 2, y: y });
        }
    }

    // RIGHT
    if (x + 2 < W)
    {
        if (!squares[y][x + 2])
        {
            nbs.push({ x: x + 2, y: y });
        }
    }
    
    // TOP
    if (y - 2 >= 0)
    {
        if (!squares[y - 2][x])
        {
            nbs.push({ x: x, y: y - 2 });
        }
    }

    // BOTTOM
    if (y + 2 < H)
    {
        if (!squares[y + 2][x])
        {
            nbs.push({ x: x, y: y + 2 });
        }
    }

    return nbs;
}

function generateMaze(w, h)
{
    let squares = [];

    for (let j = 0; j < (h * 2 + 1); j++)
    {
        squares[j] = [];
        for (let i = 0; i < (w * 2 + 1); i++)
        {
            squares[j][i] = false;
        }
    }

    depthfirst(squares, 1, 1);

    return squares;
}

module.exports = generateMaze;