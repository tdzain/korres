import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
})
const I = (d: React.ReactNode) => function Icon({ size, ...p }: P) { return <svg {...base(size)} {...p}>{d}</svg> }

export const SearchIcon = I(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>)
export const UserIcon = I(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.2c1.2-2.2 3.100-3.200 5.500-3.200s4.300 1 5.500 3.200" /></>)
export const BookmarkIcon = I(<path d="M7 4h10v16l-5-3.600L7 20z" />)
export const BookmarkFilledIcon = function BookmarkFilledIcon({ size, ...p }: P) { return <svg {...base(size)} {...p} fill="currentColor"><path d="M7 4h10v16l-5-3.600L7 20z" /></svg> }
export const BagIcon = I(<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6.500a3 3 0 0 1 6 0V8" /></>)
export const MenuIcon = I(<><path d="M4 8h16" /><path d="M4 16h16" /></>)
export const CloseIcon = I(<path d="m6 6 12 12M18 6 6 18" />)
export const ChevronRightIcon = I(<path d="m9 5 7 7-7 7" />)
export const ChevronLeftIcon = I(<path d="m15 5-7 7 7 7" />)
export const ChevronDownIcon = I(<path d="m5 9 7 7 7-7" />)
export const PlusIcon = I(<path d="M12 5v14M5 12h14" />)
export const MinusIcon = I(<path d="M5 12h14" />)
export const CheckIcon = I(<path d="m5 12.500 4.500 4.500L19 7.500" />)
export const TruckIcon = I(<><path d="M2.500 6.500h11v10h-11z" /><path d="M13.500 10h4l3 3v3.500h-7" /><circle cx="7" cy="17.500" r="1.800" /><circle cx="17" cy="17.500" r="1.800" /></>)
export const ClockIcon = I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const PinIcon = I(<><path d="M12 21s-6.500-5.800-6.500-11a6.500 6.500 0 0 1 13 0c0 5.200-6.500 11-6.500 11z" /><circle cx="12" cy="10" r="2.300" /></>)
export const PlayIcon = I(<path d="M8 5.500v13l11-6.500z" />)
export const LockIcon = I(<><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>)
export const CopyIcon = I(<><rect x="8" y="8" width="12" height="12" /><path d="M16 8V4H4v12h4" /></>)
export const ArrowRightIcon = I(<path d="M4 12h16m-6-6 6 6-6 6" />)
export const FilterIcon = I(<><path d="M4 7h16M7 12h10M10 17h4" /></>)
export const ShieldIcon = I(<><path d="M12 3 5 6v5c0 4.500 3 8 7 10 4-2 7-5.500 7-10V6z" /><path d="m9 12 2.200 2.200L15 10" /></>)
export const LeafIcon = I(<><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19 13 11" /></>)
export const HeartIcon = I(<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.500 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z" />)
export const HeartFilledIcon = function HeartFilledIcon({ size, ...p }: P) { return <svg {...base(size)} {...p} fill="currentColor"><path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.500 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z" /></svg> }
export const VolumeIcon = I(<><path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" /><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11" /></>)
export const MuteIcon = I(<><path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" /><path d="m16 9.500 5 5m0-5-5 5" /></>)
export const InfoIcon = I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5.500M12 7.800v.1" /></>)
export const SendIcon = I(<path d="M4 12 20 4l-4.500 16-3.500-6.500z" />)
export const ExpandIcon = I(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />)

export function StarIcon({ size = 12, ...p }: P) {
  return <svg {...base(size)} {...p} fill="currentColor" strokeWidth={0}><path d="m12 2.500 2.900 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8z" /></svg>
}

export function PixIcon({ size = 20, ...p }: P) {
  return (
    <svg {...base(size)} {...p}><path d="M7.200 6.500c1 0 2 .4 2.700 1.100l2.100 2.100 2.100-2.100a3.800 3.800 0 0 1 2.700-1.100h.3M7.200 17.500c1 0 2-.4 2.700-1.100l2.100-2.100 2.100 2.100a3.800 3.800 0 0 0 2.700 1.100h.3M3.500 12l3.300-3.300M3.500 12l3.300 3.300M20.500 12l-3.300-3.300M20.500 12l-3.300 3.300" /></svg>
  )
}
