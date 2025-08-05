export function Footer() {
  return (
    <footer className="py-2 px-4 bg-muted/40">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Invixio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
