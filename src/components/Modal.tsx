import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" style={{ animationDuration: "0.3s" }} />
      <div
        className="relative z-10 w-full max-w-lg bg-card border gold-border rounded-lg p-8 gold-glow animate-fade-in"
        style={{ animationDuration: "0.4s" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading text-2xl gold-text">{title}</h3>
          <button onClick={onClose} className="gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
