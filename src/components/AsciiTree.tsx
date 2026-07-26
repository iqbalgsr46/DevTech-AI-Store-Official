"use client";
import { useEffect, useState, useRef } from "react";

const TREE_ROWS = [
  "                    0                   ",
  "                   010                  ",
  "                  01010                 ",
  "                 0101010                ",
  "               010101010                ",
  "              01010101010               ",
  "             0101010101010              ",
  "           010101010101010              ",
  "          01010101010101010             ",
  "         0101010101010101010            ",
  "        010101010101010101010           ",
  "      01010101010101010101010           ",
  "     0101010101010101010101010          ",
  "    010101010101010101010101010         ",
  "   01010101010101010101010101010        ",
  "  0101010101010101010101010101010       ",
  "010101010101010101010101010101010       ",
  "  0101010101010101010101010101010       ",
  "   01010101010101010101010101010        ",
  "    010101010101010101010101010         ",
  "      0101010101010101010101010         ",
  "       010101010101010101010            ",
  "         010101010101010                ",
  "          01010101010                   ",
  "            0101010                     ",
  "              01010                     ",
  "               0101                     ",
  "              001100                    ",
  "             00011000                   ",
  "            0001100100                  ",
  "           000110010000                 ",
  "          00011001000000                ",
  "         0001100100000010               ",
  "        000110010000001010              ",
  "0000000000011001000000101000000000000000",
];

const COLORS = ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2"];

export default function AsciiTree() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [chars, setChars] = useState<{ row: number; col: number; char: string; color: string }[]>([]);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<"growing" | "pausing" | "fading">("growing");
  const rowRef = useRef(0);

  const totalRows = TREE_ROWS.length;

  const resetAnimation = () => {
    setVisibleRows(0);
    setChars([]);
    rowRef.current = 0;
    phaseRef.current = "growing";
  };

  useEffect(() => {
    const animate = () => {
      if (phaseRef.current === "growing") {
        if (rowRef.current < totalRows) {
          const rowIdx = totalRows - 1 - rowRef.current; // bottom to top
          setVisibleRows(rowRef.current + 1);
          rowRef.current++;
          animRef.current = setTimeout(animate, 60);
        } else {
          phaseRef.current = "pausing";
          animRef.current = setTimeout(animate, 2000);
        }
      } else if (phaseRef.current === "pausing") {
        phaseRef.current = "fading";
        animRef.current = setTimeout(animate, 800);
      } else {
        resetAnimation();
        animRef.current = setTimeout(animate, 400);
      }
    };

    animRef.current = setTimeout(animate, 300);
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, []);

  const displayedRows = TREE_ROWS.slice(TREE_ROWS.length - visibleRows);

  return (
    <div
      className="font-mono select-none leading-[1.15] tracking-[2px] text-center"
      style={{ fontSize: "clamp(6px, 0.8vw, 10px)" }}
      aria-label="Animated ASCII Digital Tree"
    >
      {displayedRows.map((row, rowIdx) => {
        const actualRowIdx = TREE_ROWS.length - visibleRows + rowIdx;
        const ageRatio = (visibleRows - (visibleRows - rowIdx - 1)) / visibleRows;
        return (
          <div key={actualRowIdx} className="whitespace-pre">
            {row.split("").map((char, colIdx) => {
              if (char === " ") return <span key={colIdx}>&nbsp;</span>;
              const colorIdx = Math.floor(ageRatio * (COLORS.length - 1));
              const color = COLORS[Math.min(colorIdx, COLORS.length - 1)];
              return (
                <span
                  key={colIdx}
                  style={{
                    color,
                    opacity: 0.7 + ageRatio * 0.3,
                    transition: "opacity 0.3s",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
