import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({ href = "/dashboard", inverse = false }: { href?: string; inverse?: boolean }) {
  return <Link href={href} className={cn("brand", inverse && "brand-inverse")} aria-label="Vortex — início">
    <span className="brand-glyph"><Image src="/brand/instachat-symbol-v1.png" width={43} height={43} alt="" priority /></span>
    <span>Vortex</span>
  </Link>;
}
