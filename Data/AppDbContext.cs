using Mentor.Models;
using Microsoft.EntityFrameworkCore;

namespace Mentor.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(room => room.Id);
            entity.Property(room => room.Name).HasMaxLength(100).IsRequired();
            entity.Property(room => room.RoomClass).HasMaxLength(50).IsRequired();
            entity.Property(room => room.PricePerNight).HasPrecision(12, 2);
            entity.Property(room => room.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(booking => booking.Id);
            entity.Property(booking => booking.UserId).HasMaxLength(100).IsRequired();
            entity.HasIndex(booking => new
            {
                booking.RoomId,
                booking.CheckIn,
                booking.CheckOut
            });

            entity.HasOne(booking => booking.Room)
                .WithMany(room => room.Bookings)
                .HasForeignKey(booking => booking.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
