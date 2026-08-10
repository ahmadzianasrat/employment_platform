import hamqarIcon from '../../assets/hamqar-icon.png';

export function BrandMark({ className = '' }: { className?: string }) {
  return <img src={hamqarIcon} alt="" className={`object-contain ${className}`} aria-hidden="true" />;
}
