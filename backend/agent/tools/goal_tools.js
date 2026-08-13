/**
 * Goal Tools for AI Financial Agent
 * Calculates progress toward savings goals.
 */

export const get_savings_goals = (context) => {
  const { goals = [], currency = '$' } = context;

  if (!goals.length) {
    return { goals: [], count: 0, message: 'No active savings goals found.', currency };
  }

  const goalSummary = goals.map(g => {
    const target = Number(g.target_amount || 0);
    const current = Number(g.current_amount || 0);
    const remaining = Math.max(0, target - current);
    const progressPercent = target > 0 ? Number(((current / target) * 100).toFixed(2)) : 0;

    return {
      id: g.id,
      name: g.name,
      target_amount: Number(target.toFixed(2)),
      current_amount: Number(current.toFixed(2)),
      remaining_amount: Number(remaining.toFixed(2)),
      progress_percentage: Math.min(100, progressPercent),
      target_date: g.target_date || 'Not specified'
    };
  });

  return {
    goals: goalSummary,
    count: goals.length,
    currency
  };
};

export const get_goal_progress = (context, { goal_name, goal_id } = {}) => {
  const { goals = [], currency = '$' } = context;

  if (!goals.length) {
    return { message: 'No savings goals registered in database.', currency };
  }

  let matchedGoal = null;
  if (goal_id) {
    matchedGoal = goals.find(g => String(g.id) === String(goal_id));
  } else if (goal_name) {
    matchedGoal = goals.find(g => g.name.toLowerCase().includes(goal_name.toLowerCase()));
  } else {
    matchedGoal = goals[0]; // default to first active goal
  }

  if (!matchedGoal) {
    return { message: `Goal "${goal_name || goal_id}" not found.`, available_goals: goals.map(g => g.name), currency };
  }

  const target = Number(matchedGoal.target_amount || 0);
  const current = Number(matchedGoal.current_amount || 0);
  const remaining = Math.max(0, target - current);
  const progressPercent = target > 0 ? Number(((current / target) * 100).toFixed(2)) : 0;

  return {
    id: matchedGoal.id,
    name: matchedGoal.name,
    target_amount: Number(target.toFixed(2)),
    current_amount: Number(current.toFixed(2)),
    remaining_amount: Number(remaining.toFixed(2)),
    progress_percentage: Math.min(100, progressPercent),
    target_date: matchedGoal.target_date || 'Not specified',
    currency
  };
};
