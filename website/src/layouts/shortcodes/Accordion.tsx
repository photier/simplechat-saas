import { markdownify } from "@/lib/utils/textConverter";
import React, { useState } from "react";

type AccordionItemProps = {
  title: string;
  description?: string;
  content?: React.ReactNode;
  active?: boolean;
  index?: number;
};

// Single Accordion Item component
const AccordionItem = ({
  title,
  content,
  description,
  active = false,
  index,
  className
}: AccordionItemProps & { className?: string }) => {
  const [show, setShow] = useState(active);

  return (
    <div className={`accordion mb-4 ${show ? "active" : ""} ${className || ""}`}>
      <button
        className="accordion-header"
        onClick={() => setShow(!show)}
        aria-label="toggle accordion content"
      >
        {index !== undefined && <span className="text-base">{index + 1}. </span>}
        {typeof title === "string" ? (
          <span dangerouslySetInnerHTML={{ __html: markdownify(title) }} />
        ) : (
          title
        )}
      </button>
      <div className="accordion-content">
        {description ? (
          <div dangerouslySetInnerHTML={{ __html: markdownify(description) }} />
        ) : (
          content
        )}
      </div>
    </div>
  );
};

const Accordion = ({
  title,
  children,
  className,
  active = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) => {
  return (
    <AccordionItem
      title={title}
      content={children}
      active={active}
      className={className}
    />
  );
};

export default Accordion;
