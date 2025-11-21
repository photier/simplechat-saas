import React from "react";

const Button = ({
  label,
  link,
  style,
  rel,
}: {
  label: string;
  link: string;
  style?: string;
  rel?: string;
}) => {
  return (
    <a
      href={link}
      target="_blank"
      rel={`noopener noreferrer ${rel ? (rel === "follow" ? "" : rel) : "nofollow"
        }`}
      className={`btn no-underline px-5 ${style === "outline" ? "btn-outline-primary" : "btn-primary text-white hover:text-text"
        }`}
    >
      {label}
    </a>
  );
};

export default Button;
