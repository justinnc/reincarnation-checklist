/** Decorative brand mark; the enclosing home link supplies its localized name. */
export default function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <rect width="256" height="256" rx="56" fill="#0A0B0F" />
      <g stroke="#F4B740" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M72 49H184M72 207H184" />
        <path d="M82 50C82 87 88 103 112 119C122 126 122 130 112 137C88 153 82 169 82 206" />
        <path d="M174 50C174 87 168 103 144 119C134 126 134 130 144 137C168 153 174 169 174 206" />
        <path d="M108 82L122 96L148 70" strokeWidth="11" />
      </g>
      <path d="M105 186L124 163C126 160 130 160 132 163L151 186Z" fill="#F4B740" />
    </svg>
  );
}
