export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background p-2">
      {/* Pastel Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-200/60 via-blue-100/40 to-background dark:from-purple-950/30 dark:via-blue-950/20 dark:to-background" />

      {/* Top-left Lavender Glow */}
      <div className="absolute -bottom-80 -left-80 w-[1000px] h-[1000px] rounded-full bg-purple-300/40 dark:bg-purple-900/20 blur-[200px] pointer-events-none" />

      {/* Top-right Soft Blue Glow */}
      <div className="absolute -top-96 -right-96 w-[1000px] h-[1000px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[200px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(226,232,240,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.65)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Content Container */}
      <main className="relative z-10 w-full py-8 flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}
