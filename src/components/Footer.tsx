const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          © {currentYear} 由{" "}
          <a
            href="https://creatorhome.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium transition-colors"
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
