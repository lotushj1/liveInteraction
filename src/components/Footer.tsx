const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          © {currentYear} 由{" "}
          <a
            href="https://creatorhome.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline transition-colors"
          >
            CreatorHome
          </a>{" "}
          製作. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
