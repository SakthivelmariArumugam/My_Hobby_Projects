namespace Habit_Tracker.Models
{
    public class Habit
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<DateTime> CompletedDates { get; set; } = new List<DateTime>();
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    }
}
