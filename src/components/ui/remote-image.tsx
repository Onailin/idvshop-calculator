import Image, { type ImageProps } from "next/image";
import { toDisplayImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

type RemoteImageProps = Omit<ImageProps, "unoptimized" | "src"> & {
  src: string | null | undefined;
  /** Show the full image without cropping; frame follows aspect ratio up to max size */
  contain?: boolean;
};

export function RemoteImage({
  src,
  alt,
  contain = false,
  className,
  fill,
  ...props
}: RemoteImageProps) {
  const displaySrc = toDisplayImageSrc(src);

  if (!displaySrc) {
    return null;
  }

  const isRemote =
    displaySrc.startsWith("http://") ||
    displaySrc.startsWith("https://") ||
    displaySrc.startsWith("/api/images/");

  if (contain) {
    if (fill) {
      return (
        <Image
          src={displaySrc}
          alt={alt}
          fill
          unoptimized={isRemote}
          className={cn("object-contain", className)}
          {...props}
        />
      );
    }

    return (
      <Image
        src={displaySrc}
        alt={alt}
        width={800}
        height={800}
        unoptimized={isRemote}
        className={cn("h-full w-full object-contain", className)}
        {...props}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      unoptimized={isRemote}
      fill={fill}
      className={className}
      {...props}
    />
  );
}
