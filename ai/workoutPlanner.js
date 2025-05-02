const generateWorkoutPlan = async ({ goal, level, equipment, daysPerWeek }) => {
    // Replace this with actual AI/ML logic or OpenAI API later
    return {
      goal,
      level,
      daysPerWeek,
      schedule: Array.from({ length: daysPerWeek }).map((_, i) => ({
        day: `Day ${i + 1}`,
        workout: `Sample workout for ${goal} using ${equipment.join(", ")}`,
      })),
    };
  };
  
  module.exports = generateWorkoutPlan;