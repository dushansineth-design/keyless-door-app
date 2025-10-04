import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinEntryProps {
  correctPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinEntry = ({ correctPin, onSuccess, onCancel }: PinEntryProps) => {
  const [pin, setPin] = useState("");

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === correctPin) {
            onSuccess();
          } else {
            setPin("");
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm mx-6 glass-strong rounded-2xl p-8 shadow-glass animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
          <p className="text-sm text-muted-foreground">Enter your 4-digit PIN to unlock</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-14 h-14 rounded-xl glass flex items-center justify-center text-2xl font-bold transition-all",
                pin.length > i ? "bg-primary/20 text-primary" : ""
              )}
            >
              {pin.length > i ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="ghost"
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 text-xl font-semibold glass hover:bg-primary/20 hover:text-primary transition-all"
            >
              {num}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-16 glass hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleNumberClick("0")}
            className="h-16 text-xl font-semibold glass hover:bg-primary/20 hover:text-primary transition-all"
          >
            0
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="h-16 glass hover:bg-warning/20 hover:text-warning transition-all"
          >
            <Delete className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
