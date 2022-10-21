import React from "react";

interface Error404Props {
  returnUrl: string;
}

const Error404: React.FC<Error404Props> = ({ returnUrl }) => {
  return (
    <div>
      <a href={returnUrl}>Go back</a>
    </div>
  );
};

export default Error404;
