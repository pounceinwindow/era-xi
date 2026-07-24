using System.ComponentModel.DataAnnotations;
using Mentor.Data;
using Mentor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mentor.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController(AppDbContext dbContext) : ControllerBase
{
    private static readonly SemaphoreSlim BookingLock = new(1, 1);

    [HttpPost]
    public async Task<ActionResult<Booking>> Create(
        CreateBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (request.CheckIn >= request.CheckOut)
        {
            return BadRequest(
                new { message = "Дата выезда должна быть позже даты заезда." });
        }

        await BookingLock.WaitAsync(cancellationToken);
        try
        {
            var room = await dbContext.Rooms.FindAsync(
                [request.RoomId],
                cancellationToken);

            if (room is null)
            {
                return NotFound(new { message = "Комната не найдена." });
            }

            var isBusy = await dbContext.Bookings.AnyAsync(
                booking =>
                    booking.RoomId == request.RoomId &&
                    request.CheckIn < booking.CheckOut &&
                    request.CheckOut > booking.CheckIn,
                cancellationToken);

            if (isBusy)
            {
                return Conflict(
                    new { message = "Комната уже забронирована на выбранные даты." });
            }

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                RoomId = request.RoomId,
                UserId = request.UserId.Trim(),
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                CreatedAtUtc = DateTime.UtcNow,
                Room = room
            };

            dbContext.Bookings.Add(booking);
            await dbContext.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = booking.Id, userId = booking.UserId },
                booking);
        }
        finally
        {
            BookingLock.Release();
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Booking>> GetById(
        Guid id,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        var booking = await dbContext.Bookings
            .AsNoTracking()
            .Include(booking => booking.Room)
            .FirstOrDefaultAsync(
                booking => booking.Id == id && booking.UserId == userId,
                cancellationToken);

        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpGet]
    public async Task<ActionResult<List<Booking>>> GetByUser(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        var bookings = await dbContext.Bookings
            .AsNoTracking()
            .Include(booking => booking.Room)
            .Where(booking => booking.UserId == userId)
            .OrderBy(booking => booking.CheckIn)
            .ToListAsync(cancellationToken);

        return Ok(bookings);
    }
}

public class CreateBookingRequest
{
    public Guid RoomId { get; set; }

    [Required, MaxLength(100)]
    public string UserId { get; set; } = string.Empty;

    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
}
