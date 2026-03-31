import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-8xl gold-text mb-4">404</h1>
        <p className="text-muted-foreground font-body mb-8">
          This page doesn't exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-primary text-primary-foreground rounded font-body text-sm tracking-wider uppercase hover:opacity-90 cursor-none"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
