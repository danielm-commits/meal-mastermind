import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between px-5 pt-8 pb-4">
    <div>
      <h1 className="text-[28px] font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-sm font-normal text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
