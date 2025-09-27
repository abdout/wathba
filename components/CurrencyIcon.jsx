import Image from 'next/image';
import dirhamIcon from '@/assets/dirham.svg';

const CurrencyIcon = ({ className = "w-4 h-4 inline-block", width = 16, height = 16 }) => {
  return (
    <Image
      src={dirhamIcon}
      alt="AED"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

export default CurrencyIcon;