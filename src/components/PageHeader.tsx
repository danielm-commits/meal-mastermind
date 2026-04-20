import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between px-5 pt-8 pb-4">
    <div>
      <h1 className="font-serif text-[32px] font-semibold tracking-tight text-foreground leading-none">{title}</h1>
      {subtitle && <p className="text-sm font-normal text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
