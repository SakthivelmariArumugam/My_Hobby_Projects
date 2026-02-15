using Microsoft.AspNetCore.Mvc;
using Habit_Tracker.Models;

namespace Habit_Tracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HabitController : ControllerBase
    {
        private static List<Habit> habits = new List<Habit>();
        private static int nextId = 1;

        [HttpGet]
        public ActionResult<List<Habit>> GetAllHabits()
        {
            return Ok(habits);
        }

        [HttpPost]
        public ActionResult<Habit> CreateHabit([FromBody] Habit habit)
        {
            habit.Id = nextId++;
            habit.CreatedDate = DateTime.UtcNow;
            habits.Add(habit);
            return Ok(habit);
        }
        [HttpPost("{id}/complete")]
        public ActionResult MarkComplete(int id)
        {
            var habit = habits.FirstOrDefault(h => h.Id == id);
            if (habit == null)
                return NotFound();

            var today = DateTime.UtcNow.Date;
            if (!habit.CompletedDates.Contains(today))
            {
                habit.CompletedDates.Add(today);
            }
            return Ok(habit);
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteHabit(int id)
        {
            var habit = habits.FirstOrDefault(h => h.Id == id);
            if (habit == null)
                return NotFound();

            habits.Remove(habit);
            return Ok();
        }
    }
}
