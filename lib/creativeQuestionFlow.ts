type AnswerMap = Record<string, unknown>;

type Condition = {
  question: string;
  contains: string;
};

type Conditions = {
  all?: (Condition | Conditions)[];
  any?: (Condition | Conditions)[];
};

function answerContains(answer: unknown, value: string): boolean {
  if (Array.isArray(answer)) {
    return answer.includes(value);
  }

  if (typeof answer === "string") {
    return answer === value;
  }

  return false;
}

function evaluateCondition(
  condition: Condition | Conditions,
  answers: AnswerMap
): boolean {
  if ("question" in condition && "contains" in condition) {
    return answerContains(
      answers[condition.question],
      condition.contains
    );
  }

  if ("all" in condition && Array.isArray(condition.all)) {
    return condition.all.every((item) =>
      evaluateCondition(item, answers)
    );
  }

  if ("any" in condition && Array.isArray(condition.any)) {
    return condition.any.some((item) =>
      evaluateCondition(item, answers)
    );
  }

  return false;
}

export function questionIsVisible(
  question: {
    conditions: Conditions | null;
  },
  answers: AnswerMap
): boolean {
  if (!question.conditions) {
    return true;
  }

  return evaluateCondition(question.conditions, answers);
}