"use client";

import TextType from "@/components/TextType";

type ProofTextProps = {
  text: string;
  animated?: boolean;
  className?: string;
};

export default function ProofText({
  text,
  animated = false,
  className = "",
}: ProofTextProps) {
  return (
    <em className={`pp-proof-text ${className}`.trim()}>
      {animated ? (
        <TextType
          as="span"
          className="pp-proof-text-typed"
          text={[text]}
          typingSpeed={86}
          initialDelay={280}
          pauseDuration={3200}
          deletingSpeed={52}
          typeEffect="fade"
          cursorStyle="bar"
          cursorGlide
          showCursor
          cursorColor="var(--primary)"
          loop
          startOnVisible
        />
      ) : (
        text
      )}
    </em>
  );
}
