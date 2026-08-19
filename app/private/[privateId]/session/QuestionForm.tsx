"use client";

import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type QuestionFormProps = {
  sessionId: string;
  questionKey: string;
  question: string;
  questionType: string;
  options: Option[] | null;
};

export default function QuestionForm({
  sessionId,
  questionKey,
  question,
  questionType,
  options,
}: QuestionFormProps) {
  const [saving, setSaving] = useState(false);

  const handleAnswer = async (answer: string | string[]) => {
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answer");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-8 text-center">

      <p className="mb-8 text-white/40 text-lg">
        {questionKey.toUpperCase()}
      </p>

      <h1 className="text-5xl md:text-7xl italic font-light">
        {question}
      </h1>

      {questionType === "single" &&
        Array.isArray(options) && (
          <div className="mt-12 flex justify-center gap-8">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                disabled={saving}
                className="
                  text-3xl
                  italic
                  text-white
                  transition-opacity
                  duration-300
                  hover:opacity-60
                  disabled:opacity-40
                "
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

    </div>
  );
}