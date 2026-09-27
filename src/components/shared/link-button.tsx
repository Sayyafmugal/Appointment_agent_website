import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

/**
 * A Next.js <Link> styled like <Button>. Base UI's Button explicitly does not
 * support rendering as an <a> (see @base-ui/react/button docs: "Links have
 * their own semantics and should not be rendered as buttons through the
 * render prop") — style the anchor directly instead, as recommended there.
 */
export function LinkButton({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  )
}
