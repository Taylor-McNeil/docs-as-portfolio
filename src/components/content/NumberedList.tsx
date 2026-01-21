import { ReactNode, Children, isValidElement, cloneElement } from "react";

interface NumberedListItemProps {
  title: string;
  children: ReactNode;
  number?: number;
  isLast?: boolean;
}

interface NumberedListProps {
  children: ReactNode;
}

export function NumberedListItem({ title, children, number, isLast }: NumberedListItemProps) {
  return (
    <li className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
          <span className="text-sm font-bold text-accent tabular-nums">{number}</span>
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-accent/30 mt-2" />
        )}
      </div>
      <div className="flex-1 pt-0.5 pb-6">
        <div className="text-base font-semibold text-foreground">{title}</div>
        <div className="mt-1 text-sm text-foreground-muted [&>p]:m-0 [&_a]:text-accent [&_a]:underline [&_a]:hover:opacity-80">
          {children}
        </div>
      </div>
    </li>
  );
}

export function NumberedList({ children }: NumberedListProps) {
  const childArray = Children.toArray(children);
  const totalItems = childArray.filter(
    (child) => isValidElement(child) && child.type === NumberedListItem
  ).length;

  let itemNumber = 0;

  const numberedChildren = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === NumberedListItem) {
      itemNumber++;
      return cloneElement(child, {
        number: itemNumber,
        isLast: itemNumber === totalItems,
      } as Partial<NumberedListItemProps>);
    }
    return child;
  });

  return (
    <ol className="list-none p-0 my-6">
      {numberedChildren}
    </ol>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { NumberedList, NumberedListItem } from "@/components/content/NumberedList";
 *
 * <NumberedList>
 *   <NumberedListItem title="Install the SDK">
 *     Run `npm install @anthropic/sdk` to add the package to your project.
 *   </NumberedListItem>
 *   <NumberedListItem title="Set up your API key">
 *     Create an environment variable called `ANTHROPIC_API_KEY` with your key.
 *   </NumberedListItem>
 *   <NumberedListItem title="Make your first request">
 *     Use the Messages API to send a prompt and receive a response.
 *   </NumberedListItem>
 * </NumberedList>
 *
 * Props (NumberedListItem):
 * - title: string (required) - Step title
 * - children: ReactNode - Step description/content
 * - number?: number - Auto-assigned by NumberedList
 * - isLast?: boolean - Auto-assigned by NumberedList
 *
 * Props (NumberedList):
 * - children: ReactNode - NumberedListItem components
 *
 * ASCII REPRESENTATION:
 *
 * ┌───┐
 * │ 1 │  Install the SDK
 * └─┬─┘
 *   │   Run `npm install @anthropic/sdk` to add the
 *   │   package to your project.
 *   │
 * ┌─┴─┐
 * │ 2 │  Set up your API key
 * └─┬─┘
 *   │   Create an environment variable called
 *   │   `ANTHROPIC_API_KEY` with your key.
 *   │
 * ┌─┴─┐
 * │ 3 │  Make your first request
 * └───┘
 *       Use the Messages API to send a prompt and
 *       receive a response.
 *
 * Numbers auto-increment. Connecting line hidden on last item.
 * Great for step-by-step instructions or tutorials.
 */
