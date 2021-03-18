import { h, FunctionalComponent } from "preact";

export const Article: FunctionalComponent<{ content: string }> = ({
  content,
  ...props
}) => {
  return (
    <article
      {...props}
      dangerouslySetInnerHTML={{ __html: content as string }}
    />
  );
};
