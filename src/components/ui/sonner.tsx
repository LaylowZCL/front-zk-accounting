import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:border-emerald-500/40 group-[.toast]:bg-emerald-500/10 group-[.toast]:text-emerald-700 dark:group-[.toast]:text-emerald-300",
          error:
            "group-[.toast]:border-red-500/40 group-[.toast]:bg-red-500/10 group-[.toast]:text-red-700 dark:group-[.toast]:text-red-300",
          warning:
            "group-[.toast]:border-amber-500/40 group-[.toast]:bg-amber-500/10 group-[.toast]:text-amber-800 dark:group-[.toast]:text-amber-300",
          info:
            "group-[.toast]:border-sky-500/40 group-[.toast]:bg-sky-500/10 group-[.toast]:text-sky-700 dark:group-[.toast]:text-sky-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
