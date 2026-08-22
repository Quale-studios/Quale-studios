"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  label: string;
  value: string;
};

type QuestionFormProps = {
  sessionId: string;
  currentQuestion: number;
  sessionStatus: string;
  questionKey: string;
  question: string;
  questionType: string;
  options: Option[] | null;
  initialAnswer: string;
};

export default function QuestionForm({
  sessionId,
  currentQuestion,
  sessionStatus,
  questionKey,
  question,
  questionType,
  options,
  initialAnswer,
}: QuestionFormProps) {
   
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [textAnswer, setTextAnswer] = useState(initialAnswer);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
  Array.isArray(initialAnswer)
    ? initialAnswer
    : typeof initialAnswer === "string" && initialAnswer
      ? initialAnswer.split(",")
      : []
);
  const [needsRest, setNeedsRest] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
  setIsVisible(false);

  const timer = requestAnimationFrame(() => {
    setIsVisible(true);
  });

  return () => cancelAnimationFrame(timer);
}, [questionKey]);

  const handleAnswer = async (
    answer: string | string[],
    continueAnyway = false
  ) => {
    if (saving) return;

    setSaving(true);

    try {
      const response = await fetch("/api/creative-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionKey,
          answer,
          continueAnyway,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answer");
      }

      const data = await response.json();

      // Q01 + Bad
      // Stay on Q01 and show the rest screen.
      if (data.needsRest) {
  setNeedsRest(true);
  setSaving(false);
  return;
}
// Ready for final review / submission

if (data.readyToSubmit) {
  setReadyToSubmit(true);
  setSaving(false);
  return;
}
// Normal navigation
router.refresh();

    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  const handlePrevious = async () => {
    if (saving || currentQuestion <= 1) return;

    setSaving(true);

    try {
      const response = await fetch("/api/creative-previous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to go to previous question");
      }

      router.refresh();
      setSaving(false);
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
  if (saving) return;

  setSaving(true);

  try {
    const response = await fetch("/api/creative-submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit creative session");
    }

    const data = await response.json();

    if (data.submitted) {
      setCompleted(true);
      setReadyToSubmit(false);
      setSaving(false);
    }
  } catch (error) {
    console.error(error);
    setSaving(false);
  }
};

  const handleTextContinue = () => {
    const answer = textAnswer.trim();

    if (!answer || saving) return;

    handleAnswer(answer);
  };
const handleMultiContinue = () => {
  if (selectedOptions.length === 0 || saving) return;

  handleAnswer(selectedOptions);
};
const toggleOption = (value: string) => {
  setSelectedOptions((current) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
  );
};
  /*
   * SPECIAL SCREEN
   * Only appears when Q01 = Bad.
   *
   * Clicking Continue Anyway sends:
   * questionKey = q01
   * answer = bad
   * continueAnyway = true
   *
   * The API then moves the session to Q02.
   */
  if (needsRest && currentQuestion === 1) {
    return (
      <div className="relative h-[calc(100dvh-80px)] w-full overflow-hidden">
        <div className="absolute inset-0 z-10 flex items-center justify-center px-8 pointer-events-none">
          <div className="w-full max-w-5xl">

            <h1 className="text-3xl font-light italic sm:text-4xl md:text-5xl lg:text-7xl">
              Take a rest and come back later,
              <br />
              or…
            </h1>

            <div className="pointer-events-auto mt-12 text-right">
              <button
                onClick={() => handleAnswer("bad", true)}
                disabled={saving}
                className="
                  text-xl
                  font-light
                  italic
                  text-white/70
                  transition-colors
                  duration-300
                  hover:text-white
                  disabled:opacity-100
                  sm:text-2xl
                "
              >
                Continue Anyway
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }
  if (readyToSubmit) {
  return (
    <div className="relative h-[calc(100dvh-80px)] w-full overflow-hidden">
      <div className="absolute inset-0 z-10 flex items-center justify-center px-8">
        <div className="w-full max-w-5xl text-center">

          <h1 className="text-3xl font-light italic sm:text-4xl md:text-5xl lg:text-7xl">
            Your creative session is ready.
            <br />
            Review your answers before submitting.
          </h1>

          <div className="mt-12 flex items-center justify-center gap-12">

  <button
    type="button"
    onClick={() => setReadyToSubmit(false)}
    disabled={saving}
    className="
      text-xl
      italic
      text-white/50
      transition-colors
      duration-300
      hover:text-white
      disabled:opacity-30
      sm:text-2xl
    "
  >
    Review Answers
  </button>

  <button
    type="button"
    onClick={handleFinalSubmit}
    disabled={saving}
    className="
      text-xl
      italic
      text-white/75
      transition-colors
      duration-300
      hover:text-white
      disabled:opacity-30
      sm:text-2xl
    "
  >
    Final Submit
  </button>

</div>

        </div>
      </div>
    </div>
  );
}
if (completed) {
  return (
    <div className="relative h-[calc(100dvh-80px)] w-full overflow-hidden">
      <div className="absolute inset-0 z-10 flex items-center justify-center px-8">
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-3xl font-light italic sm:text-4xl md:text-5xl lg:text-7xl">
            Thank you.
            <br />
            Your creative session is complete.
          </h1>
        </div>
      </div>
    </div>
  );
}
  /*
   * NORMAL QUESTION SCREEN
   *
   * This is deliberately using the same absolute/inset layout
   * that was working correctly before.
   */
  return (
    <div className="relative h-[calc(100dvh-80px)] w-full overflow-hidden">

      {/* Main question */}
      <div
  className={`absolute inset-0 z-10 flex items-center justify-center px-8 pointer-events-none transition-opacity duration-700 ease-out ${
    isVisible ? "opacity-100" : "opacity-0"
  }`}
>
        <div className="w-full max-w-5xl text-center">

          {/* Question */}
          <h1 className="text-3xl font-light italic sm:text-4xl md:text-5xl lg:text-7xl">
            {question}
          </h1>

          {/* TEXT QUESTION */}
  {/* TEXT QUESTION */}
{questionType === "text" && (
  <div className="pointer-events-auto mx-auto mt-8 w-full max-w-2xl">

    {/* Answer box */}
<div className="relative w-full">
 <textarea
  value={textAnswer}
  onChange={(e) => setTextAnswer(e.target.value)}
  disabled={saving}
  rows={4}
  className="
    block
    h-40
    w-full
    resize-none
    rounded-2xl
    border
    border-white/30
    bg-transparent
    px-6
    py-5
    text-center
    text-xl
    italic
    leading-relaxed
    text-white
    outline-none
    focus:border-white/70
  "
  />

  {!textAnswer && (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        flex
        items-start
        justify-center
        px-6
        py-5
        text-xl
        italic
        leading-relaxed
        text-white/30
      "
    >
      Write your answer...
    </div>
  )}
</div>
     {/* Actions */}
    <div className="mt-8 flex w-full items-center justify-center">

      {/* Undo */}
     <button
  type="button"
  onClick={() => setTextAnswer("")}
  disabled={!textAnswer.trim() || saving}
  className="
    min-w-[70px]
    mr-8
    text-center
    text-xl
    italic
    text-white/50
    transition-colors
    duration-300
    hover:text-white
    disabled:cursor-default
    disabled:text-white/20
  "
>
  Undo
</button>
      {/* Continue */}
   <button
  type="button"
  onClick={handleTextContinue}
  disabled={!textAnswer.trim() || saving}
  className="
    min-w-[90px]
    text-center
    text-xl
    italic
    text-white/75
    transition-colors
    duration-300
    hover:text-white
    disabled:cursor-default
    disabled:text-white/40
  "
>
  Continue
</button>

    </div>

  </div>
)}

          {/* MCQ */}
          {questionType === "single" &&
            Array.isArray(options) && (
              <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-x-8 gap-y-5 sm:mt-9 sm:gap-x-10 md:mt-10 md:gap-10">

                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    disabled={saving}
                    className="
                      relative
                      text-xl
                      italic
                      font-normal
                      text-white/70
                      transition-all
                      duration-300
                      hover:text-white
                      disabled:opacity-30

                      after:absolute
                      after:-bottom-2
                      after:left-0
                      after:h-px
                      after:w-full
                      after:origin-left
                      after:scale-x-0
                      after:bg-white
                      after:transition-transform
                      after:duration-300
                      after:content-['']
                      hover:after:scale-x-100

                      sm:text-2xl
                    "
                  >
                    {option.label}
                  </button>
                ))}

              </div>
            )}
{/* MULTI SELECT */}
{questionType === "multi" &&
  Array.isArray(options) && (
    <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-x-8 gap-y-5 sm:mt-9 sm:gap-x-10 md:mt-10 md:gap-10">

      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            disabled={saving}
            className={`
              relative
              text-xl
              italic
              font-normal
              transition-all
              duration-300
              sm:text-2xl

              ${
                isSelected
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }

              after:absolute
              after:-bottom-2
              after:left-0
              after:h-px
              after:w-full
              after:origin-left
              after:bg-white
              after:transition-transform
              after:duration-300
              after:content-['']

              ${
                isSelected
                  ? "after:scale-x-100"
                  : "after:scale-x-0 hover:after:scale-x-100"
              }

              disabled:opacity-30
            `}
          >
            {option.label}
          </button>
        );
      })}

      <div className="mt-8 flex w-full justify-center">
        <button
          type="button"
          onClick={handleMultiContinue}
          disabled={selectedOptions.length === 0 || saving}
          className="
            min-w-[90px]
            text-xl
            italic
            text-white/75
            transition-colors
            duration-300
            hover:text-white
            disabled:cursor-default
            disabled:text-white/40
          "
        >
          Continue
        </button>
      </div>

    </div>
  )}
        </div>
      </div>

      {/* Previous */}
      {currentQuestion > 1 && (
        <button
          onClick={handlePrevious}
          disabled={saving}
          className="
            absolute
            z-30
            bottom-10
            left-6
            text-lg
            italic
            text-white/60
            transition-colors
            duration-300
            hover:text-white
            disabled:opacity-30

            sm:bottom-14
            sm:left-10
            sm:text-xl

            md:bottom-24
            md:left-16
          "
        >
          Previous
        </button>
      )}

      {/* Session information */}
      <div
        className="
          absolute
          z-30
          bottom-10
          right-6
          text-right
          text-sm
          text-white/40

          sm:bottom-14
          sm:right-10
          sm:text-base

          md:bottom-24
          md:right-16
          md:text-xl
        "
      >
        <p>
          Session status: "{sessionStatus}"
        </p>

        <p className="mt-2">
          Q{String(currentQuestion).padStart(2, "0")}
        </p>
      </div>

    </div>
    
  );
}