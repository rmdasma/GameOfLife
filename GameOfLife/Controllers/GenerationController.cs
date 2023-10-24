using Microsoft.AspNetCore.Mvc;
using GameOfLife.Models;

namespace GameOfLife.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenerationController : ControllerBase
    {
        [HttpPost]
        public ActionResult Post([FromBody] Cell[] cells)
        {
            if (cells == null)
                return Ok("Empty");
            var nextGeneration = ApplyRules(cells);
            return Ok(nextGeneration.ToArray());
        }

        public List<Cell> ApplyRules(Cell[] cells)
        {
            var newBoard = new List<Cell>();

            for (int x = 0; x < cells.Max(c => c.X); x++)
            {
                for (int y = 0; y < cells.Max(c => c.Y); y++)
                {
                    int aliveNeighbors = CountAliveNeighbors(x, y, cells);
                    var selectedCell = cells.FirstOrDefault(c => c.X == x && c.Y == y);
                    if (selectedCell != null && selectedCell.Value == 1)
                    {
                        var newValue = aliveNeighbors == 2 || aliveNeighbors == 3 ? 1 : 0;
                        newBoard.Add(new Cell { X = x, Y = y, Value = newValue });
                    }
                    else if (selectedCell != null && selectedCell.Value == 2)
                    {
                        newBoard.Add(new Cell { X = x, Y = y, Value = 2 });
                    }
                    else
                    {
                        var newValue = aliveNeighbors == 3 ? 1 : 0;
                        newBoard.Add(new Cell { X = x, Y = y, Value = newValue });
                    }
                }
            }

            return newBoard;
        }

        private int CountAliveNeighbors(int x, int y, Cell[] cells)
        {
            int count = 0;

            for (int i = -1; i <= 1; i++)
            {
                for (int j = -1; j <= 1; j++)
                {
                    if (i == 0 && j == 0) continue;

                    int nx = x + i;
                    int ny = y + j;

                    if (nx >= 0 && ny >= 0 && nx < cells.Max(c => c.X) && ny < cells.Max(c => c.Y))
                    {
                        var selectedCell = cells.FirstOrDefault(c => c.X == nx && c.Y == ny);
                        if (selectedCell != null && selectedCell.Value == 1) count++;
                    }
                }
            }

            return count;
        }
    }
}