namespace Mentor.Models;

public class Booking
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public Room Room { get; set; } = null!;
}
