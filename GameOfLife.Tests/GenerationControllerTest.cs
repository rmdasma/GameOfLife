using GameOfLife.Controllers;
using GameOfLife.Models;
using Microsoft.AspNetCore.Mvc;

namespace GameOfLife.Tests
{
    public class GenerationControllerTest
    {
        private readonly GenerationController _controller;

        public GenerationControllerTest()
        {
            _controller = new GenerationController();
        }

        [Fact]
        public void PostEmptyWhenEmptyCells()
        {
            var result = _controller.Post(null);

            Assert.Equal("Empty", (result as OkObjectResult).Value);
        }

        [Fact]
        public void PostNextGeneration()
        {
            var result = _controller.Post(new Cell[] { 
                new Cell { X = 0, Y = 0, Value = 0 },
                new Cell { X = 1, Y = 1, Value = 1 },
                new Cell { X = 2, Y = 2, Value = 2 },
            } );

            Assert.IsType<Cell[]>((result as OkObjectResult).Value);
        }
    }
}