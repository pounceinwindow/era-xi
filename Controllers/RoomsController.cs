using System.ComponentModel.DataAnnotations;
using Mentor.Data;
using Mentor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mentor.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Room>>> GetAll(
        CancellationToken cancellationToken)
    {
        var rooms = await dbContext.Rooms
            .AsNoTracking()
            .OrderBy(room => room.Name)
            .ToListAsync(cancellationToken);

        return Ok(rooms);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Room>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var room = await dbContext.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(room => room.Id == id, cancellationToken);

        return room is null ? NotFound() : Ok(room);
    }

    [HttpPost("/api/admin/rooms")]
    public async Task<ActionResult<Room>> Create(
        CreateRoomRequest request,
        CancellationToken cancellationToken)
    {
        var room = new Room
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            RoomClass = request.RoomClass.Trim(),
            PricePerNight = request.PricePerNight,
            Description = request.Description.Trim()
        };

        dbContext.Rooms.Add(room);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    [HttpDelete("/api/admin/rooms/{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var room = await dbContext.Rooms.FindAsync([id], cancellationToken);
        if (room is null)
        {
            return NotFound();
        }

        var hasBookings = await dbContext.Bookings
            .AnyAsync(booking => booking.RoomId == id, cancellationToken);

        if (hasBookings)
        {
            return Conflict(
                new { message = "Нельзя удалить комнату, у которой есть бронирования." });
        }

        dbContext.Rooms.Remove(room);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}

public class CreateRoomRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string RoomClass { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "100000000")]
    public decimal PricePerNight { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}
