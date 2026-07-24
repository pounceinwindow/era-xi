using System.Text.Json.Serialization;

namespace Mentor.Models;

public class Room
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RoomClass { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public string Description { get; set; } = string.Empty;

    [JsonIgnore]
    public List<Booking> Bookings { get; set; } = [];
}
